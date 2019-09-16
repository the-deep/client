import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import produce from 'immer';
import memoize from 'memoize-one';
import {
    isDefined,
    isNotDefined,
    reverseRoute,
    getDefinedElementAround,
    _cs,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    accumulateDifferentialErrors,
    analyzeErrors,
    detachedFaram,
} from '@togglecorp/faram';

import { CoordinatorBuilder } from '#rsu/coordinate';
import { UploadBuilder } from '#rsu/upload';
import { FgRestBuilder } from '#rsu/rest';
import ResizableV from '#rscv/Resizable/ResizableV';
import Message from '#rscv/Message';
import Page from '#rscv/Page';


import LeadCopyModal from '#components/general/LeadCopyModal';
import { pathNames } from '#constants';
import Cloak from '#components/general/Cloak';
import BackLink from '#components/general/BackLink';

import { RequestCoordinator } from '#request';
import {
    routeStateSelector,
    routeUrlSelector,
    projectIdFromRouteSelector,
    currentUserLeadChangeableProjectsSelector,
    activeUserSelector,
} from '#redux';
import {
    urlForUpload,
    createParamsForFileUpload,
    urlForGoogleDriveFileUpload,
    createHeaderForGoogleDriveFileUpload,
    urlForDropboxFileUpload,
    createHeaderForDropboxUpload,
    createUrlForLeadEdit,
    urlForLead,
    createParamsForLeadEdit,
    createParamsForLeadCreate,

    alterResponseErrorToFaramError,
} from '#rest';
import notify from '#notify';
import _ts from '#ts';

import LeadButtons from './LeadButtons';
import LeadPreview from './LeadPreview';
import LeadActions from './LeadActions';
import LeadList from './LeadList';
import LeadFilter from './LeadFilter';
import LeadDetail from './LeadDetail';
import schema from './LeadDetail/faramSchema';

import {
    leadKeySelector,
    leadIdSelector,
    leadFaramValuesSelector,
    leadFaramErrorsSelector,
    leadSourceTypeSelector,
    LEAD_TYPE,
    getLeadState,
    fakeLeads,

    isLeadSaveDisabled,
} from './utils';
import styles from './styles.scss';


const mapStateToProps = state => ({
    routeUrl: routeUrlSelector(state),
    routeState: routeStateSelector(state),
    projectId: projectIdFromRouteSelector(state),
    projects: currentUserLeadChangeableProjectsSelector(state),
    activeUser: activeUserSelector(state),
});

const propTypes = {
    routeUrl: PropTypes.string.isRequired,
    projectId: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    projects: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    routeState: PropTypes.object.isRequired,

    location: PropTypes.shape({
        path: PropTypes.string,
    }).isRequired,
    history: PropTypes.shape({
        replace: PropTypes.func,
    }).isRequired,
};

const defaultProps = {
    projectId: undefined,
    projects: [],
};

function findLeadIndex(leads, activeLeadKey) {
    if (leads.length <= 0 || isNotDefined(activeLeadKey)) {
        return -1;
    }
    const index = leads.findIndex(lead => activeLeadKey === leadKeySelector(lead));
    return index;
}

function isLeadPrevDisabled(leads, activeLeadKey) {
    const index = findLeadIndex(leads, activeLeadKey);
    return index === -1 || index === 0;
}

function isLeadNextDisabled(leads, activeLeadKey) {
    const index = findLeadIndex(leads, activeLeadKey);
    return index === -1 || index === (leads.length - 1);
}

function getNewLeadKey(prefix = 'lead') {
    const uid = randomString();
    return `${prefix}-${uid}`;
}

