import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import memoize from 'memoize-one';
import {
    _cs,
    formatDateToString,
    isDefined,
    listToMap,
    reverseRoute,
    compareNumber,
    unique,
} from '@togglecorp/fujs';
import { detachedFaram } from '@togglecorp/faram';

import Message from '#rscv/Message';
import Confirm from '#rscv/Modal/Confirm';
import Page from '#rscv/Page';
import ResizableV from '#rscv/Resizable/ResizableV';
import { CoordinatorBuilder } from '#rsu/coordinate';
import { FgRestBuilder } from '#rsu/rest';

import LeadCopyModal from '#components/general/LeadCopyModal';
import { pathNames } from '#constants';
import Cloak from '#components/general/Cloak';
import BackLink from '#components/general/BackLink';

import {
    RequestClient,
    RequestCoordinator,
    methods,
} from '#request';
import {
    routeUrlSelector,
    projectIdFromRouteSelector,
    activeUserSelector,

    leadAddPageLeadsSelector,
    leadAddPageActiveLeadSelector,
    leadAddPageLeadPreviewHiddenSelector,

    leadAddAppendLeadsAction,
    leadAddRemoveLeadsAction,
    leadAddSetLeadAttachmentAction,
    leadAddChangeLeadAction,
    leadAddSaveLeadAction,
} from '#redux';
import {
    createUrlForLeadEdit,
    urlForLead,
    createParamsForLeadEdit,
    createParamsForLeadCreate,

    alterResponseErrorToFaramError,
} from '#rest';
import notify from '#notify';
import _ts from '#ts';

import LeadSources from './LeadSources';
import LeadPreview from './LeadPreview';
import LeadActions from './LeadActions';
import LeadList from './LeadList';
import LeadFilter from './LeadFilter';
import LeadDetail from './LeadDetail';
import LeadProcessor from './LeadProcessor';
import CandidateLeads from './CandidateLeads';
import schema from './LeadDetail/faramSchema';

import {
    LEAD_TYPE,
    getLeadState,
    leadFaramValuesSelector,
    leadIdSelector,
    leadKeySelector,
    leadSourceTypeSelector,
    getNewLeadKey,
} from './utils';
import styles from './styles.scss';

function mergeEntities(foo = [], bar = []) {
    return unique(
        [...foo, ...bar],
        item => item.id,
    );
}

const mapStateToProps = state => ({
    routeUrl: routeUrlSelector(state),

    projectId: projectIdFromRouteSelector(state),
    activeUser: activeUserSelector(state),

    leads: leadAddPageLeadsSelector(state),
    activeLead: leadAddPageActiveLeadSelector(state),
    leadPreviewHidden: leadAddPageLeadPreviewHiddenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    appendLeads: params => dispatch(leadAddAppendLeadsAction(params)),
    removeLeads: params => dispatch(leadAddRemoveLeadsAction(params)),
    changeLead: params => dispatch(leadAddChangeLeadAction(params)),
    setLeadAttachment: params => dispatch(leadAddSetLeadAttachmentAction(params)),
    saveLead: params => dispatch(leadAddSaveLeadAction(params)),
});

const requestOptions = {
    leadOptionsRequest: {
        url: '/lead-options/',
        method: methods.POST,
        body: ({ props: { leads, projectId } }) => {
            const values = leads.map(leadFaramValuesSelector);
            const leadSources = values.map(item => item.source).filter(isDefined);
            const leadAuthors = values.map(item => item.authors).filter(isDefined).flat();
            // const leadGroups = values.map(item => item.leadGroup).filter(isDefined);

            return {
                projects: [projectId],
                organizations: unique([...leadSources, ...leadAuthors], id => id),
                // TODO: get only required lead groups and use same process as organizations
                // leadGroups: unique(leadGroups, id => id),
            };
        },
        onSuccess: ({ params, response }) => {
            params.setOrganizations(response.organizations);
            params.setLeadGroups(response.leadGroups);
        },
        onFailure: ({ params }) => {
            params.setOrganizations([]);
            params.setLeadGroups([]);
        },
        onFatal: ({ params }) => {
            params.setOrganizations([]);
            params.setLeadGroups([]);
        },
        onMount: true,
        onPropsChanged: {
            lead: ({
                prevProps: { projectId: oldProject },
                props: { projectId: newProject },
            }) => (
                newProject !== oldProject
            ),
        },
        // extras: {
        //     schemaName: 'leadOptions',
        // },
    },
};

const propTypes = {
    routeUrl: PropTypes.string.isRequired,
    projectId: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leads: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    activeLead: PropTypes.object,
    leadPreviewHidden: PropTypes.bool,

    appendLeads: PropTypes.func.isRequired,
    removeLeads: PropTypes.func.isRequired,
    changeLead: PropTypes.func.isRequired,
    saveLead: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
};

const defaultProps = {
    projectId: undefined,
    leads: [],
    activeLead: undefined,
    leadPreviewHidden: false,
};

const shouldHideButtons = ({ leadPermissions }) => !leadPermissions.create;

