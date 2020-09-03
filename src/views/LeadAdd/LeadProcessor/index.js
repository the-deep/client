import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { isDefined } from '@togglecorp/fujs';
import produce from 'immer';
import { analyzeErrors } from '@togglecorp/faram';

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
    leadSourceTypeSelector,
    getNewLeadKey,
} from '../utils';

export const LeadProcessorContext = React.createContext({
    showProcessingModal: false,
    setProcessingModalVisibility: (processingModalVisibility) => {
        console.warn('setting processing modal visibility', processingModalVisibility);
    },
    candidateLeads: [],
    fileUploadStatuses: {},
    driveUploadStatuses: {},
    dropboxUploadStatuses: {},
    removeCandidateLead: (leadId) => {
        console.warn('removing lead with id', leadId);
    },
    clearCandidateLeads: () => {
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
    const [fileUploadStatuses, setFileUploadStatues] = useState({});
    const [driveUploadStatuses, setDriveUploadStatues] = useState({});
    const [dropboxUploadStatuses, setDropboxUploadStatues] = useState({});

    const clearCandidateLeads = useCallback(() => {
        setCandidateLeads([]);
    }, [setCandidateLeads]);

    const {
        uploadCoordinator,
        driveUploadCoordinator,
        dropboxUploadCoordinator,
    } = useMemo(() => {
        const newUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .build();

        const newDriveUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .build();

        const newDropboxUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .build();

        return {
            uploadCoordinator: newUploadCoordinator,
            driveUploadCoordinator: newDriveUploadCoordinator,
            dropboxUploadCoordinator: newDropboxUploadCoordinator,
        };
    }, []);

    const handleFileUploadProgressChange = useCallback((key, progress) => {
        setFileUploadStatues(currentFileUploadStatues => ({
            ...currentFileUploadStatues,
            [key]: { progress },
        }));
        setCandidateLeads(currentCandidateLeads => (
            produce(currentCandidateLeads, (safeCandidateLeads) => {
                const currentLeadIndex = safeCandidateLeads
                    .findIndex(lead => leadKeySelector(lead) === key);
                if (currentLeadIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[currentLeadIndex].leadState = (progress === 100)
                        ? LEAD_STATUS.complete : LEAD_STATUS.uploading;
                }
            })
        ));
    }, [setFileUploadStatues, setCandidateLeads]);

    const handleDropboxUploadPendingChange = useCallback((key, pending) => {
        setDropboxUploadStatues(currentDropboxUploadStatues => ({
            ...currentDropboxUploadStatues,
            [key]: { pending },
        }));
    }, [setDropboxUploadStatues]);

    const handleDriveUploadPendingChange = useCallback((key, pending) => {
        setDriveUploadStatues(currentDriveUploadStatuses => ({
            ...currentDriveUploadStatuses,
            [key]: { pending },
        }));
        setCandidateLeads(currentCandidateLeads => (
            produce(currentCandidateLeads, (safeCandidateLeads) => {
                const currentLeadIndex = safeCandidateLeads
                    .findIndex(lead => leadKeySelector(lead) === key);
                if (currentLeadIndex !== -1 && pending) {
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[currentLeadIndex].leadState = LEAD_STATUS.uploading;
                }
            })
        ));
    }, [setDriveUploadStatues]);

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

    const handleCandidateLeadAttachmentSet = useCallback(({ leadKey, attachmentId }) => {
        setCandidateLeads(currentCandidateLeads => (
            produce(currentCandidateLeads, (safeCandidateLeads) => {
                const selectedIndex = safeCandidateLeads
                    .findIndex(lead => leadKey === leadKeySelector(lead));

                if (selectedIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[selectedIndex].faramValues.attachment = {
                        id: attachmentId,
                    };
                }
            })
        ));
    }, [setCandidateLeads]);

    const handleCandidateLeadFaramErrorsChange = useCallback(({ leadKey, faramErrors }) => {
        setCandidateLeads(currentCandidateLeads => (
            produce(currentCandidateLeads, (safeCandidateLeads) => {
                const selectedIndex = safeCandidateLeads
                    .findIndex(lead => leadKey === leadKeySelector(lead));

                if (selectedIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[selectedIndex].faramErrors = faramErrors;
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[selectedIndex].faramInfo.error = analyzeErrors(faramErrors);
                    // eslint-disable-next-line no-param-reassign
                    safeCandidateLeads[selectedIndex].leadState = LEAD_STATUS.error;
                }
            })
        ));
    }, [setCandidateLeads]);

    const addCandidateLeads = useCallback((leads) => {
        if (leads.length < 1) {
            return;
        }
        const newLeads = leads.map((leadInfo) => {
            const {
                faramValues,
                serverId,
                file,
                drive,
                dropbox,
            } = leadInfo;

            const key = getNewLeadKey();

            const newLead = {
                id: key,
                serverId,
                faramValues: {
                    title: `Lead ${(new Date()).toLocaleTimeString()}`,
                    ...faramValues,
                },
                faramErrors: {},
                faramInfo: {
                    error: false,
                    pristine: isDefined(serverId),
                },
                leadState: LEAD_STATUS.pristine,
            };

            const leadType = leadSourceTypeSelector(newLead);
            if (leadType === LEAD_TYPE.file) {
                const request = new UploadBuilder()
                    .file(file)
                    .url(urlForUpload)
                    .params(createParamsForFileUpload)
                    .preLoad(() => {
                        handleFileUploadProgressChange(key, 0);
                    })
                    .progress((progress) => {
                        // NOTE: set progress to 100 only after attachment is received
                        handleFileUploadProgressChange(key, Math.min(99, progress));
                    })
                    .success((response) => {
                        const { id: attachment } = response;

                        handleCandidateLeadAttachmentSet({
                            leadKey: key,
                            attachmentId: attachment,
                        });
                        handleFileUploadProgressChange(key, 100);
                        uploadCoordinator.notifyComplete(key);
                    })
                    .failure((response) => {
                        handleFileUploadProgressChange(key, undefined);
                        handleCandidateLeadFaramErrorsChange({
                            leadKey: key,
                            faramErrors: {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                                ],
                            },
                        });
                        uploadCoordinator.notifyComplete(key, true);
                    })
                    .fatal(() => {
                        handleFileUploadProgressChange(key, undefined);
                        handleCandidateLeadFaramErrorsChange({
                            leadKey: key,
                            faramErrors: {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')}`,
                                ],
                            },
                        });
                        uploadCoordinator.notifyComplete(key, true);
                    })
                    .build();

                // NOTE: set progress to 0 initially, as pre-load may not be
                // called until it's turn comes up in queue
                handleFileUploadProgressChange(key, 0);

                uploadCoordinator.add(key, request);
            } else if (leadType === LEAD_TYPE.drive) {
                const { title, accessToken, fileId, mimeType } = drive;
                const request = new FgRestBuilder()
                    .url(urlForGoogleDriveFileUpload)
                    .params(() => createHeaderForGoogleDriveFileUpload({
                        title, accessToken, fileId, mimeType,
                    }))
                    .delay(0)
                    .preLoad(() => {
                        handleDriveUploadPendingChange(key, true);
                    })
                    .success((response) => {
                        const { id: attachment } = response;

                        handleCandidateLeadAttachmentSet({
                            leadKey: key,
                            attachmentId: attachment,
                        });
                        handleDriveUploadPendingChange(key, undefined);
                        driveUploadCoordinator.notifyComplete(key);
                    })
                    .failure((response) => {
                        handleDriveUploadPendingChange(key, undefined);

                        handleCandidateLeadFaramErrorsChange({
                            leadKey: key,
                            faramErrors: {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                                ],
                            },
                        });

                        driveUploadCoordinator.notifyComplete(key, true);
                    })
                    .fatal(() => {
                        handleDriveUploadPendingChange(key, undefined);

                        handleCandidateLeadFaramErrorsChange({
                            leadKey: key,
                            faramErrors: {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')}`,
                                ],
                            },
                        });

                        driveUploadCoordinator.notifyComplete(key, true);
                    })
                    .build();

                // NOTE: set pending to true initially, as pre-load may not be
                // called until it's turn comes up in queue
                handleDriveUploadPendingChange(key, true);

                driveUploadCoordinator.add(key, request);
            } else if (leadType === LEAD_TYPE.dropbox) {
                const { title, fileUrl } = dropbox;
                const request = new FgRestBuilder()
                    .url(urlForDropboxFileUpload)
                    .params(createHeaderForDropboxUpload({ title, fileUrl }))
                    .delay(0)
                    .preLoad(() => {
                        handleDropboxUploadPendingChange(key, true);
                    })
                    .success((response) => {
                        const { id: attachment } = response;

                        handleCandidateLeadAttachmentSet({
                            leadKey: key,
                            attachmentId: attachment,
                        });
                        handleDropboxUploadPendingChange(key, undefined);
                        dropboxUploadCoordinator.notifyComplete(key);
                    })
                    .failure((response) => {
                        handleDropboxUploadPendingChange(key, undefined);

                        handleCandidateLeadFaramErrorsChange({
                            leadKey: key,
                            faramErrors: {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                                ],
                            },
                        });

                        dropboxUploadCoordinator.notifyComplete(key, true);
                    })
                    .fatal(() => {
                        handleDropboxUploadPendingChange(key, undefined);

                        handleCandidateLeadFaramErrorsChange({
                            leadKey: key,
                            faramErrors: {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')}`,
                                ],
                            },
                        });

                        dropboxUploadCoordinator.notifyComplete(key, true);
                    })
                    .build();

                // NOTE: set pending to true initially, as pre-load may not be
                // called until it's turn comes up in queue
                handleDropboxUploadPendingChange(key, true);
                dropboxUploadCoordinator.add(key, request);
            }

            return newLead;
        });
        setCandidateLeads(currentCandidateLeads => ([
            ...currentCandidateLeads,
            ...newLeads,
        ]));
        setProcessingModalVisibility(true);
        uploadCoordinator.start();
        driveUploadCoordinator.start();
        dropboxUploadCoordinator.start();
    }, [
        handleCandidateLeadFaramErrorsChange,
        handleCandidateLeadAttachmentSet,
        handleFileUploadProgressChange,
        driveUploadCoordinator,
        handleDropboxUploadPendingChange,
        handleDriveUploadPendingChange,
        dropboxUploadCoordinator,
        uploadCoordinator,
        setCandidateLeads,
        setProcessingModalVisibility,
    ]);

    const contextValue = useMemo(() => ({
        clearCandidateLeads,
        fileUploadStatuses,
        driveUploadStatuses,
        dropboxUploadStatuses,
        candidateLeads,
        addCandidateLeads,
        removeCandidateLead,

        showProcessingModal,
        setProcessingModalVisibility,
    }), [
        clearCandidateLeads,
        driveUploadStatuses,
        dropboxUploadStatuses,
        fileUploadStatuses,
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
