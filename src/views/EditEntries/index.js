import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link, Prompt } from 'react-router-dom';
import produce from 'immer';
import memoize from 'memoize-one';

import { reverseRoute, listToMap, isDefined } from '@togglecorp/fujs';
import { detachedFaram } from '@togglecorp/faram';

import { FgRestBuilder } from '#rsu/rest';
import Icon from '#rscg/Icon';
import Page from '#rscv/Page';
import update from '#rsu/immutable-update';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import ScrollTabs from '#rscv/ScrollTabs';
import Message from '#rscv/Message';
import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';
import { CoordinatorBuilder } from '#rsu/coordinate';

import BackLink from '#components/general/BackLink';
import Cloak from '#components/general/Cloak';
import {
    createDiff,
    createEntryGroup,
    getApplicableDiffCount,
    getApplicableAndModifyingDiffCount,
    entryAccessor,
    entryGroupAccessor,
    ENTRY_STATUS,
} from '#entities/editEntries';

import {
    createUrlForDeleteEntryGroup,
    createParamsForEntryGroupCreate,
    createParamsForEntryGroupEdit,
    createUrlForEntryGroupEdit,
    createUrlForEntryGroupCreate,
    createUrlForDeleteEntry,
    createParamsForDeleteEntry,
    createParamsForEntryCreate,
    createParamsForEntryEdit,
    createUrlForEntryEdit,
    urlForEntryCreate,
} from '#rest';

import schemaValidator from '#schema';

import { RequestCoordinator, RequestClient } from '#request';
import { pathNames } from '#constants';
import {
    leadIdFromRoute,
    projectIdFromRoute,

    routeUrlSelector,

    editEntriesAnalysisFrameworkSelector,
    editEntriesEntriesSelector,
    editEntriesLeadSelector,
    editEntriesSchemaSelector,
    editEntriesComputeSchemaSelector,
    editEntriesStatusesSelector,
    editEntriesEntryGroupStatusesSelector,

    editEntriesClearEntriesAction,
    editEntriesRemoveEntryAction,
    editEntriesSaveEntryAction,
    editEntriesSetEntriesAction,
    editEntriesSetEntriesCommentsCountAction,
    editEntriesSetEntriesControlStatusAction,
    editEntriesUpdateEntriesBulkAction,
    editEntriesSetEntryErrorsAction,
    editEntriesSetEntryGroupErrorsAction,
    editEntriesSetLeadAction,
    editEntriesSetPendingAction,
    editEntriesResetUiStateAction,
    editEntriesResetEntryGroupUiStateAction,
    editEntriesSetLabelsAction,
    editEntriesEntryGroupsSelector,
    editEntriesSetEntryGroupsAction,
    editEntriesEntryGroupsClearEntriesAction,
    editEntriesRemoveEntryGroupAction,
    editEntriesSetEntryGroupPendingAction,
    editEntriesSaveEntryGroupAction,
    editEntriesLabelsSelector,

    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    setRegionsForProjectAction,
    setProjectMembershipsAction,
} from '#redux';
import notify from '#notify';
import _ts from '#ts';
import { VIEW } from '#widgets';
import {
    notifyOnFailure,
} from '#utils/requestNotify';
import { calculateEntryColor } from './entryDataCalculator';
import Overview from './Overview';
import Listing from './List';
import Group from './Group';

import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.number.isRequired,
    schema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    computeSchema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entryGroupStatuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    resetUiState: PropTypes.func.isRequired,
    routeUrl: PropTypes.string.isRequired,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    projectId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    // eslint-disable-next-line react/no-unused-prop-types, react/forbid-prop-types
    labels: PropTypes.array,

    entryGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types, react/no-unused-prop-types, max-len
    setAnalysisFramework: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types, max-len
    setEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setEntryGroups: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setGeoOptions: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setLead: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setRegions: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setEntriesCommentsCount: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types, max-len
    setEntryControlStatus: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types, max-len
    setLabels: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types, max-len
    resetEntryGroupUiState: PropTypes.func.isRequired,

    clearEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    clearEntryGroups: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    removeEntry: PropTypes.func.isRequired,
    removeEntryGroup: PropTypes.func.isRequired,
    saveEntry: PropTypes.func.isRequired,
    saveEntryGroup: PropTypes.func.isRequired,
    updateEntriesBulk: PropTypes.func.isRequired,
    setEntryError: PropTypes.func.isRequired,
    setEntryGroupError: PropTypes.func.isRequired,


    setPending: PropTypes.func.isRequired,
    setEntryGroupPending: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
    entries: [],
    entryGroups: [],
    statuses: {},
    entryGroupStatuses: {},
    schema: {},
    computeSchema: {},
    labels: undefined,
};

