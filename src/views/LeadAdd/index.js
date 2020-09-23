import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
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

import useRequest from '#restrequest';
import { RequestCoordinator } from '#request';
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

    leadAddSetActiveSourceAction,
    leadAddPageActiveSourceSelector,
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

import Sources from './Sources';
import LeadPreview from './LeadPreview';
import LeadActions from './LeadActions';
import LeadList from './LeadList';
import LeadFilter from './LeadFilter';
import LeadDetail from './LeadDetail';
import CandidateLeadsManager from './CandidateLeadsManager';
import CandidateLeadsPane from './CandidateLeadsPane';
import Connectors from './Connectors';
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

const shouldHideButtons = ({ leadPermissions }) => !leadPermissions.create;

const mapStateToProps = state => ({
    routeUrl: routeUrlSelector(state),

    projectId: projectIdFromRouteSelector(state),
    activeUser: activeUserSelector(state),

    leads: leadAddPageLeadsSelector(state),
    activeLead: leadAddPageActiveLeadSelector(state),
    leadPreviewHidden: leadAddPageLeadPreviewHiddenSelector(state),

    activeSource: leadAddPageActiveSourceSelector(state),
});

const mapDispatchToProps = dispatch => ({
    onSourceChange: params => dispatch(leadAddSetActiveSourceAction(params)),
    appendLeads: params => dispatch(leadAddAppendLeadsAction(params)),
    removeLeads: params => dispatch(leadAddRemoveLeadsAction(params)),
    changeLead: params => dispatch(leadAddChangeLeadAction(params)),
    setLeadAttachment: params => dispatch(leadAddSetLeadAttachmentAction(params)),
    saveLead: params => dispatch(leadAddSaveLeadAction(params)),
});

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

    onSourceChange: PropTypes.func.isRequired,
    activeSource: PropTypes.string,
};

const defaultProps = {
    projectId: undefined,
    leads: [],
    activeLead: undefined,
    leadPreviewHidden: false,
    activeSource: undefined,
};