class LeadCreate extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static shouldHideButtons = ({ leadPermissions }) => !leadPermissions.create;

    constructor(props) {
        super(props);

        this.state = {
            activeLeadKey: undefined,
            leadFilters: {},
            leadPreviewHidden: false,
            leads: fakeLeads,

            leadSaveStatuses: {},
            fileUploadStatuses: {},
            driveUploadStatuses: {},
            dropboxUploadStatuses: {},

            submitAllPending: false,

            leadsToExport: [],
            leadExportModalShown: false,
        };

        this.formCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .preSession(() => {
                this.setState({ submitAllPending: true });
            })
            .postSession((totalErrors) => {
                if (totalErrors > 0) {
                    notify.send({
                        title: _ts('addLeads', 'leadSave'),
                        type: notify.type.ERROR,
                        message: _ts('addLeads', 'leadSaveFailure', { errorCount: totalErrors }),
                        duration: notify.duration.SLOW,
                    });
                } else {
                    notify.send({
                        title: _ts('addLeads', 'leadSave'),
                        type: notify.type.SUCCESS,
                        message: _ts('addLeads', 'leadSaveSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                }
                this.setState({ submitAllPending: false });
            })
            .build();
        this.uploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .build();
        this.driveUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .build();
        this.dropboxUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .build();
    }

    componentDidMount() {
        const { routeState } = this.props;
        const { serverId, faramValues } = routeState;
        if (isDefined(serverId)) {
            const lead = {
                faramValues,
                serverId,
            };
            this.handleLeadsAdd([lead]);

            // NOTE:
            // location.state is not cleared on replace so you lose your
            // progress for the lead that was added as edit
            // So clear location.state
            const {
                location: {
                    path,
                },
                history,
            } = this.props;
            history.replace(path, {});
        }
    }


    // redux
    getDefaultProjectId = memoize((projects, projectId) => {
        const defaultProjectId = projects.find(project => project.id === projectId)
            ? projectId
            : undefined;
        return defaultProjectId;
    })

    // redux
    getActiveLead = memoize((activeLeadKey, leads) => (
        isDefined(activeLeadKey)
            ? leads.find(lead => leadKeySelector(lead) === activeLeadKey)
            : undefined
    ))

    // local
    getLeadStates = memoize((
        leads,
        driveUploadStatuses,
        dropboxUploadStatuses,
        fileUploadStatuses,
        leadSaveStatuses,
    ) => (
        listToMap(
            leads,
            leadKeySelector,
            (lead, key) => (
                getLeadState(
                    lead,
                    {
                        fileUploadStatus: fileUploadStatuses[key],
                        leadSaveStatus: leadSaveStatuses[key],
                        driveUploadStatus: driveUploadStatuses[key],
                        dropboxUploadStatus: dropboxUploadStatuses[key],
                    },
                )
            ),
        )
    ));

    // LEAD CREATION PROGRESS

    // local
    handleFileUploadProgressChange = (key, progress) => {
        this.setState(state => ({
            fileUploadStatuses: {
                ...state.fileUploadStatuses,
                [key]: { progress },
            },
        }));
    };

    // local
    handleDropboxUploadPendingChange = (key, pending) => {
        this.setState(state => ({
            dropboxUploadStatuses: {
                ...state.dropboxUploadStatuses,
                [key]: { pending },
            },
        }));
    };

    // local
    handleDriveUploadPendingChange = (key, pending) => {
        this.setState(state => ({
            driveUploadStatuses: {
                ...state.driveUploadStatuses,
                [key]: { pending },
            },
        }));
    };

    // LEAD SAVE PROGRESS

    // local
    handleLeadSavePendingChange = (key, pending) => {
        this.setState(state => ({
            leadSaveStatuses: {
                ...state.leadSaveStatuses,
                [key]: { pending },
            },
        }));
    };

    // LEAD PREVIEW

    // redux
    handleLeadPreviewHiddenChange = (value) => {
        this.setState({
            leadPreviewHidden: value,
        });
    }

    // LEAD FILTER

    // redux
    handleFilterChange = (filters) => {
        this.setState({ leadFilters: filters });
    }

    // redux
    handleFilterClear = () => {
        this.setState({ leadFilters: {} });
    }

    // LEAD SELECTION

    // redux
    handleLeadSelect = (key) => {
        this.setState({ activeLeadKey: key });
    }

    // redux
    handleLeadPrev = () => {
        const {
            leads,
            activeLeadKey,
        } = this.state;

        const index = findLeadIndex(leads, activeLeadKey);
        if (index === -1 || index === 0) {
            return;
        }
        const newLead = leads[index - 1];
        const newLeadKey = leadKeySelector(newLead);
        this.setState({
            activeLeadKey: newLeadKey,
        });
    }

    // redux
    handleLeadNext = () => {
        const {
            leads,
            activeLeadKey,
        } = this.state;

        const index = findLeadIndex(leads, activeLeadKey);
        if (index === -1 || index === leads.length - 1) {
            return;
        }
        const newLead = leads[index + 1];
        const newLeadKey = leadKeySelector(newLead);
        this.setState({
            activeLeadKey: newLeadKey,
        });
    }

    // LEAD MANIPULATION

    // local
    handleLeadsAdd = (leadsInfo) => {
        const {
            projectId,
            projects,
        } = this.props;

        const defaultProjectId = this.getDefaultProjectId(projects, projectId);

        const newLeads = leadsInfo.map((leadInfo) => {
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
                    project: defaultProjectId,
                    ...faramValues,
                },
                faramErrors: {},
                faramInfo: {
                    error: false,
                    pristine: isDefined(serverId),
                },
            };

            // Only call request for new leads
            if (isNotDefined(serverId)) {
                const leadType = leadSourceTypeSelector(newLead);
                if (leadType === LEAD_TYPE.file) {
                    const request = new UploadBuilder()
                        .file(file)
                        .url(urlForUpload)
                        .params(createParamsForFileUpload)
                        .preLoad(() => {
                            this.handleFileUploadProgressChange(key, 0);
                        })
                        .progress((progress) => {
                            // NOTE: set progress to 100 only after attachment is received
                            this.handleFileUploadProgressChange(key, Math.min(99, progress));
                        })
                        .success((response) => {
                            const { id: attachment } = response;

                            this.handleAttachmentSet(key, attachment);
                            this.handleFileUploadProgressChange(key, 100);
                            this.uploadCoordinator.notifyComplete(key);
                        })
                        .failure((response) => {
                            this.handleFileUploadProgressChange(key, undefined);
                            this.handleLeadChange(key, undefined, {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                                ],
                            });
                            this.uploadCoordinator.notifyComplete(key, true);
                        })
                        .fatal(() => {
                            this.handleFileUploadProgressChange(key, undefined);
                            this.handleLeadChange(key, undefined, {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')}`,
                                ],
                            });
                            this.uploadCoordinator.notifyComplete(key, true);
                        })
                        .build();

                    // NOTE: set progress to 0 initially, as pre-load may not be
                    // called until it's turn comes up in queue
                    this.handleFileUploadProgressChange(key, 0);

                    this.uploadCoordinator.add(key, request);
                } else if (leadType === LEAD_TYPE.drive) {
                    const { title, accessToken, fileId, mimeType } = drive;
                    const request = new FgRestBuilder()
                        .url(urlForGoogleDriveFileUpload)
                        .params(() => createHeaderForGoogleDriveFileUpload({
                            title, accessToken, fileId, mimeType,
                        }))
                        .delay(0)
                        .preLoad(() => {
                            this.handleDriveUploadPendingChange(key, true);
                        })
                        .success((response) => {
                            const { id: attachment } = response;

                            this.handleAttachmentSet(key, attachment);
                            this.handleDriveUploadPendingChange(key, undefined);
                            this.driveUploadCoordinator.notifyComplete(key);
                        })
                        .failure((response) => {
                            this.handleDriveUploadPendingChange(key, undefined);
                            this.handleLeadChange(key, undefined, {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                                ],
                            });
                            this.driveUploadCoordinator.notifyComplete(key, true);
                        })
                        .fatal(() => {
                            this.handleDriveUploadPendingChange(key, undefined);
                            this.handleLeadChange(key, undefined, {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')}`,
                                ],
                            });
                            this.driveUploadCoordinator.notifyComplete(key, true);
                        })
                        .build();

                    // NOTE: set pending to true initially, as pre-load may not be
                    // called until it's turn comes up in queue
                    this.handleDriveUploadPendingChange(key, true);

                    this.driveUploadCoordinator.add(key, request);
                } else if (leadType === LEAD_TYPE.dropbox) {
                    const { title, fileUrl } = dropbox;
                    const request = new FgRestBuilder()
                        .url(urlForDropboxFileUpload)
                        .params(createHeaderForDropboxUpload({ title, fileUrl }))
                        .delay(0)
                        .preLoad(() => {
                            this.handleDropboxUploadPendingChange(key, true);
                        })
                        .success((response) => {
                            const { id: attachment } = response;

                            this.handleAttachmentSet(key, attachment);
                            this.handleDropboxUploadPendingChange(key, undefined);
                            this.dropboxUploadCoordinator.notifyComplete(key);
                        })
                        .failure((response) => {
                            this.handleDropboxUploadPendingChange(key, undefined);
                            this.handleLeadChange(key, undefined, {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                                ],
                            });
                            this.dropboxUploadCoordinator.notifyComplete(key, true);
                        })
                        .fatal(() => {
                            this.handleDropboxUploadPendingChange(key, undefined);
                            this.handleLeadChange(key, undefined, {
                                $internal: [
                                    `${_ts('addLeads', 'fileUploadFailText')}`,
                                ],
                            });
                            this.dropboxUploadCoordinator.notifyComplete(key, true);
                        })
                        .build();

                    // NOTE: set pending to true initially, as pre-load may not be
                    // called until it's turn comes up in queue
                    this.handleDropboxUploadPendingChange(key, true);

                    this.dropboxUploadCoordinator.add(key, request);
                }
            }

            return newLead;
        });

        this.handleAppendLeads(newLeads);
    }

    // redux
    handleAppendLeads = (newLeads) => {
        this.setState((state) => {
            const { leads } = state;

            const activeLeadKey = leadKeySelector(newLeads[newLeads.length - 1]);

            return {
                leads: [...leads, ...newLeads],
                activeLeadKey,
            };
        }, () => {
            this.uploadCoordinator.start();
            this.driveUploadCoordinator.start();
            this.dropboxUploadCoordinator.start();
        });
    }

    // local
    handleLeadSave = (key) => {
        this.handleLeadsSave([key]);
    }

    // local
    handleLeadsSave = (leadKeys) => {
        leadKeys.forEach((leadKey) => {
            const { leads } = this.state;
            const lead = leads.find(l => leadKeySelector(l) === leadKey);
            if (!lead) {
                console.error('Lead not found by id', leadKey);
                return;
            }

            this.formCoordinator.add(
                leadKey,
                {
                    start: () => {
                        const serverId = leadIdSelector(lead);
                        const value = leadFaramValuesSelector(lead);
                        detachedFaram({
                            value,
                            schema,
                            onValidationFailure: (faramErrors) => {
                                this.handleLeadChange(leadKey, undefined, faramErrors);
                                this.formCoordinator.notifyComplete(leadKey, true);
                            },
                            onValidationSuccess: (faramValues) => {
                                let url;
                                let params;
                                if (serverId) {
                                    url = createUrlForLeadEdit(serverId);
                                    params = () => createParamsForLeadEdit(faramValues);
                                } else {
                                    url = urlForLead;
                                    params = () => createParamsForLeadCreate(faramValues);
                                }

                                const request = new FgRestBuilder()
                                    .url(url)
                                    .params(params)
                                    .delay(0)
                                    .preLoad(() => {
                                        this.handleLeadSavePendingChange(leadKey, true);
                                    })
                                    .success((response) => {
                                        this.handleLeadSavePendingChange(leadKey, false);
                                        this.handleLeadSaveChange(leadKey, response);
                                        this.formCoordinator.notifyComplete(leadKey);
                                    })
                                    .failure((response) => {
                                        const faramErrors = alterResponseErrorToFaramError(
                                            response.errors,
                                        );
                                        this.handleLeadChange(
                                            leadKey,
                                            undefined,
                                            faramErrors,
                                        );
                                        this.handleLeadSavePendingChange(leadKey, false);
                                        this.formCoordinator.notifyComplete(leadKey, true);
                                    })
                                    .fatal(() => {
                                        this.handleLeadChange(
                                            leadKey,
                                            undefined,
                                            { $internal: ['Error while trying to save lead.'] },
                                        );
                                        this.handleLeadSavePendingChange(leadKey, false);
                                        this.formCoordinator.notifyComplete(leadKey, true);
                                    })
                                    .build();
                                request.start();
                            },
                        });
                    },
                    stop: () => {
                        // No-op
                    },
                },
            );
        });
        this.formCoordinator.start();
    }

    // redux
    handleLeadsRemove = (leadKeys) => {
        this.setState((state) => {
            const {
                leads,
                activeLeadKey,
            } = state;

            const leadKeysMapping = listToMap(
                leadKeys,
                item => item,
                () => true,
            );

            const mappedLeads = leads.map(
                lead => (leadKeysMapping[leadKeySelector(lead)] ? undefined : lead),
            );

            const filteredLeads = mappedLeads.filter(isDefined);

            let newActiveLeadKey;
            if (filteredLeads.find(lead => leadKeySelector(lead) === activeLeadKey)) {
                newActiveLeadKey = activeLeadKey;
            } else {
                const leadIndex = leads.findIndex(
                    lead => leadKeySelector(lead) === activeLeadKey,
                );
                const newActiveLead = getDefinedElementAround(mappedLeads, leadIndex);
                if (newActiveLead) {
                    newActiveLeadKey = leadKeySelector(newActiveLead);
                }
            }

            return {
                leads: filteredLeads,
                activeLeadKey: newActiveLeadKey,
            };
        });
    }

    // local
    handleLeadRemove = (leadKey) => {
        this.handleLeadsRemove([leadKey]);
    }

    // redux
    handleTabularBookSet = (leadKey, tabularBook) => {
        const {
            leads,
        } = this.state;
        const index = findLeadIndex(leads, leadKey);
        if (index === -1) {
            console.error(`Lead with key ${leadKey} not found during tabular set`);
            return;
        }
        this.setState(state => produce(state, (safeState) => {
            // eslint-disable-next-line no-param-reassign
            safeState.leads[index].tabularBook = tabularBook;
        }));
    }

    // redux
    handleAttachmentSet = (leadKey, attachmentId) => {
        const {
            leads,
        } = this.state;
        const index = findLeadIndex(leads, leadKey);
        if (index === -1) {
            console.error(`Lead with key ${leadKey} not found during attachment set`);
            return;
        }
        this.setState(state => produce(state, (safeState) => {
            // eslint-disable-next-line no-param-reassign
            safeState.leads[index].faramValues.attachment = {
                id: attachmentId,
            };
        }));
    }

    // redux
    handleLeadChange = (leadKey, faramValues, faramErrors) => {
        const {
            leads,
        } = this.state;
        const index = findLeadIndex(leads, leadKey);
        if (index === -1) {
            console.error(`Lead with key ${leadKey} not found during lead change`);
            return;
        }
        this.setState(state => produce(state, (safeState) => {
            if (isDefined(faramValues)) {
                // eslint-disable-next-line no-param-reassign
                safeState.leads[index].faramValues = faramValues;
                // eslint-disable-next-line no-param-reassign
                safeState.leads[index].faramInfo.pristine = false;
            }

            // eslint-disable-next-line no-param-reassign
            safeState.leads[index].faramErrors = faramErrors;

            // eslint-disable-next-line no-param-reassign
            safeState.leads[index].faramInfo.error = analyzeErrors(faramErrors);
        }));
    }

    // redux
    handleLeadSaveChange = (leadKey, response) => {
        const {
            leads,
        } = this.state;
        const index = findLeadIndex(leads, leadKey);
        if (index === -1) {
            console.error(`Lead with key ${leadKey} not found during lead change`);
            return;
        }

        this.setState(state => produce(state, (safeState) => {
            // eslint-disable-next-line no-param-reassign
            safeState.leads[index].serverId = response.id;

            // eslint-disable-next-line no-param-reassign
            safeState.leads[index].faramErrors = {};

            // eslint-disable-next-line no-param-reassign
            safeState.leads[index].faramInfo.pristine = true;

            // eslint-disable-next-line no-param-reassign
            safeState.leads[index].faramInfo.error = false;
        }));
    }

    // redux
    handleLeadApply = (behavior, key, values, attrName, attrValue) => {
        this.setState((state) => {
            const oldLeads = state.leads;

            const newLeads = produce(oldLeads, (safeLeads) => {
                const leadIndex = safeLeads.findIndex(lead => leadKeySelector(lead) === key);
                const start = (behavior === 'below') ? (leadIndex + 1) : 0;
                for (let i = start; i < safeLeads.length; i += 1) {
                    const oldFaramValues = leadFaramValuesSelector(safeLeads[i]);
                    const oldFaramErrors = leadFaramErrorsSelector(safeLeads[i]);

                    if (
                        (
                            values.project === undefined
                            || oldFaramValues.project === undefined
                            || oldFaramValues.project !== values.project
                        ) && (
                            attrName === 'assignee'
                            || attrName === 'leadGroup'
                        )
                    ) {
                        // eslint-disable-next-line no-continue
                        continue;
                    }

                    if (oldFaramValues[attrName] === attrValue) {
                        // eslint-disable-next-line no-continue
                        continue;
                    }

                    const newFaramValues = {
                        ...oldFaramValues,
                        [attrName]: attrValue,
                    };

                    const newFaramErrors = accumulateDifferentialErrors(
                        oldFaramValues,
                        newFaramValues,
                        oldFaramErrors,
                        schema,
                    );

                    // eslint-disable-next-line no-param-reassign
                    safeLeads[i].faramValues = newFaramValues;

                    // eslint-disable-next-line no-param-reassign
                    safeLeads[i].faramErrors = newFaramErrors;

                    // eslint-disable-next-line no-param-reassign
                    safeLeads[i].faramInfo.pristine = false;

                    // eslint-disable-next-line no-param-reassign
                    safeLeads[i].faramInfo.error = analyzeErrors(newFaramErrors);
                }
            });

            return {
                leads: newLeads,
            };
        });
    }

    // local
    handleLeadApplyAllBelowClick = (key, values, attrName, attrValue) => {
        this.handleLeadApply('below', key, values, attrName, attrValue);
    }

    // local
    handleLeadApplyAllClick = (key, values, attrName, attrValue) => {
        this.handleLeadApply('all', key, values, attrName, attrValue);
    }

    // local
    handleLeadsExportCancel = () => {
        this.setState({
            leadExportModalShown: false,
            leadsToExport: [],
        });
    }

    // local
    handleLeadsExport = (leadIds) => {
        this.setState({
            leadExportModalShown: true,
            leadsToExport: leadIds,
        });
    }

    // local
    handleLeadExport = (leadId) => {
        this.handleLeadsExport([leadId]);
    }

    render() {
        const {
            projectId,
            projects,
            activeUser: {
                userId,
            },
        } = this.props;

        const {
            leads,
            activeLeadKey,
            leadFilters,
            leadPreviewHidden,

            leadSaveStatuses,
            fileUploadStatuses,
            driveUploadStatuses,
            dropboxUploadStatuses,

            submitAllPending,

            leadsToExport,
            leadExportModalShown,
        } = this.state;

        const leadStates = this.getLeadStates(
            leads,
            driveUploadStatuses,
            dropboxUploadStatuses,
            fileUploadStatuses,
            leadSaveStatuses,
        );

        const activeLead = this.getActiveLead(activeLeadKey, leads);

        const hasActiveLead = isDefined(activeLead);

        const leadIsTextType = hasActiveLead && (
            leadSourceTypeSelector(activeLead) === LEAD_TYPE.text
        );

        const activeLeadState = activeLeadKey
            ? leadStates[activeLeadKey]
            : undefined;

        const atLeastOneLead = leads.length > 0;

        // can only save unsaved leads
        const saveUnsavedLeadsEnabled = atLeastOneLead && leads.some(
            lead => !isLeadSaveDisabled(leadStates[leadKeySelector(lead)]),
        );

        // can only export saved leads
        const exportSavedLeadsEnabled = atLeastOneLead && leads.some(
            lead => isLeadSaveDisabled(leadStates[leadKeySelector(lead)]),
        );

        // can remove all, saved, unsaved, invalid

        const headerComponent = (
            <React.Fragment>
                <div className={styles.leftContainer}>
                    <BackLink
                        defaultLink={
                            reverseRoute(pathNames.leads, { projectId })
                        }
                    />
                    <LeadFilter
                        onFilterChange={this.handleFilterChange}
                        onFilterClear={this.handleFilterClear}
                        filters={leadFilters}
                    />
                </div>
                <LeadActions
                    onLeadPrev={this.handleLeadPrev}
                    onLeadNext={this.handleLeadNext}
                    onLeadPreviewHiddenChange={this.handleLeadPreviewHiddenChange}

                    leadPreviewHidden={leadPreviewHidden}
                    leadPrevDisabled={isLeadPrevDisabled(leads, activeLeadKey)}
                    leadNextDisabled={isLeadNextDisabled(leads, activeLeadKey)}
                />
            </React.Fragment>
        );

        // TODO: STYLING use similar styling for 'hide lead preview' and 'text lead'

        const mainComponent = (
            <React.Fragment>
                <div className={styles.left}>
                    <LeadList
                        // leads={filteredLeads}
                        leads={leads}
                        leadFilters={leadFilters}
                        activeLeadKey={activeLeadKey}
                        onLeadSelect={this.handleLeadSelect}
                        onLeadRemove={this.handleLeadRemove}
                        onLeadExport={this.handleLeadExport}
                        onLeadSave={this.handleLeadSave}

                        onLeadsRemove={this.handleLeadsRemove}
                        onLeadsExport={this.handleLeadsExport}
                        onLeadsSave={this.handleLeadsSave}
                        saveUnsavedLeadsEnabled={saveUnsavedLeadsEnabled}
                        exportSavedLeadsEnabled={exportSavedLeadsEnabled}

                        leadStates={leadStates}
                        fileUploadStatuses={fileUploadStatuses}
                    />
                    <Cloak
                        hide={LeadCreate.shouldHideButtons}
                        render={
                            <LeadButtons
                                onLeadsAdd={this.handleLeadsAdd}
                            />
                        }
                    />
                </div>
                { hasActiveLead ? (
                    <div className={styles.right}>
                        <ResizableV
                            className={
                                _cs(
                                    styles.resizable,
                                    leadIsTextType && styles.textLead,
                                )
                            }
                            topContainerClassName={styles.top}
                            bottomContainerClassName={styles.bottom}
                            disabled={leadIsTextType}
                            topChild={
                                <LeadDetail
                                    projects={projects}
                                    lead={activeLead}
                                    onChange={this.handleLeadChange}
                                    activeUserId={userId}
                                    onApplyAllBelowClick={this.handleLeadApplyAllBelowClick}
                                    onApplyAllClick={this.handleLeadApplyAllClick}
                                    leadState={activeLeadState}

                                    bulkActionDisabled={submitAllPending}

                                    onLeadRemove={this.handleLeadRemove}
                                    onLeadExport={this.handleLeadsExport}
                                    onLeadSave={this.handleLeadSave}
                                />
                            }
                            bottomChild={
                                !leadPreviewHidden && (
                                    <LeadPreview
                                        lead={activeLead}
                                        className={styles.leadPreview}
                                        onTabularBookSet={this.handleTabularBookSet}
                                    />
                                )
                            }
                        />
                    </div>
                ) : (
                    <Message>
                        { _ts('addLeads', 'noLeadsText') }
                    </Message>
                ) }
            </React.Fragment>
        );

        return (
            <React.Fragment>
                <Prompt
                    message={
                        (location) => {
                            const { routeUrl } = this.props;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (!saveUnsavedLeadsEnabled) {
                                return true;
                            }
                            return _ts('common', 'youHaveUnsavedChanges');
                        }
                    }
                />
                <Page
                    className={styles.addLead}
                    headerClassName={styles.header}
                    header={headerComponent}
                    mainContentClassName={styles.mainContent}
                    mainContent={mainComponent}
                />
                { leadExportModalShown &&
                    <LeadCopyModal
                        leads={leadsToExport}
                        closeModal={this.handleLeadsExportCancel}
                    />
                }
            </React.Fragment>
        );
    }
}

export default connect(mapStateToProps)(
    RequestCoordinator(LeadCreate),
);
