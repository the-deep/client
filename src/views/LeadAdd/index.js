import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import memoize from 'memoize-one';
import {
    _cs,
    doesObjectHaveNoData,
    formatDateToString,
    isDefined,
    isNotDefined,
    listToMap,
    reverseRoute,
} from '@togglecorp/fujs';
import { detachedFaram } from '@togglecorp/faram';

import Message from '#rscv/Message';
import Confirm from '#rscv/Modal/Confirm';
import Page from '#rscv/Page';
import ResizableV from '#rscv/Resizable/ResizableV';
import { CoordinatorBuilder } from '#rsu/coordinate';
import { FgRestBuilder } from '#rsu/rest';
import { UploadBuilder } from '#rsu/upload';

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


    leadAddPageLeadsSelector,
    leadAddPageActiveLeadKeySelector,
    leadAddPageActiveLeadSelector,
    leadAddPageLeadFiltersSelector,
    leadAddPageLeadPreviewHiddenSelector,

    leadAddSetLeadPreviewHiddenAction,
    leadAddSetLeadFiltersAction,
    leadAddClearLeadFiltersAction,
    leadAddSetActiveLeadKeyAction,
    leadAddNextLeadAction,
    leadAddPrevLeadAction,
    leadAddAppendLeadsAction,
    leadAddRemoveLeadsAction,
    leadAddSetLeadTabularBookAction,
    leadAddSetLeadAttachmentAction,
    leadAddChangeLeadAction,
    leadAddSaveLeadAction,
    leadAddApplyLeadsAllBelowAction,
    leadAddApplyLeadsAllAction,
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
    LEAD_STATUS,
    LEAD_TYPE,
    getLeadState,
    leadFaramValuesSelector,
    leadIdSelector,
    leadKeySelector,
    leadSourceTypeSelector,
    leadFilterMethod,
    getNewLeadKey,
    isLeadPrevDisabled,
    isLeadNextDisabled,
} from './utils';
import styles from './styles.scss';