function LeadAdd(props) {
    const {
        activeLead,
        activeUser: { userId },
        appendLeads,
        leadPreviewHidden,
        leads,
        projectId,
        routeUrl,
        changeLead,
        saveLead,
        removeLeads,
        onSourceChange,
        activeSource,
    } = props;

    const [leadSaveStatuses, setLeadSaveStatuses] = useState({});
    const [submitAllPending, setSubmitAllPending] = useState(false);

    const [leadsToExport, setLeadsToExport] = useState([]);
    const [leadsToRemove, setLeadsToRemove] = useState([]);
    const [leadExportModalShown, setLeadExportModalShown] = useState(false);
    const [leadRemoveConfirmShown, setLeadRemoveConfirmShown] = useState(false);

    const [organizations, setOrganizations] = useState([]);
    const [leadGroups, setLeadGroups] = useState([]);

    const mergeOrganizations = useCallback(
        (newOrganizations) => {
            setOrganizations(stateOrganizations => (
                mergeEntities(stateOrganizations, newOrganizations)
            ));
        },
        [],
    );

    const body = useMemo(
        () => {
            const values = leads.map(leadFaramValuesSelector);
            const leadSources = values.map(item => item.source).filter(isDefined);
            const leadAuthors = values.map(item => item.authors).filter(isDefined).flat();
            return {
                projects: [projectId],
                organizations: unique([...leadSources, ...leadAuthors], id => id),
            };
        },
        // NOTE: only re-calculate when project id changes
        [projectId],
    );

    const [pending, leadOptions] = useRequest({
        url: 'server://lead-options/',
        method: 'POST',
        body,
        autoTrigger: true,
        onSuccess: (response) => {
            setOrganizations(response.organizations);
            setLeadGroups(response.leadGroups);
        },
        onFailure: () => {
            setOrganizations([]);
            setLeadGroups([]);
        },
    });

    const formCoordinator = useMemo(
        () => (
            new CoordinatorBuilder()
                .maxActiveActors(3)
                .preSession(() => {
                    setSubmitAllPending(true);
                })
                .postSession((totalErrors) => {
                    setSubmitAllPending(false);

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
                .build()
        ),
        [],
    );

    const leadStates = useMemo(
        () => listToMap(
            leads,
            leadKeySelector,
            (lead, key) => (
                getLeadState(
                    lead,
                    { leadSaveStatus: leadSaveStatuses[key] },
                )
            ),
        ),
        [leads, leadSaveStatuses],
    );

    const handleOrganizationsAdd = useCallback(
        (newOrganizations) => {
            if (newOrganizations.length <= 0) {
                return;
            }
            mergeOrganizations(newOrganizations);
        },
        [mergeOrganizations],
    );

    const handleLeadGroupsAdd = useCallback(
        (newLeadGroups) => {
            if (newLeadGroups.length <= 0) {
                return;
            }
            setLeadGroups(stateLeadGroups => (
                mergeEntities(stateLeadGroups, newLeadGroups)
            ));
        },
        [],
    );

    const handleLeadSavePendingChange = useCallback(
        (leadKey, leadPending) => {
            setLeadSaveStatuses(statuses => ({
                ...statuses,
                [leadKey]: { pending: leadPending },
            }));
        },
        [],
    );

    const handleLeadsAdd = useCallback(
        (leadsInfo) => {
            const confidentiality = leadOptions?.confidentiality ?? [];
            const priority = leadOptions?.priority ?? [];

            const now = new Date();
            const title = `Lead ${now.toLocaleTimeString()}`;
            const publishedDate = formatDateToString(now, 'yyyy-MM-dd');

            const defaultConfidentiality = confidentiality[0]?.key;
            const defaultPriority = [...priority]
                .sort((a, b) => compareNumber(a.key, b.key))[0]?.key;

            const newLeads = leadsInfo.map((leadInfo) => {
                const {
                    faramValues,
                    // FIXME: IMP serverId is no longer the case
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
        },
        [appendLeads, leadOptions?.confidentiality, leadOptions?.priority, projectId, userId],
    );

    const handleLeadsSave = useCallback(
        (leadKeys) => {
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

                            formCoordinator.notifyComplete(leadKey, true);
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
                                    handleLeadSavePendingChange(leadKey, true);
                                })
                                .success((response) => {
                                    saveLead({
                                        leadKey,
                                        lead: response,
                                    });
                                    handleLeadSavePendingChange(leadKey, false);
                                    formCoordinator.notifyComplete(leadKey);
                                })
                                .failure((response) => {
                                    const faramErrors = alterResponseErrorToFaramError(
                                        response.errors,
                                    );

                                    changeLead({
                                        leadKey,
                                        faramErrors,
                                    });

                                    handleLeadSavePendingChange(leadKey, false);
                                    formCoordinator.notifyComplete(leadKey, true);
                                })
                                .fatal(() => {
                                    const faramErrors = {
                                        $internal: ['Error while trying to save lead.'],
                                    };

                                    changeLead({
                                        leadKey,
                                        faramErrors,
                                    });

                                    handleLeadSavePendingChange(leadKey, false);
                                    formCoordinator.notifyComplete(leadKey, true);
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

                formCoordinator.add(
                    leadKey,
                    worker,
                );
            });
            formCoordinator.start();
        },
        [leads, changeLead, saveLead, formCoordinator, handleLeadSavePendingChange],
    );

    const handleLeadsToRemoveSet = useCallback(
        (leadKeys) => {
            setLeadsToRemove(leadKeys);
            setLeadRemoveConfirmShown(true);
        },
        [],
    );

    const handleLeadsExport = useCallback(
        (leadIds) => {
            setLeadsToExport(leadIds);
            setLeadExportModalShown(true);
        },
        [],
    );

    const handleLeadRemoveConfirmClose = useCallback(
        (confirm) => {
            if (confirm) {
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

            setLeadsToRemove([]);
            setLeadRemoveConfirmShown(false);
        },
        [leadsToRemove, removeLeads],
    );

    const handleLeadsExportCancel = useCallback(
        () => {
            setLeadExportModalShown(false);
            setLeadsToExport([]);
        },
        [],
    );

    const handleLeadSave = useCallback(
        (key) => {
            handleLeadsSave([key]);
        },
        [handleLeadsSave],
    );

    const handleLeadExport = useCallback(
        (leadId) => {
            handleLeadsExport([leadId]);
        },
        [handleLeadsExport],
    );

    const handleLeadToRemoveSet = useCallback(
        (leadKey) => {
            handleLeadsToRemoveSet([leadKey]);
        },
        [handleLeadsToRemoveSet],
    );

    const [connectorsPending, connectorsResponse] = useRequest({
        url: `server://projects/${projectId}/unified-connectors/`,
        autoTrigger: true,
    });
    const [selectedConnector, setSelectedConnector] = useState(undefined);
    // TODO: validate this selected connector source
    const [selectedConnectorSource, setSelectedConnectorSource] = useState(undefined);
    // TODO: validate this selected connector lead
    const [selectedConnectorLead, setSelectedConnectorLead] = useState(undefined);
    const connectors = connectorsResponse?.results;

    let connectorLeadUrl;
    if (selectedConnectorSource) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connector-sources/${selectedConnectorSource}/leads/`;
    } else if (selectedConnector) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connectors/${selectedConnector}/leads/`;
    }

    const [connectorLeadsPending, connectorLeadsResponse] = useRequest({
        url: connectorLeadUrl,
        query: {
            offset: 1,
            limit: 20,
        },
        autoTrigger: true,
    });

    const [connectorToTrigger, setConnectorToTrigger] = useState();
    const [connectorTriggerPending,,, connectorTriggerTrigger] = useRequest({
        url: `server://projects/${projectId}/unified-connectors/${connectorToTrigger}/trigger-sync/`,
        method: 'POST',
        body: {},
        onSuccess: () => {
            console.warn('success');
        },
    });

    const connectorMode = !!selectedConnector;
    const hasActiveConnectorLead = !!selectedConnectorLead;

    const handleSourceSelect = useCallback(
        (source) => {
            onSourceChange(source);
            setSelectedConnector(undefined);
            setSelectedConnectorSource(undefined);
        },
        [onSourceChange],
    );

    const handleCollectorSelect = useCallback(
        (id) => {
            onSourceChange(undefined);
            setSelectedConnector(id);
            setSelectedConnectorSource(undefined);
        },
        [onSourceChange],
    );

    const handleConnectorSourceSelect = useCallback(
        (connectorId, id) => {
            onSourceChange(undefined);
            setSelectedConnector(connectorId);
            setSelectedConnectorSource(id);
        },
        [onSourceChange],
    );

    const handleConnectorTrigger = useCallback(
        (id) => {
            setConnectorToTrigger(id);
            connectorTriggerTrigger();
        },
        [connectorTriggerTrigger],
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

    // TODO: IMP calculate this value
    const saveEnabledForAll = false;

    return (
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
                    <Prompt
                        message={
                            (location) => {
                                if (location.pathname === routeUrl) {
                                    return true;
                                } else if (!saveEnabledForAll) {
                                    return true;
                                }
                                return _ts('common', 'youHaveUnsavedChanges');
                            }
                        }
                    />
                    {leadExportModalShown && (
                        <LeadCopyModal
                            leads={leadsToExport}
                            closeModal={handleLeadsExportCancel}
                        />
                    )}
                    {leadRemoveConfirmShown && (
                        <Confirm
                            onClose={handleLeadRemoveConfirmClose}
                            show
                        >
                            <p>
                                {/* TODO: different message for delete modes */}
                                {_ts('addLeads.actions', 'deleteLeadConfirmText')}
                            </p>
                        </Confirm>
                    )}
                </>
            )}
            mainContentClassName={styles.mainContent}
            mainContent={(
                <>
                    <Cloak
                        hide={shouldHideButtons}
                        render={(
                            <div className={styles.leftPane}>
                                <CandidateLeadsManager>
                                    <Sources
                                        className={styles.leadButtons}
                                        onLeadsAdd={handleLeadsAdd}
                                        leadStates={leadStates}
                                        activeSource={activeSource}
                                        onSourceChange={handleSourceSelect}
                                    />
                                    {connectors && connectors.length > 0 && (
                                        <Connectors
                                            connectors={connectors}
                                            selectedConnector={selectedConnector}
                                            selectedConnectorSource={selectedConnectorSource}
                                            onConnectorTrigger={handleConnectorTrigger}
                                            onConnectorSelect={handleCollectorSelect}
                                            onConnectorSourceSelect={handleConnectorSourceSelect}
                                            connectorToTrigger={connectorToTrigger}
                                            connectorTriggering={connectorTriggerPending}
                                        />
                                    )}
                                    <div className={styles.space} />
                                    <CandidateLeadsPane
                                        className={styles.candidateLeadsBox}
                                        onLeadsAdd={handleLeadsAdd}
                                        onOrganizationsAdd={mergeOrganizations}
                                    />
                                </CandidateLeadsManager>
                            </div>
                        )}
                    />
                    <div className={styles.main}>
                        {!connectorMode && (
                            <>
                                <div className={styles.bar}>
                                    <LeadFilter
                                        className={styles.filter}
                                    />
                                    <LeadActions
                                        className={styles.actions}
                                        disabled={submitAllPending}
                                        leadStates={leadStates}

                                        onLeadsSave={handleLeadsSave}
                                        onLeadsRemove={handleLeadsToRemoveSet}
                                        onLeadsExport={handleLeadsExport}
                                    />
                                </div>
                                <div className={styles.content}>
                                    <LeadList
                                        className={styles.list}
                                        leadStates={leadStates}
                                        onLeadRemove={handleLeadToRemoveSet}
                                        onLeadExport={handleLeadExport}
                                        onLeadSave={handleLeadSave}
                                    />
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
                                                    onLeadGroupsAdd={handleLeadGroupsAdd}

                                                    organizations={organizations}
                                                    onOrganizationsAdd={handleOrganizationsAdd}
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
                        {connectorMode && (
                            <div className={styles.content}>
                                {/* TODO: add actions */}
                                <div className={styles.list}>
                                    <div> Lead list goes here </div>
                                </div>
                                {hasActiveConnectorLead ? (
                                    <div className={styles.leadDetail}>
                                        Lead preview goes here
                                    </div>
                                ) : (
                                    <Message>
                                        { _ts('addLeads', 'noLeadsText') }
                                    </Message>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        />
    );
}
LeadAdd.propTypes = propTypes;
LeadAdd.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(
    RequestCoordinator(LeadAdd),
);