class LeadAdd extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            requests: {
                leadOptionsRequest,
            },
        } = this.props;

        leadOptionsRequest.setDefaultParams({
            setOrganizations: (organizations = []) => {
                this.setState({ organizations });
            },
            setLeadGroups: (leadGroups = []) => {
                this.setState({ leadGroups });
            },
        });

        this.state = {
            leadSaveStatuses: {},

            submitAllPending: false,

            leadsToExport: [],
            leadExportModalShown: false,

            leadsToRemove: [],
            leadRemoveConfirmShown: false,

            organizations: [],
            leadGroups: [],
        };

        this.formCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .preSession(() => {
                this.setState({ submitAllPending: true });
            })
            .postSession((totalErrors) => {
                this.setState({ submitAllPending: false });

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
            })
            .build();
    }

    getLeadStates = memoize((
        leads,
        leadSaveStatuses,
    ) => (
        listToMap(
            leads,
            leadKeySelector,
            (lead, key) => (
                getLeadState(
                    lead,
                    { leadSaveStatus: leadSaveStatuses[key] },
                )
            ),
        )
    ));

    handleOrganizationsAdd = (organizations) => {
        if (organizations.length <= 0) {
            return;
        }
        this.setState(state => ({
            organizations: mergeEntities(state.organizations, organizations),
        }));
    }

    handleLeadGroupsAdd = (leadGroups) => {
        if (leadGroups.length <= 0) {
            return;
        }
        this.setState(state => ({
            leadGroups: mergeEntities(state.leadGroups, leadGroups),
        }));
    }

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
            activeUser: { userId },
            appendLeads,
            requests: {
                leadOptionsRequest: {
                    response: leadOptions,
                },
            },
        } = this.props;

        const confidentiality = leadOptions?.confidentiality ?? [];
        const priority = leadOptions?.priority ?? [];

        const now = new Date();
        const title = `Lead ${now.toLocaleTimeString()}`;
        const publishedDate = formatDateToString(now, 'yyyy-MM-dd');

        const defaultConfidentiality = confidentiality[0]?.key;
        const defaultPriority = [...priority].sort((a, b) => compareNumber(a.key, b.key))[0]?.key;

        const newLeads = leadsInfo.map((leadInfo) => {
            const {
                faramValues,
                // FIXME: serverId is no longer the case
                serverId,
            } = leadInfo;

            const key = getNewLeadKey();

            const newLead = {
                id: key,
                serverId,
                faramValues: {
                    title,
                    project: projectId,
                    assignee: userId,
                    publishedOn: publishedDate,
                    confidentiality: defaultConfidentiality,
                    priority: defaultPriority,

                    ...faramValues,

                    // NOTE: Server expects a value for authors
                    authors: faramValues.authors ?? [],
                },
                faramErrors: {},
                faramInfo: {
                    error: false,
                    pristine: isDefined(serverId),
                },
            };

            return newLead;
        });

        appendLeads(newLeads);
    }

    handleLeadsSave = (leadKeys) => {
        const {
            leads,
            changeLead,
            saveLead,
        } = this.props;

        leadKeys.forEach((leadKey) => {
            // FIXME: use leadKeysMapping
            const lead = leads.find(l => leadKeySelector(l) === leadKey);
            if (!lead) {
                console.error(`Lead with key ${leadKey} not found.`);
                return;
            }

            const worker = {
                start: () => {
                    const serverId = leadIdSelector(lead);
                    const value = leadFaramValuesSelector(lead);

                    const onValidationFailure = (faramErrors) => {
                        changeLead({
                            leadKey,
                            faramErrors,
                        });

                        this.formCoordinator.notifyComplete(leadKey, true);
                    };

                    const onValidationSuccess = (faramValues) => {
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
                                saveLead({
                                    leadKey,
                                    lead: response,
                                });
                                this.handleLeadSavePendingChange(leadKey, false);
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
                                const faramErrors = {
                                    $internal: ['Error while trying to save lead.'],
                                };

                                changeLead({
                                    leadKey,
                                    faramErrors,
                                });

                                this.handleLeadSavePendingChange(leadKey, false);
                                this.formCoordinator.notifyComplete(leadKey, true);
                            })
                            .build();
                        request.start();
                    };

                    detachedFaram({
                        value,
                        schema,
                        onValidationFailure,
                        onValidationSuccess,
                    });
                },
                stop: () => {
                    // No-op
                },
            };

            this.formCoordinator.add(
                leadKey,
                worker,
            );
        });
        this.formCoordinator.start();
    }

    handleLeadsToRemoveSet = (leadKeys) => {
        this.setState({
            leadsToRemove: leadKeys,
            leadRemoveConfirmShown: true,
        });
    }

    handleLeadsExport = (leadIds) => {
        this.setState({
            leadExportModalShown: true,
            leadsToExport: leadIds,
        });
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

    handleLeadsExportCancel = () => {
        this.setState({
            leadExportModalShown: false,
            leadsToExport: [],
        });
    }

    handleLeadSave = (key) => {
        this.handleLeadsSave([key]);
    }

    handleLeadExport = (leadId) => {
        this.handleLeadsExport([leadId]);
    }

    handleLeadToRemoveSet = (leadKey) => {
        this.handleLeadsToRemoveSet([leadKey]);
    }

    render() {
        const {
            projectId,
            leadPreviewHidden,
            leads,
            activeLead,
            requests: {
                leadOptionsRequest: {
                    pending,
                    response: leadOptions,
                },
            },
        } = this.props;

        const {
            leadGroups,
            organizations,
            leadSaveStatuses,

            submitAllPending,

            leadsToExport,
            leadExportModalShown,
            leadRemoveConfirmShown,
        } = this.state;

        const leadStates = this.getLeadStates(
            leads,
            leadSaveStatuses,
        );

        const hasActiveLead = isDefined(activeLead);

        const leadIsTextType = hasActiveLead && (
            leadSourceTypeSelector(activeLead) === LEAD_TYPE.text
        );

        const activeLeadKey = activeLead
            ? leadKeySelector(activeLead)
            : undefined;

        const activeLeadState = activeLeadKey
            ? leadStates[activeLeadKey]
            : undefined;

        const leadPreviewMinimized = leadPreviewHidden || leadIsTextType;

        // TODO:
        const saveEnabledForAll = false;

        return (
            <>
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
                    header={(
                        <>
                            <BackLink
                                defaultLink={reverseRoute(pathNames.leads, { projectId })}
                            />
                            <h4 className={styles.heading}>
                                {/* TODO: translate this */}
                                Add Leads
                            </h4>
                            <LeadActions
                                className={styles.actions}
                                disabled={submitAllPending}
                                leadStates={leadStates}
                                onLeadsSave={this.handleLeadsSave}
                                onLeadsRemove={this.handleLeadsToRemoveSet}
                                onLeadsExport={this.handleLeadsExport}
                            />
                        </>
                    )}
                    mainContentClassName={styles.mainContent}
                    mainContent={(
                        <>
                            <Cloak
                                hide={shouldHideButtons}
                                render={(
                                    <div className={styles.leftPane}>
                                        <LeadProcessor>
                                            <LeadSources
                                                className={styles.leadButtons}
                                                onLeadsAdd={this.handleLeadsAdd}
                                            />
                                            <CandidateLeads
                                                className={styles.candidateLeadsBox}
                                                onLeadsAdd={this.handleLeadsAdd}
                                            />
                                        </LeadProcessor>
                                    </div>
                                )}
                            />
                            <div className={styles.main}>
                                <div className={styles.leadList}>
                                    <LeadFilter
                                        className={styles.filter}
                                    />
                                    <LeadList
                                        className={styles.list}
                                        leadStates={leadStates}
                                        onLeadRemove={this.handleLeadToRemoveSet}
                                        onLeadExport={this.handleLeadExport}
                                        onLeadSave={this.handleLeadSave}
                                    />
                                </div>
                                {hasActiveLead ? (
                                    <ResizableV
                                        className={_cs(
                                            styles.leadDetail,
                                            leadPreviewMinimized && styles.textLead,
                                        )}
                                        topContainerClassName={styles.top}
                                        bottomContainerClassName={styles.bottom}
                                        disabled={leadPreviewMinimized}
                                        topChild={(
                                            <LeadDetail
                                                key={activeLeadKey}
                                                leadState={activeLeadState}
                                                bulkActionDisabled={submitAllPending}

                                                pending={pending}

                                                priorityOptions={leadOptions?.priority}
                                                confidentialityOptions={leadOptions?.confidentiality} // eslint-disable-line max-len
                                                assignees={leadOptions?.members}

                                                leadGroups={leadGroups}
                                                onLeadGroupsAdd={this.handleLeadGroupsAdd}

                                                organizations={organizations}
                                                onOrganizationsAdd={this.handleOrganizationsAdd}
                                            />
                                        )}
                                        bottomChild={!leadPreviewMinimized && (
                                            <LeadPreview
                                                // NOTE: need to dismount
                                                // LeadPreview because the
                                                // children cannot handle
                                                // change gracefully
                                                key={activeLeadKey}
                                                className={styles.leadPreview}
                                            />
                                        )}
                                    />
                                ) : (
                                    <Message>
                                        { _ts('addLeads', 'noLeadsText') }
                                    </Message>
                                )}
                            </div>
                        </>
                    )}
                />
                {leadExportModalShown && (
                    <LeadCopyModal
                        leads={leadsToExport}
                        closeModal={this.handleLeadsExportCancel}
                    />
                )}
                {leadRemoveConfirmShown && (
                    <Confirm
                        onClose={this.handleLeadRemoveConfirmClose}
                        show
                    >
                        <p>
                            {/* TODO: different message for delete modes */}
                            {_ts('addLeads.actions', 'deleteLeadConfirmText')}
                        </p>
                    </Confirm>
                )}
            </>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    RequestCoordinator(RequestClient(requestOptions)(LeadAdd)),
);