const mapStateToProps = state => ({
    routeUrl: routeUrlSelector(state),
    routeState: routeStateSelector(state),
    projectId: projectIdFromRouteSelector(state),
    projects: currentUserLeadChangeableProjectsSelector(state),
    activeUser: activeUserSelector(state),

    leads: leadAddPageLeadsSelector(state),
    activeLeadKey: leadAddPageActiveLeadKeySelector(state),
    activeLead: leadAddPageActiveLeadSelector(state),
    leadFilters: leadAddPageLeadFiltersSelector(state),
    leadPreviewHidden: leadAddPageLeadPreviewHiddenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadPreviewHidden: params => dispatch(leadAddSetLeadPreviewHiddenAction(params)),
    setLeadFilters: params => dispatch(leadAddSetLeadFiltersAction(params)),
    clearLeadFilters: params => dispatch(leadAddClearLeadFiltersAction(params)),
    setActiveLeadKey: params => dispatch(leadAddSetActiveLeadKeyAction(params)),
    nextLead: params => dispatch(leadAddNextLeadAction(params)),
    prevLead: params => dispatch(leadAddPrevLeadAction(params)),
    appendLeads: params => dispatch(leadAddAppendLeadsAction(params)),
    removeLeads: params => dispatch(leadAddRemoveLeadsAction(params)),
    setLeadTabularBook: params => dispatch(leadAddSetLeadTabularBookAction(params)),
    setLeadAttachment: params => dispatch(leadAddSetLeadAttachmentAction(params)),
    changeLead: params => dispatch(leadAddChangeLeadAction(params)),
    saveLead: params => dispatch(leadAddSaveLeadAction(params)),
    applyLeadsAllBelow: params => dispatch(leadAddApplyLeadsAllBelowAction(params)),
    applyLeadsAll: params => dispatch(leadAddApplyLeadsAllAction(params)),
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

    // eslint-disable-next-line react/forbid-prop-types
    leads: PropTypes.array,
    activeLeadKey: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    activeLead: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    leadFilters: PropTypes.object.isRequired,
    leadPreviewHidden: PropTypes.bool,

    setLeadPreviewHidden: PropTypes.func.isRequired,
    setLeadFilters: PropTypes.func.isRequired,
    clearLeadFilters: PropTypes.func.isRequired,
    setActiveLeadKey: PropTypes.func.isRequired,
    nextLead: PropTypes.func.isRequired,
    prevLead: PropTypes.func.isRequired,
    appendLeads: PropTypes.func.isRequired,
    removeLeads: PropTypes.func.isRequired,
    setLeadTabularBook: PropTypes.func.isRequired,
    setLeadAttachment: PropTypes.func.isRequired,
    changeLead: PropTypes.func.isRequired,
    saveLead: PropTypes.func.isRequired,
    applyLeadsAllBelow: PropTypes.func.isRequired,
    applyLeadsAll: PropTypes.func.isRequired,
};

const defaultProps = {
    projectId: undefined,
    projects: [],
    leads: [],
    activeLeadKey: undefined,
    activeLead: undefined,
    leadPreviewHidden: false,
};

class LeadAdd extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static shouldHideButtons = ({ leadPermissions }) => !leadPermissions.create;

    constructor(props) {
        super(props);

        this.state = {
            leadSaveStatuses: {},
            fileUploadStatuses: {},
            driveUploadStatuses: {},
            dropboxUploadStatuses: {},

            submitAllPending: false,

            leadsToExport: [],
            leadExportModalShown: false,

            leadsToRemove: [],
            leadRemoveConfirmShown: false,
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
        const {
            routeState,
            location: {
                path,
            },
            history,
        } = this.props;
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
            history.replace(path, {});
        }
    }

    getDefaultProjectId = memoize((projects, projectId) => {
        const defaultProjectId = projects.find(project => project.id === projectId)
            ? projectId
            : undefined;
        return defaultProjectId;
    })

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

    getFilteredLeads = memoize((leads, leadFilters, leadStates) => (
        leads.filter(
            (lead) => {
                const key = leadKeySelector(lead);
                const leadState = leadStates[key];
                return leadFilterMethod(lead, leadFilters, leadState);
            },
        )
    ))

    getCompletedLeads = memoize((leads, leadStates) => (
        leads.filter(
            (lead) => {
                const key = leadKeySelector(lead);
                const leadState = leadStates[key];
                return leadState === LEAD_STATUS.complete;
            },
        )
    ))

    handleFileUploadProgressChange = (key, progress) => {
        this.setState(state => ({
            fileUploadStatuses: {
                ...state.fileUploadStatuses,
                [key]: { progress },
            },
        }));
    };

    handleDropboxUploadPendingChange = (key, pending) => {
        this.setState(state => ({
            dropboxUploadStatuses: {
                ...state.dropboxUploadStatuses,
                [key]: { pending },
            },
        }));
    };

    handleDriveUploadPendingChange = (key, pending) => {
        this.setState(state => ({
            driveUploadStatuses: {
                ...state.driveUploadStatuses,
                [key]: { pending },
            },
        }));
    };

    handleLeadSavePendingChange = (key, pending) => {
        this.setState(state => ({
            leadSaveStatuses: {
                ...state.leadSaveStatuses,
                [key]: { pending },
            },
        }));
    };

    handleLeadsAdd = (leadsInfo) => {
        const {
            projectId,
            projects,
            activeUser: {
                userId,
            },

            setLeadAttachment,
            changeLead,
            appendLeads,
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

            const now = new Date();

            const newLead = {
                id: key,
                serverId,
                faramValues: {
                    title: `Lead ${(new Date()).toLocaleTimeString()}`,
                    // NOTE: setting current project as project for lead
                    project: defaultProjectId,
                    // NOTE: only projects where user can create lead should be listed
                    // so, having current user as assignee shouldn't hurt
                    assignee: userId,
                    // NOTE: setting current date as published date if there is none
                    publishedOn: formatDateToString(now, 'yyyy-MM-dd'),
                    // NOTE: hard-coded confidentiality value
                    confidentiality: 'unprotected',
                    // Inject other values too
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

                            setLeadAttachment({
                                leadKey: key,
                                attachmentId: attachment,
                            });
                            this.handleFileUploadProgressChange(key, 100);
                            this.uploadCoordinator.notifyComplete(key);
                        })
                        .failure((response) => {
                            this.handleFileUploadProgressChange(key, undefined);
                            changeLead({
                                leadKey: key,
                                faramErrors: {
                                    $internal: [
                                        `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                                    ],
                                },
                            });
                            this.uploadCoordinator.notifyComplete(key, true);
                        })
                        .fatal(() => {
                            this.handleFileUploadProgressChange(key, undefined);
                            changeLead({
                                leadKey: key,
                                faramErrors: {
                                    $internal: [
                                        `${_ts('addLeads', 'fileUploadFailText')}`,
                                    ],
                                },
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

                            setLeadAttachment({
                                leadKey: key,
                                attachmentId: attachment,
                            });
                            this.handleDriveUploadPendingChange(key, undefined);
                            this.driveUploadCoordinator.notifyComplete(key);
                        })
                        .failure((response) => {
                            this.handleDriveUploadPendingChange(key, undefined);

                            changeLead({
                                leadKey: key,
                                faramErrors: {
                                    $internal: [
                                        `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                                    ],
                                },
                            });

                            this.driveUploadCoordinator.notifyComplete(key, true);
                        })
                        .fatal(() => {
                            this.handleDriveUploadPendingChange(key, undefined);

                            changeLead({
                                leadKey: key,
                                faramErrors: {
                                    $internal: [
                                        `${_ts('addLeads', 'fileUploadFailText')}`,
                                    ],
                                },
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

                            setLeadAttachment({
                                leadKey: key,
                                attachmentId: attachment,
                            });
                            this.handleDropboxUploadPendingChange(key, undefined);
                            this.dropboxUploadCoordinator.notifyComplete(key);
                        })
                        .failure((response) => {
                            this.handleDropboxUploadPendingChange(key, undefined);

                            changeLead({
                                leadKey: key,
                                faramErrors: {
                                    $internal: [
                                        `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                                    ],
                                },
                            });

                            this.dropboxUploadCoordinator.notifyComplete(key, true);
                        })
                        .fatal(() => {
                            this.handleDropboxUploadPendingChange(key, undefined);

                            changeLead({
                                leadKey: key,
                                faramErrors: {
                                    $internal: [
                                        `${_ts('addLeads', 'fileUploadFailText')}`,
                                    ],
                                },
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


        appendLeads(newLeads);
        this.uploadCoordinator.start();
        this.driveUploadCoordinator.start();
        this.dropboxUploadCoordinator.start();
    }

    handleLeadSave = (key) => {
        this.handleLeadsSave([key]);
    }

    handleLeadsSave = (leadKeys) => {
        leadKeys.forEach((leadKey) => {
            const {
                leads,
                changeLead,
                saveLead,
            } = this.props;

            // FIXME: use leadKeysMapping
            const lead = leads.find(l => leadKeySelector(l) === leadKey);
            if (!lead) {
                console.error(`Lead with key ${leadKey} not found.`);
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
                                changeLead({
                                    leadKey,
                                    faramErrors,
                                });

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
                                        saveLead({
                                            leadKey,
                                            lead: response,
                                        });
                                        this.formCoordinator.notifyComplete(leadKey);
                                    })
                                    .failure((response) => {
                                        const faramErrors = alterResponseErrorToFaramError(
                                            response.errors,
                                        );

                                        changeLead({
                                            leadKey,
                                            faramErrors,
                                        });

                                        this.handleLeadSavePendingChange(leadKey, false);
                                        this.formCoordinator.notifyComplete(leadKey, true);
                                    })
                                    .fatal(() => {
                                        changeLead({
                                            leadKey,
                                            faramErrors: {
                                                $internal: ['Error while trying to save lead.'],
                                            },
                                        });

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

    handleLeadRemoveConfirmClose = (confirm) => {
        if (confirm) {
            const { leadsToRemove } = this.state;
            const { removeLeads } = this.props;

            removeLeads(leadsToRemove);

            if (leadsToRemove.length === 1) {
                notify.send({
                    title: _ts('addLeads.actions', 'leadDiscard'),
                    type: notify.type.SUCCESS,
                    message: _ts('addLeads.actions', 'leadDiscardSuccess'),
                    duration: notify.duration.MEDIUM,
                });
            } else if (leadsToRemove.length > 1) {
                notify.send({
                    title: _ts('addLeads.actions', 'leadsDiscard'),
                    type: notify.type.SUCCESS,
                    message: _ts('addLeads.actions', 'leadsDiscardSuccess'),
                    duration: notify.duration.MEDIUM,
                });
            }
        }

        this.setState({
            leadsToRemove: [],
            leadRemoveConfirmShown: false,
        });
    }

    handleLeadsToRemoveSet = (leadKeys) => {
        this.setState({
            leadsToRemove: leadKeys,
            leadRemoveConfirmShown: true,
        });
    }

    handleLeadToRemoveSet = (leadKey) => {
        this.setState({
            leadsToRemove: [leadKey],
            leadRemoveConfirmShown: true,
        });
    }

    handleLeadApplyAllBelowClick = (key, values, attrName, attrValue) => {
        const { applyLeadsAllBelow } = this.props;
        applyLeadsAllBelow({
            leadKey: key,
            values,
            attrName,
            attrValue,
        });
    }

    handleLeadApplyAllClick = (key, values, attrName, attrValue) => {
        const { applyLeadsAll } = this.props;
        applyLeadsAll({
            leadKey: key,
            values,
            attrName,
            attrValue,
        });
    }

    handleLeadsExportCancel = () => {
        this.setState({
            leadExportModalShown: false,
            leadsToExport: [],
        });
    }

    handleLeadsExport = (leadIds) => {
        this.setState({
            leadExportModalShown: true,
            leadsToExport: leadIds,
        });
    }

    handleLeadExport = (leadId) => {
        this.handleLeadsExport([leadId]);
    }

    render() {
        const {
            projectId,
            projects,
            /*
            activeUser: {
                userId,
            },
            */
            activeLeadKey,
            leadFilters,
            leadPreviewHidden,
            leads,
            activeLead,

            setLeadFilters,
            clearLeadFilters,
            prevLead,
            nextLead,
            setLeadPreviewHidden,
            setActiveLeadKey,
            changeLead,
            setLeadTabularBook,
        } = this.props;

        const {
            leadSaveStatuses,
            fileUploadStatuses,
            driveUploadStatuses,
            dropboxUploadStatuses,

            submitAllPending,

            leadsToExport,
            leadExportModalShown,
            leadRemoveConfirmShown,
        } = this.state;

        const leadStates = this.getLeadStates(
            leads,
            driveUploadStatuses,
            dropboxUploadStatuses,
            fileUploadStatuses,
            leadSaveStatuses,
        );

        const hasActiveLead = isDefined(activeLead);

        const leadIsTextType = hasActiveLead && (
            leadSourceTypeSelector(activeLead) === LEAD_TYPE.text
        );

        const activeLeadState = activeLeadKey
            ? leadStates[activeLeadKey]
            : undefined;

        const completedLeads = this.getCompletedLeads(
            leads,
            leadStates,
        );

        const filteredLeads = this.getFilteredLeads(
            leads,
            leadFilters,
            leadStates,
        );

        const isFilterEmpty = doesObjectHaveNoData(leadFilters, ['']);

        const headerComponent = (
            <React.Fragment>
                <div className={styles.leftContainer}>
                    <BackLink
                        defaultLink={
                            reverseRoute(pathNames.leads, { projectId })
                        }
                    />
                    <LeadFilter
                        onFilterChange={setLeadFilters}
                        onFilterClear={clearLeadFilters}
                        filters={leadFilters}
                        clearDisabled={isFilterEmpty}
                    />
                </div>
                { hasActiveLead &&
                    <LeadActions
                        onLeadPrev={prevLead}
                        onLeadNext={nextLead}
                        onLeadPreviewHiddenChange={setLeadPreviewHidden}

                        leadPreviewHidden={leadPreviewHidden}
                        leadPrevDisabled={isLeadPrevDisabled(leads, activeLeadKey)}
                        leadNextDisabled={isLeadNextDisabled(leads, activeLeadKey)}

                        leadStates={leadStates}
                        leads={leads}
                        completedLeads={completedLeads}
                        filteredLeads={filteredLeads}
                        activeLead={activeLead}

                        submitAllPending={submitAllPending}

                        onLeadsSave={this.handleLeadsSave}
                        onLeadsRemove={this.handleLeadsToRemoveSet}
                        onLeadsExport={this.handleLeadsExport}

                        filteredDisabled={isFilterEmpty}
                    />
                }
            </React.Fragment>
        );

        // TODO:
        const saveEnabledForAll = false;

        // TODO: STYLING use similar styling for 'hide lead preview' and 'text lead'

        const mainComponent = (
            <React.Fragment>
                <div className={styles.left}>
                    <LeadList
                        leads={filteredLeads}
                        activeLeadKey={activeLeadKey}
                        onLeadSelect={setActiveLeadKey}
                        onLeadRemove={this.handleLeadToRemoveSet}
                        onLeadExport={this.handleLeadExport}
                        onLeadSave={this.handleLeadSave}

                        onLeadsRemove={this.handleLeadsToRemoveSet}
                        onLeadsExport={this.handleLeadsExport}
                        onLeadsSave={this.handleLeadsSave}

                        leadStates={leadStates}
                        fileUploadStatuses={fileUploadStatuses}
                    />
                    <Cloak
                        hide={LeadAdd.shouldHideButtons}
                        render={
                            <LeadButtons
                                onLeadsAdd={this.handleLeadsAdd}
                                leads={leads}
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
                                    // key={activeLeadKey}
                                    // activeUserId={userId}
                                    lead={activeLead}
                                    onChange={changeLead}
                                    onApplyAllBelowClick={this.handleLeadApplyAllBelowClick}
                                    onApplyAllClick={this.handleLeadApplyAllClick}
                                    leadState={activeLeadState}

                                    bulkActionDisabled={submitAllPending}
                                />
                            }
                            bottomChild={
                                !leadPreviewHidden && (
                                    <LeadPreview
                                        // NOTE: need to dismount LeadPreview
                                        // because the children cannot handle change gracefully
                                        key={activeLeadKey}
                                        lead={activeLead}
                                        className={styles.leadPreview}
                                        onTabularBookSet={setLeadTabularBook}
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
                            } else if (!saveEnabledForAll) {
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
                { leadRemoveConfirmShown &&
                    <Confirm
                        onClose={this.handleLeadRemoveConfirmClose}
                        show
                    >
                        <p>
                            {
                                /* FIXME: different message for delete modes */
                                _ts('addLeads.actions', 'deleteLeadConfirmText')
                            }
                        </p>
                    </Confirm>
                }
            </React.Fragment>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    RequestCoordinator(LeadAdd),
);
