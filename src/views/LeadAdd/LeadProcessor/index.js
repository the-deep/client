import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import produce from 'immer';

import { CoordinatorBuilder } from '#rsu/coordinate';
import { FgRestBuilder } from '#rsu/rest';
import { UploadBuilder } from '#rsu/upload';

import {
    urlForUpload,
    createParamsForFileUpload,
    urlForGoogleDriveFileUpload,
    createHeaderForGoogleDriveFileUpload,
    urlForDropboxFileUpload,
    createHeaderForDropboxUpload,
} from '#rest';
import _ts from '#ts';

import {
    LEAD_STATUS,
    LEAD_TYPE,
    leadKeySelector,
} from '../utils';

export const LeadProcessorContext = React.createContext({
    showProcessingModal: false,
    setProcessingModalVisibility: (processingModalVisibility) => {
        console.warn('setting processing modal visibility', processingModalVisibility);
    },
    candidateLeads: [],
    removeCandidateLead: (leadId) => {
        console.warn('removing lead with id', leadId);
    },
    clearCandidateLeads: () => {
        console.warn('clearing all candidate leads');
    },
    clearCompletedCandidateLeads: () => {
        console.warn('clearing all candidate leads');
    },
    addCandidateLeads: (newLeads) => {
        console.warn('adding new leads', newLeads);
    },
});