const mapStateToProps = state => ({
    analysisFramework: editEntriesAnalysisFrameworkSelector(state),
    entries: editEntriesEntriesSelector(state),
    entryGroups: editEntriesEntryGroupsSelector(state),
    lead: editEntriesLeadSelector(state),
    leadId: leadIdFromRoute(state),
    projectId: projectIdFromRoute(state),
    schema: editEntriesSchemaSelector(state),
    computeSchema: editEntriesComputeSchemaSelector(state),
    statuses: editEntriesStatusesSelector(state),
    entryGroupStatuses: editEntriesEntryGroupStatusesSelector(state),
    routeUrl: routeUrlSelector(state),
    labels: editEntriesLabelsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    clearEntries: params => dispatch(editEntriesClearEntriesAction(params)),
    clearEntryGroups: params => dispatch(editEntriesEntryGroupsClearEntriesAction(params)),
    removeEntry: params => dispatch(editEntriesRemoveEntryAction(params)),
    removeEntryGroup: params => dispatch(editEntriesRemoveEntryGroupAction(params)),
    saveEntry: params => dispatch(editEntriesSaveEntryAction(params)),
    saveEntryGroup: params => dispatch(editEntriesSaveEntryGroupAction(params)),
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setEntries: params => dispatch(editEntriesSetEntriesAction(params)),
    setEntryGroups: params => dispatch(editEntriesSetEntryGroupsAction(params)),
    setEntriesCommentsCount: params => dispatch(editEntriesSetEntriesCommentsCountAction(params)),
    setEntryControlStatus: params => dispatch(
        editEntriesSetEntriesControlStatusAction(params),
    ),
    updateEntriesBulk: params => dispatch(editEntriesUpdateEntriesBulkAction(params)),
    setEntryError: params => dispatch(editEntriesSetEntryErrorsAction(params)),
    setEntryGroupError: params => dispatch(editEntriesSetEntryGroupErrorsAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
    setLead: params => dispatch(editEntriesSetLeadAction(params)),
    setPending: params => dispatch(editEntriesSetPendingAction(params)),
    setEntryGroupPending: params => dispatch(editEntriesSetEntryGroupPendingAction(params)),
    setRegions: params => dispatch(setRegionsForProjectAction(params)),
    resetUiState: params => dispatch(editEntriesResetUiStateAction(params)),
    resetEntryGroupUiState: params => dispatch(editEntriesResetEntryGroupUiStateAction(params)),
    setLabels: params => dispatch(editEntriesSetLabelsAction(params)),
    setProjectMemberships: params => dispatch(setProjectMembershipsAction(params)),
});

const requestOptions = {
    editEntryDataRequest: {
        extras: {
            schemaName: 'entriesForEditEntriesGetResponse',
        },
        url: ({ props }) => `/v2/edit-entries-data/${props.leadId}/`,
        onPropsChanged: ['leadId', 'projectId'],
        onMount: true,
        onSuccess: ({ response, props, params }) => {
            const {
                leadId,
                projectId: projectIdFromUrl,
                entries: entriesFromProps,
                entryGroups: entryGroupsFromProps,
                setEntriesCommentsCount,
                setEntryControlStatus,
                setAnalysisFramework,
                setEntries,
                setEntryGroups,
                setGeoOptions,
                setLead,
                setRegions,
                setLabels,
                clearEntries,
                clearEntryGroups,
            } = props;
            const {
                setProjectMismatch,
                cancelMode,
            } = params;

            if (cancelMode) {
                clearEntries({ leadId });
                clearEntryGroups({ leadId });
            }

            const {
                lead,
                geoOptions,
                analysisFramework,
                entries,
                entryGroups,
                regions,
                entryLabels,
            } = response;

            const projectMismatch = projectIdFromUrl !== lead.project;
            setProjectMismatch(projectMismatch);

            if (projectMismatch) {
                console.error(`Expected project id to be ${projectIdFromUrl}, but got ${lead.project}`);
                return;
            }

            setLead({ lead });

            setAnalysisFramework({ analysisFramework });

            setGeoOptions({
                projectId: lead.project,
                locations: geoOptions,
            });

            setRegions({
                projectId: lead.project,
                regions,
            });

            setEntriesCommentsCount({ leadId, entries });
            setEntryControlStatus({ leadId, entries });

            setLabels({ leadId, labels: entryLabels });

            // Calculate color for each entry in the diff
            const diffs = createDiff(cancelMode ? [] : entriesFromProps, entries)
                .map((diff) => {
                    if (!diff.item) {
                        return diff;
                    }

                    const {
                        item: { data: { attributes = {} } = {} },
                    } = diff;
                    const color = calculateEntryColor(
                        attributes,
                        analysisFramework,
                    );
                    return {
                        ...diff,
                        item: {
                            ...diff.item,
                            localData: {
                                ...diff.item.localData,
                                color,
                            },
                        },
                    };
                });

            if (getApplicableDiffCount(diffs) > 0) {
                setEntries({ leadId, entryActions: diffs });

                if (getApplicableAndModifyingDiffCount(diffs) > 0) {
                    notify.send({
                        type: notify.type.WARNING,
                        title: _ts('editEntry', 'entryUpdate'),
                        message: _ts('editEntry', 'entryUpdateOverridden'),
                        duration: notify.duration.SLOW,
                    });
                }
            }

            const entryGroupDiffs = createDiff(
                cancelMode ? [] : entryGroupsFromProps,
                entryGroups,
                entryGroupAccessor,
                createEntryGroup,
            );
            if (getApplicableDiffCount(entryGroupDiffs) > 0) {
                setEntryGroups({ leadId, entryGroupActions: entryGroupDiffs });

                if (getApplicableAndModifyingDiffCount(entryGroupDiffs) > 0) {
                    notify.send({
                        type: notify.type.WARNING,
                        title: _ts('editEntry', 'entryGroupUpdate'),
                        message: _ts('editEntry', 'entryGroupUpdateOverridden'),
                        duration: notify.duration.SLOW,
                    });
                }
            }
        },
    },
    projectMembershipRequest: {
        onPropsChanged: ['projectId'],
        url: ({ props }) => `/projects/${props.projectId}/project-memberships/`,
        onMount: true,
        onFailure: notifyOnFailure(_ts('project.users', 'usersTitle')),
        onSuccess: ({
            response = {},
            props: {
                projectId,
                setProjectMemberships,
            },
        }) => {
            setProjectMemberships({
                projectId,
                memberships: response.results,
            });
        },
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class EditEntries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            requests,
        } = this.props;
        requests.editEntryDataRequest.setDefaultParams({
            setProjectMismatch: (value) => {
                this.setState({ projectMismatch: value });
            },
        });

        this.state = {
            pendingSaveAll: false,
            pendingSaveAllEntryGroup: false,
            projectMismatch: false,
            entryStates: {},
        };

        this.views = {
            [VIEW.overview]: {
                component: Overview,
                rendererParams: () => ({
                    // injected inside WidgetFaram
                    schema: this.props.schema,
                    computeSchema: this.props.computeSchema,
                    onEntryStateChange: this.handleEntryStateChange,
                    analysisFramework: this.props.analysisFramework,
                    lead: this.props.lead,
                    leadId: this.props.leadId,

                    entryStates: this.state.entryStates,
                    bookId: this.props.lead && this.props.lead.tabularBook,
                    statuses: this.props.statuses,
                }),
                wrapContainer: true,
                lazyMount: false,
                mount: true,
            },
            [VIEW.list]: {
                component: Listing,
                rendererParams: () => ({
                    // NOTE: to re-render Listing when has changes
                    hash: window.location.hash,

                    // injected inside WidgetFaram
                    schema: this.props.schema,
                    computeSchema: this.props.computeSchema,
                    onEntryStateChange: this.handleEntryStateChange,
                    analysisFramework: this.props.analysisFramework,
                    lead: this.props.lead,
                    leadId: this.props.leadId,

                    entryStates: this.state.entryStates,
                    bookId: this.props.lead && this.props.lead.tabularBook,
                    statuses: this.props.statuses,
                }),
                wrapContainer: true,
                lazyMount: true,
                mount: true,
            },
            [VIEW.group]: {
                component: Group,
                rendererParams: () => ({
                    leadId: this.props.leadId,
                    bookId: this.props.lead && this.props.lead.tabularBook,
                }),
                wrapContainer: true,
                lazyMount: true,
                mount: true,
            },
        };

        this.defaultHash = VIEW.overview;

        this.saveRequestCoordinator = new CoordinatorBuilder()
            .maxActiveActors(4)
            .preSession(() => {
                this.setState({ pendingSaveAll: true });
            })
            .postSession((totalErrors) => {
                if (totalErrors > 0) {
                    notify.send({
                        type: notify.type.ERROR,
                        title: _ts('editEntry', 'entrySave'),
                        message: _ts('editEntry', 'entrySaveFailure', { errorCount: totalErrors }),
                        duration: notify.duration.SLOW,
                    });
                } else {
                    notify.send({
                        type: notify.type.SUCCESS,
                        title: _ts('editEntry', 'entrySave'),
                        message: _ts('editEntry', 'entrySaveSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                }

                this.setState({
                    pendingSaveAll: false,
                    pendingSaveAllEntryGroup: true,
                }, () => {
                    this.handleEntryGroupSave();
                });
            })
            .build();

        this.saveEntryGroupRequestCoordinator = new CoordinatorBuilder()
            .maxActiveActors(4)
            .preSession(() => {
                this.setState({ pendingSaveAllEntryGroup: true });
            })
            .postSession((totalErrors) => {
                if (totalErrors > 0) {
                    notify.send({
                        type: notify.type.ERROR,
                        title: _ts('editEntry', 'entryGroupSave'),
                        message: _ts('editEntry', 'entryGroupSaveFailure', { errorCount: totalErrors }),
                        duration: notify.duration.SLOW,
                    });
                } else {
                    notify.send({
                        type: notify.type.SUCCESS,
                        title: _ts('editEntry', 'entryGroupSave'),
                        message: _ts('editEntry', 'entryGroupSaveSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                }
                this.setState({ pendingSaveAllEntryGroup: false });
            })
            .build();
    }

    componentDidMount() {
        const {
            leadId,
            entries,
            analysisFramework,

            resetUiState,
            resetEntryGroupUiState,
            updateEntriesBulk,
        } = this.props;

        resetUiState(leadId);
        resetEntryGroupUiState(leadId);

        // Update all entries with new color
        if (entries && analysisFramework && analysisFramework.widgets && entries.length > 0) {
            const bulkData = entries.reduce((acc, entry) => {
                const entryKey = entryAccessor.key(entry);
                acc[entryKey] = { localData: {} };
                acc[entryKey].localData.color = calculateEntryColor(
                    entryAccessor.dataAttributes(entry),
                    analysisFramework,
                );
                return acc;
            }, {});

            updateEntriesBulk({ leadId, bulkData });
        }
    }

    componentWillUnmount() {
        this.saveRequestCoordinator.stop();
        this.saveEntryGroupRequestCoordinator.stop();
    }

    getSavableEntries = memoize((entries, statuses) => entries.filter((entry) => {
        const entryKey = entryAccessor.key(entry);
        const status = statuses[entryKey];
        return status === ENTRY_STATUS.serverError || status === ENTRY_STATUS.nonPristine;
    }))

    getSavableEntryGroups = memoize((entryGroups, statuses) => entryGroups.filter((entryGroup) => {
        const entryGroupKey = entryAccessor.key(entryGroup);
        const status = statuses[entryGroupKey];
        return status === ENTRY_STATUS.serverError || status === ENTRY_STATUS.nonPristine;
    }))

    getTabs = memoize((labels) => {
        const tabs = {
            [VIEW.overview]: _ts('editEntry', 'overviewTabTitle'),
            [VIEW.list]: _ts('editEntry', 'listTabTitle'),
            [VIEW.group]: _ts('editEntry', 'groupTabTitle'),
        };

        if (labels && labels.length > 0) {
            return tabs;
        }

        delete tabs[VIEW.group];

        return tabs;
    })

    shouldHideEditLink = () => {
        const {
            analysisFramework: {
                isAdmin,
            },
        } = this.props;
        return !isAdmin;
    }

    handleValidationFailure = (faramErrors, entryKey) => {
        const proxyRequest = {
            start: () => {
                const {
                    setEntryError,
                    leadId,
                } = this.props;

                setEntryError({
                    leadId,
                    key: entryKey,
                    errors: faramErrors,
                });
                this.saveRequestCoordinator.notifyComplete(entryKey, true);
            },
            stop: () => {},
        };
        this.saveRequestCoordinator.add(entryKey, proxyRequest);
    }

    handleValidationSuccess = (values, entryKey, entry) => {
        // NOTE: update attributes in entry to get newEntry
        const settings = {
            data: {
                attributes: { $set: values },
            },
        };
        const newEntry = update(entry, settings);

        const {
            leadId,
            setPending,
            setEntryError,
            analysisFramework,
            saveEntry,
        } = this.props;

        const entryData = {
            ...entryAccessor.data(newEntry),
            clientId: entryKey,
        };

        let urlForEntry;
        let paramsForEntry;
        const serverId = entryAccessor.serverId(entry);
        if (serverId) {
            urlForEntry = createUrlForEntryEdit(serverId);
            paramsForEntry = () => createParamsForEntryEdit(entryData);
        } else {
            urlForEntry = urlForEntryCreate;
            paramsForEntry = () => createParamsForEntryCreate(entryData);
        }

        const request = new FgRestBuilder()
            .url(urlForEntry)
            .params(paramsForEntry)
            .preLoad(() => {
                setPending({ leadId, entryKey, pending: true });
            })
            .afterLoad(() => {
                setPending({ leadId, entryKey, pending: false });
            })
            .success((response) => {
                try {
                    schemaValidator.validate(response, 'entry');
                    const color = calculateEntryColor(response.attributes, analysisFramework);
                    saveEntry({
                        leadId,
                        entryKey,
                        response,
                        color,
                    });
                    this.saveRequestCoordinator.notifyComplete(entryKey);
                } catch (err) {
                    console.error(err);
                    this.saveRequestCoordinator.notifyComplete(entryKey, true);
                }
            })
            .failure(() => {
                console.warn('Entry save error', ({ leadId, entryKey }));
                setEntryError({
                    leadId,
                    key: entryKey,
                    // TODO: handle error messages later
                    errors: undefined,
                    isServerError: true,
                });
                this.saveRequestCoordinator.notifyComplete(entryKey, true);
            })
            .fatal(() => {
                console.warn('Entry save error', ({ leadId, entryKey }));
                setEntryError({
                    leadId,
                    key: entryKey,
                    // TODO: handle error messages later
                    errors: undefined,
                    isServerError: true,
                });
                this.saveRequestCoordinator.notifyComplete(entryKey, true);
            })
            .build();
        this.saveRequestCoordinator.add(entryKey, request);
    }

    // HANDLERS

    handleDeleteLocalEntry = (entryKey) => {
        const pseudoRequest = {
            start: () => {
                const {
                    removeEntry,
                    leadId,
                } = this.props;
                removeEntry({
                    leadId,
                    key: entryKey,
                });
                this.saveRequestCoordinator.notifyComplete(entryKey);
            },
            stop: () => {}, // no-op
        };
        this.saveRequestCoordinator.add(entryKey, pseudoRequest);
    }

    handleDeleteEntry = (entryKey, entry) => {
        const {
            leadId,
            setPending,
            removeEntry,
            setEntryError,
        } = this.props;

        const serverId = entryAccessor.serverId(entry);

        const request = new FgRestBuilder()
            .url(createUrlForDeleteEntry(serverId))
            .params(createParamsForDeleteEntry)
            .preLoad(() => {
                setPending({ leadId, entryKey, pending: true });
            })
            .afterLoad(() => {
                setPending({ leadId, entryKey, pending: false });
            })
            .success(() => {
                removeEntry({
                    leadId,
                    key: entryKey,
                });
                this.saveRequestCoordinator.notifyComplete(entryKey);
            })
            .failure(() => {
                console.warn('Entry delete error', ({ leadId, entryKey }));
                setEntryError({
                    leadId,
                    key: entryKey,
                    // TODO: handle error messages later
                    errors: undefined,
                    isServerError: true,
                });
                this.saveRequestCoordinator.notifyComplete(entryKey, true);
            })
            .fatal(() => {
                console.warn('Entry delete error', ({ leadId, entryKey }));
                setEntryError({
                    leadId,
                    key: entryKey,
                    // TODO: handle error messages later
                    errors: undefined,
                    isServerError: true,
                });
                this.saveRequestCoordinator.notifyComplete(entryKey, true);
            })
            .build();

        this.saveRequestCoordinator.add(entryKey, request);
    }

    handleDeleteLocalEntryGroup = (entryGroupKey) => {
        const pseudoRequest = {
            start: () => {
                const {
                    removeEntryGroup,
                    leadId,
                } = this.props;
                removeEntryGroup({
                    leadId,
                    key: entryGroupKey,
                });
                this.saveEntryGroupRequestCoordinator.notifyComplete(entryGroupKey);
            },
            stop: () => {}, // no-op
        };
        this.saveEntryGroupRequestCoordinator.add(entryGroupKey, pseudoRequest);
    }

    handleDeleteEntryGroup = (entryGroupKey, entryGroup) => {
        const {
            leadId,
            setEntryGroupPending,
            removeEntryGroup,
            setEntryGroupError,
        } = this.props;

        const serverId = entryGroupAccessor.serverId(entryGroup);

        const request = new FgRestBuilder()
            .url(createUrlForDeleteEntryGroup(leadId, serverId))
            .params(createParamsForDeleteEntry)
            .preLoad(() => {
                setEntryGroupPending({ leadId, entryGroupKey, pending: true });
            })
            .afterLoad(() => {
                setEntryGroupPending({ leadId, entryGroupKey, pending: false });
            })
            .success(() => {
                removeEntryGroup({
                    leadId,
                    key: entryGroupKey,
                });
                this.saveEntryGroupRequestCoordinator.notifyComplete(entryGroupKey);
            })
            .failure(() => {
                console.warn('Entry group delete error', ({ leadId, entryGroupKey }));
                setEntryGroupError({
                    leadId,
                    key: entryGroupKey,
                    // TODO: handle error messages later
                    errors: undefined,
                    isServerError: true,
                });
                this.saveEntryGroupRequestCoordinator.notifyComplete(entryGroupKey, true);
            })
            .fatal(() => {
                console.warn('Entry group delete error', ({ leadId, entryGroupKey }));
                setEntryGroupError({
                    leadId,
                    key: entryGroupKey,
                    // TODO: handle error messages later
                    errors: undefined,
                    isServerError: true,
                });
                this.saveEntryGroupRequestCoordinator.notifyComplete(entryGroupKey, true);
            })
            .build();

        this.saveEntryGroupRequestCoordinator.add(entryGroupKey, request);
    }

    handleSaveEntryGroup = (entryGroupKey, entryGroup) => {
        const {
            entries,
            setEntryGroupPending,
            leadId,
            setEntryGroupError,
            saveEntryGroup,
            labels,
        } = this.props;
        // NOTE: no need to use filteredEntries,
        // at this point there should only be saved entries
        const entryMap = listToMap(
            entries,
            entryAccessor.key,
            entry => entry,
        );

        const entryGroupData = entryGroupAccessor.data(entryGroup);

        const labelMap = listToMap(
            labels,
            label => label.id,
            label => label,
        );

        const newEntryGroupData = {
            ...entryGroupData,
            clientId: entryGroupKey,
            title: entryGroupData.title
                ? entryGroupData.title
                : `Group ${entryGroupData.order}`,
            selections: entryGroupData.selections
                .map((selection) => {
                    const entry = entryMap[selection.entryClientId];
                    if (!entry || entryAccessor.isMarkedAsDeleted(entry)) {
                        // NOTE: entry was deleted
                        return undefined;
                    }
                    const entryServerId = entryAccessor.serverId(entry);
                    if (!entryServerId) {
                        // NOTE: entry has not been saved
                        return selection;
                    }
                    return {
                        ...selection,
                        entryId: entryServerId,
                    };
                })
                .filter(isDefined)
                .filter((selection) => {
                    const label = labelMap[selection.labelId];
                    return !!label;
                }),
        };

        let urlForEntryGroup;
        let paramsForEntryGroup;
        const serverId = entryGroupAccessor.serverId(entryGroup);
        if (serverId) {
            urlForEntryGroup = createUrlForEntryGroupEdit(leadId, serverId);
            paramsForEntryGroup = () => createParamsForEntryGroupEdit(newEntryGroupData);
        } else {
            urlForEntryGroup = createUrlForEntryGroupCreate(leadId);
            paramsForEntryGroup = () => createParamsForEntryGroupCreate(newEntryGroupData);
        }

        const request = new FgRestBuilder()
            .url(urlForEntryGroup)
            .params(paramsForEntryGroup)
            .preLoad(() => {
                setEntryGroupPending({ leadId, entryGroupKey, pending: true });
            })
            .afterLoad(() => {
                setEntryGroupPending({ leadId, entryGroupKey, pending: false });
            })
            .success((response) => {
                try {
                    // TODO: write schema
                    // schemaValidator.validate(response, 'entry');
                    saveEntryGroup({
                        leadId,
                        entryGroupKey,
                        response,
                    });
                    this.saveEntryGroupRequestCoordinator.notifyComplete(entryGroupKey);
                } catch (err) {
                    console.error(err);
                    this.saveEntryGroupRequestCoordinator.notifyComplete(entryGroupKey, true);
                }
            })
            .failure(() => {
                console.warn('Entry Group save error', ({ leadId, entryGroupKey }));
                setEntryGroupError({
                    leadId,
                    key: entryGroupKey,
                    // TODO: handle error messages later
                    errors: undefined,
                    isServerError: true,
                });
                this.saveEntryGroupRequestCoordinator.notifyComplete(entryGroupKey, true);
            })
            .fatal(() => {
                console.warn('Entry Group save error', ({ leadId, entryGroupKey }));
                setEntryGroupError({
                    leadId,
                    key: entryGroupKey,
                    // TODO: handle error messages later
                    errors: undefined,
                    isServerError: true,
                });
                this.saveEntryGroupRequestCoordinator.notifyComplete(entryGroupKey, true);
            })
            .build();

        this.saveEntryGroupRequestCoordinator.add(entryGroupKey, request);
    }

    handleCancel = () => {
        const { requests } = this.props;
        requests.editEntryDataRequest.do({
            cancelMode: true,
        });
    }

    handleSave = () => {
        const {
            entries,
            statuses,
            schema,
        } = this.props;

        const savableEntries = this.getSavableEntries(
            entries,
            statuses,
        );

        if (savableEntries.length <= 0) {
            this.handleEntryGroupSave();
            return;
        }

        savableEntries.forEach((entry) => {
            const entryKey = entryAccessor.key(entry);
            const isMarkedAsDeleted = entryAccessor.isMarkedAsDeleted(entry);

            if (isMarkedAsDeleted) {
                if (entryAccessor.serverId(entry)) {
                    this.handleDeleteEntry(entryKey, entry);
                } else {
                    this.handleDeleteLocalEntry(entryKey);
                }
            } else {
                detachedFaram({
                    value: entryAccessor.dataAttributes(entry),
                    schema,
                    onValidationFailure: (errors) => {
                        this.handleValidationFailure(errors, entryKey, entry);
                    },
                    onValidationSuccess: (values) => {
                        this.handleValidationSuccess(values, entryKey, entry);
                    },
                });
            }
        });

        this.saveRequestCoordinator.start();
    }

    handleEntryGroupSave = () => {
        const {
            entryGroups,
            entryGroupStatuses,
        } = this.props;

        const savableEntryGroups = this.getSavableEntryGroups(
            entryGroups,
            entryGroupStatuses,
        );

        if (savableEntryGroups.length <= 0) {
            // NOTE: pendingSaveAllEntryGroup is set to true by entry save coordinator
            this.setState({ pendingSaveAllEntryGroup: false });
            return;
        }

        savableEntryGroups.forEach((entryGroup) => {
            const entryGroupKey = entryGroupAccessor.key(entryGroup);
            const isMarkedAsDeleted = entryGroupAccessor.isMarkedAsDeleted(entryGroup);

            if (isMarkedAsDeleted) {
                if (entryGroupAccessor.serverId(entryGroup)) {
                    this.handleDeleteEntryGroup(entryGroupKey, entryGroup);
                } else {
                    this.handleDeleteLocalEntryGroup(entryGroupKey);
                }
            } else {
                this.handleSaveEntryGroup(entryGroupKey, entryGroup);
            }
        });

        // TODO:
        this.saveEntryGroupRequestCoordinator.start();
    }

    handleEntryStateChange = (entryKey, value) => {
        this.setState((state) => {
            const { entryStates } = state;
            const newEntryStates = produce(entryStates, (deferred) => {
                // eslint-disable-next-line no-param-reassign
                deferred[entryKey] = value;
            });
            return { entryStates: newEntryStates };
        });
    }

    render() {
        const {
            lead: {
                title: leadTitle,
                project: projectId,
            } = {},
            analysisFramework: {
                id: analysisFrameworkId,
            } = {},
            requests: {
                editEntryDataRequest: {
                    pending: pendingEditEntryData,
                },
            },
            entries,
            statuses,
            entryGroups,
            entryGroupStatuses,
            labels,
        } = this.props;

        const {
            pendingSaveAll,
            pendingSaveAllEntryGroup,
            projectMismatch,
        } = this.state;

        if (pendingEditEntryData) {
            return (
                <div className={styles.editEntries} >
                    <LoadingAnimation />
                </div>
            );
        }

        const exitPath = reverseRoute(pathNames.leads, {
            projectId,
        });

        const frameworkPath = reverseRoute(pathNames.analysisFramework, {
            analysisFrameworkId,
        });

        const savableEntries = this.getSavableEntries(
            entries,
            statuses,
        );

        const savableEntryGroups = this.getSavableEntryGroups(
            entryGroups,
            entryGroupStatuses,
        );

        const tabs = this.getTabs(labels);

        const hasSavableEntries = savableEntries.length > 0;

        const hasSavableEntryGroups = savableEntryGroups.length > 0;

        const hasSavableItems = hasSavableEntries || hasSavableEntryGroups;

        const isSaveDisabled = (
            pendingSaveAllEntryGroup || pendingSaveAll || projectMismatch || !hasSavableItems
        );

        return (
            <React.Fragment>
                <Prompt
                    message={
                        (location) => {
                            const { routeUrl } = this.props;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (!hasSavableItems) {
                                return true;
                            }
                            return _ts('common', 'youHaveUnsavedChanges');
                        }
                    }
                />
                <Page
                    className={styles.editEntries}
                    headerClassName={styles.header}
                    header={
                        <React.Fragment>
                            <BackLink defaultLink={exitPath} />
                            <h4 className={styles.heading}>
                                { leadTitle }
                            </h4>
                            <ScrollTabs
                                className={styles.tabs}
                                tabs={tabs}
                                useHash
                                replaceHistory
                                defaultHash={this.defaultHash}
                                disabled={projectMismatch}
                            />
                            <div className={styles.actionButtons}>
                                <Cloak
                                    hide={this.shouldHideEditLink}
                                    render={
                                        // viewsAcl not used because it doesn't
                                        // consider admin of af
                                        <Link
                                            className={styles.editFrameworkLink}
                                            to={frameworkPath}
                                        >
                                            <Icon
                                                name="edit"
                                                className={styles.editIcon}
                                            />
                                            { _ts('editEntry', 'editFrameworkTitle') }
                                        </Link>
                                    }
                                />
                                <DangerConfirmButton
                                    disabled={isSaveDisabled}
                                    onClick={this.handleCancel}
                                    confirmationMessage={_ts('editEntry', 'cancelConfirmDetail')}
                                >
                                    { _ts('editEntry', 'cancelButtonTitle') }
                                </DangerConfirmButton>
                                <SuccessButton
                                    disabled={isSaveDisabled}
                                    onClick={this.handleSave}
                                    pending={pendingSaveAll || pendingSaveAllEntryGroup}
                                >
                                    { _ts('editEntry', 'saveButtonTitle') }
                                </SuccessButton>
                            </div>
                        </React.Fragment>
                    }
                    mainContentClassName={styles.mainContent}
                    mainContent={
                        !projectMismatch ? (
                            <MultiViewContainer
                                views={this.views}
                                useHash
                                containerClassName={styles.content}
                                activeClassName={styles.active}
                            />
                        ) : (
                            <Message>
                                { _ts('editEntry', 'noLeadMessage')}
                            </Message>
                        )
                    }
                />
            </React.Fragment>
        );
    }
}