function LeadProcessor(props) {
    const {
        children,
    } = props;

    const [candidateLeads, setCandidateLeads] = useState([]);
    const [showProcessingModal, setProcessingModalVisibility] = useState(false);

    const clearCandidateLeads = useCallback(() => {
        setCandidateLeads([]);
    }, [setCandidateLeads]);

    const clearCompletedCandidateLeads = useCallback(() => {
        setCandidateLeads(items => (
            items.filter(item => item.leadState !== LEAD_STATUS.complete)
        ));
    }, [setCandidateLeads]);

    const uploadCoordinator = useMemo(() => (
        new CoordinatorBuilder()
            .maxActiveActors(3)
            .build()
    ), []);

    const handleUploadProgressChange = useCallback((key, progress = -1) => {
        setCandidateLeads(currentCandidateLeads => (
            produce(currentCandidateLeads, (safeCandidateLeads) => {
                const currentLeadIndex = safeCandidateLeads
                    .findIndex(lead => leadKeySelector(lead) === key);
                if (currentLeadIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[currentLeadIndex].progress = progress;
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[currentLeadIndex].leadState = LEAD_STATUS.uploading;
                }
            })
        ));
    }, [setCandidateLeads]);

    const handleUploadSuccess = useCallback(({ leadKey, attachment }) => {
        uploadCoordinator.notifyComplete(leadKey);
        setCandidateLeads(currentCandidateLeads => (
            produce(currentCandidateLeads, (safeCandidateLeads) => {
                const selectedIndex = safeCandidateLeads
                    .findIndex(lead => leadKey === leadKeySelector(lead));

                const {
                    id,
                    file,
                } = attachment;

                // "https://s3.amazonaws.com/nightly.thedeep.io/media/gallery/typography.pdf"

                const startToken = '/media/gallery/';
                // NOTE: search treats string as regex
                const endToken = '\\?';

                const startIndex = file.search(startToken);
                const endIndex = file.search(endToken);

                let s3;
                if (startIndex !== -1 && endIndex !== -1) {
                    s3 = `gallery/${file.slice(startIndex + startToken.length, endIndex)}`;
                }
                if (selectedIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[selectedIndex].progress = undefined;
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[selectedIndex].data.attachment = {
                        id,
                        s3,
                    };
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[selectedIndex].leadState = LEAD_STATUS.complete;
                }
            })
        ));
    }, [setCandidateLeads, uploadCoordinator]);

    const handleUploadFailure = useCallback(({ leadKey, error }) => {
        uploadCoordinator.notifyComplete(leadKey, true);
        setCandidateLeads(currentCandidateLeads => (
            produce(currentCandidateLeads, (safeCandidateLeads) => {
                const selectedIndex = safeCandidateLeads
                    .findIndex(lead => leadKey === leadKeySelector(lead));

                if (selectedIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[selectedIndex].progress = undefined;
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[selectedIndex].error = error;
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[selectedIndex].leadState = LEAD_STATUS.error;
                }
            })
        ));
    }, [setCandidateLeads, uploadCoordinator]);

    const removeCandidateLead = useCallback((leadKey) => {
        setCandidateLeads((currentCandidateLeads) => {
            const newCandidateLeads = [...currentCandidateLeads];
            const selectedIndex = newCandidateLeads
                .findIndex(lead => leadKey === leadKeySelector(lead));

            if (selectedIndex !== -1) {
                newCandidateLeads.splice(selectedIndex, 1);
            }
            return newCandidateLeads;
        });
    }, [setCandidateLeads]);

    const addCandidateLeads = useCallback((leads) => {
        if (leads.length < 1) {
            return;
        }

        function getInitialState(sourceType) {
            // NOTE: pristine means pending here
            return [LEAD_TYPE.file, LEAD_TYPE.dropbox, LEAD_STATUS.drive].includes(sourceType)
                ? LEAD_STATUS.pristine
                : LEAD_STATUS.complete;
        }

        const newCandidateLeads = leads.map((lead) => {
            const {
                key,
                serverId,
                data,
            } = lead;

            return {
                id: key,
                serverId,
                data: {
                    // NOTE: just add a title if we don't have one
                    title: `Lead ${(new Date()).toLocaleTimeString()}`,
                    ...data,
                },
                progress: undefined,
                error: undefined,
                leadState: getInitialState(data.sourceType),
            };
        });

        const uploadRequests = leads.map((lead) => {
            const {
                key,
                data: { sourceType: leadType },

                file,
                drive,
                dropbox,
            } = lead;

            let request;
            if (leadType === LEAD_TYPE.file) {
                request = new UploadBuilder()
                    .file(file)
                    .url(urlForUpload)
                    .params(createParamsForFileUpload)
                    .preLoad(() => {
                        handleUploadProgressChange(key, 0);
                    })
                    .progress((progress) => {
                        // NOTE: set progress to 100 only after attachment is received
                        handleUploadProgressChange(key, Math.min(99, progress));
                    })
                    .success((response) => {
                        handleUploadSuccess({
                            leadKey: key,
                            attachment: response,
                        });
                    })
                    .failure((response) => {
                        handleUploadFailure({
                            leadKey: key,
                            error: `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                        });
                    })
                    .fatal(() => {
                        handleUploadFailure({
                            leadKey: key,
                            error: `${_ts('addLeads', 'fileUploadFailText')}`,
                        });
                    })
                    .build();
            } else if (leadType === LEAD_TYPE.drive) {
                const { title, accessToken, fileId, mimeType } = drive;
                request = new FgRestBuilder()
                    .url(urlForGoogleDriveFileUpload)
                    .params(() => createHeaderForGoogleDriveFileUpload({
                        title, accessToken, fileId, mimeType,
                    }))
                    .delay(0)
                    .preLoad(() => {
                        handleUploadProgressChange(key);
                    })
                    .success((response) => {
                        handleUploadSuccess({
                            leadKey: key,
                            attachment: response,
                        });
                    })
                    .failure((response) => {
                        handleUploadFailure({
                            leadKey: key,
                            error: `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                        });
                    })
                    .fatal(() => {
                        handleUploadFailure({
                            leadKey: key,
                            error: `${_ts('addLeads', 'fileUploadFailText')}`,
                        });
                    })
                    .build();
            } else if (leadType === LEAD_TYPE.dropbox) {
                const { title, fileUrl } = dropbox;
                request = new FgRestBuilder()
                    .url(urlForDropboxFileUpload)
                    .params(createHeaderForDropboxUpload({ title, fileUrl }))
                    .delay(0)
                    .preLoad(() => {
                        handleUploadProgressChange(key);
                    })
                    .success((response) => {
                        handleUploadSuccess({
                            leadKey: key,
                            attachmentId: response,
                        });
                    })
                    .failure((response) => {
                        handleUploadFailure({
                            leadKey: key,
                            error: `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                        });
                    })
                    .fatal(() => {
                        handleUploadFailure({
                            leadKey: key,
                            error: `${_ts('addLeads', 'fileUploadFailText')}`,
                        });
                    })
                    .build();
            }
            return { key, request };
        });

        setProcessingModalVisibility(true);
        setCandidateLeads(currentCandidateLeads => ([
            ...currentCandidateLeads,
            ...newCandidateLeads,
        ]));

        uploadRequests.forEach(({ key, request }) => {
            if (request) {
                uploadCoordinator.add(key, request);
            }
        });
        uploadCoordinator.start();
    }, [
        handleUploadFailure,
        handleUploadSuccess,
        handleUploadProgressChange,
        uploadCoordinator,
        setCandidateLeads,
        setProcessingModalVisibility,
    ]);

    const contextValue = useMemo(() => ({
        clearCandidateLeads,
        clearCompletedCandidateLeads,
        candidateLeads,
        addCandidateLeads,
        removeCandidateLead,

        showProcessingModal,
        setProcessingModalVisibility,
    }), [
        clearCandidateLeads,
        clearCompletedCandidateLeads,
        candidateLeads,
        addCandidateLeads,
        removeCandidateLead,

        showProcessingModal,
        setProcessingModalVisibility,
    ]);

    return (
        <LeadProcessorContext.Provider
            value={contextValue}
        >
            {children}
        </LeadProcessorContext.Provider>
    );
}

LeadProcessor.propTypes = {
    children: PropTypes.node.isRequired,
};

export default LeadProcessor;
