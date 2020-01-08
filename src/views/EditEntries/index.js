import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link, Prompt } from 'react-router-dom';
import produce from 'immer';
import memoize from 'memoize-one';

import { reverseRoute } from '@togglecorp/fujs';
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

    editEntriesAddEntryAction,
    editEntriesClearEntriesAction,
    editEntriesRemoveEntryAction,
    editEntriesSaveEntryAction,
    editEntriesSetEntriesAction,
    editEntriesSetEntriesCommentsCountAction,
    editEntriesUpdateEntriesBulkAction,
    editEntriesSetEntryDataAction,
    editEntriesSetEntryErrorsAction,
    editEntriesSetExcerptAction,
    editEntriesSetLeadAction,
    editEntriesSetPendingAction,
    editEntriesResetUiStateAction,
    editEntriesResetEntryGroupUiStateAction,
    editEntriesSetLabelsAction,
    editEntriesEntryGroupsSelector,
    editEntriesSetEntryGroupsAction,
    editEntriesEntryGroupsClearEntriesAction,
    editEntriesRemoveEntryGroupAction,

    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    setRegionsForProjectAction,
} from '#redux';
import notify from '#notify';
import _ts from '#ts';
import { VIEW } from '#widgets';

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

    entryGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types, react/no-unused-prop-types, max-len
    setAnalysisFramework: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types, max-len
    setEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setEntryGroups: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setGeoOptions: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setLead: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setRegions: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setEntriesCommentsCount: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types, max-len
    setLabels: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types, max-len
    resetEntryGroupUiState: PropTypes.func.isRequired,

    clearEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    clearEntryGroups: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    removeEntry: PropTypes.func.isRequired,
    removeEntryGroup: PropTypes.func.isRequired,
    saveEntry: PropTypes.func.isRequired,
    updateEntriesBulk: PropTypes.func.isRequired,
    setEntryError: PropTypes.func.isRequired,
    setPending: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
    entries: [],
    entryGroups: [],
    statuses: {},
    entryGroupStatuses: {},
    schema: {},
    computeSchema: {},
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
});

const mapDispatchToProps = dispatch => ({
    addEntry: params => dispatch(editEntriesAddEntryAction(params)),
    clearEntries: params => dispatch(editEntriesClearEntriesAction(params)),
    clearEntryGroups: params => dispatch(editEntriesEntryGroupsClearEntriesAction(params)),
    removeEntry: params => dispatch(editEntriesRemoveEntryAction(params)),
    removeEntryGroup: params => dispatch(editEntriesRemoveEntryGroupAction(params)),
    saveEntry: params => dispatch(editEntriesSaveEntryAction(params)),
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setEntries: params => dispatch(editEntriesSetEntriesAction(params)),
    setEntryGroups: params => dispatch(editEntriesSetEntryGroupsAction(params)),
    setEntriesCommentsCount: params => dispatch(editEntriesSetEntriesCommentsCountAction(params)),
    updateEntriesBulk: params => dispatch(editEntriesUpdateEntriesBulkAction(params)),
    setEntryData: params => dispatch(editEntriesSetEntryDataAction(params)),
    setEntryError: params => dispatch(editEntriesSetEntryErrorsAction(params)),
    setExcerpt: params => dispatch(editEntriesSetExcerptAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
    setLead: params => dispatch(editEntriesSetLeadAction(params)),
    setPending: params => dispatch(editEntriesSetPendingAction(params)),
    setRegions: params => dispatch(setRegionsForProjectAction(params)),
    resetUiState: params => dispatch(editEntriesResetUiStateAction(params)),
    resetEntryGroupUiState: params => dispatch(editEntriesResetEntryGroupUiStateAction(params)),
    setLabels: params => dispatch(editEntriesSetLabelsAction(params)),
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

            const newResponse = {
                ...response,
                labels: [
                    { id: 1, order: 1, title: 'Problem', color: 'red' },
                    { id: 2, order: 2, title: 'Solution', color: 'orange' },
                    { id: 3, order: 3, title: 'Remarks', color: 'blue' },
                ],
                entryGroups: [
                    {
                        id: 1,
                        clientId: 'pipkbabx',
                        versionId: 3,
                        order: 1,
                        title: 'Group first',
                        selections: [
                            {
                                id: 1,
                                entryId: 52,
                                entryClientId: 'xv9sn3a6',
                                labelId: 1,
                            },
                            {
                                id: 2,
                                entryId: 53,
                                entryClientId: 'xlpebkgu',
                                labelId: 2,
                            },
                        ],
                    },
                ],
            };

            const {
                lead,
                geoOptions,
                analysisFramework,
                entries,
                entryGroups,
                regions,
                labels,
            } = newResponse;

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

            setLabels({ leadId, labels });

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

        this.tabs = {
            [VIEW.overview]: _ts('editEntry', 'overviewTabTitle'),
            [VIEW.list]: _ts('editEntry', 'listTabTitle'),
            [VIEW.group]: _ts('editEntry', 'groupTabTitle'),
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
                this.setState({ pendingSaveAll: false });
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
        if (entries && analysisFramework && entries.length > 0) {
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

    shouldHideEditLink = () => {
        const {
            analysisFramework: {
                isAdmin,
            },
        } = this.props;
        return !isAdmin;
    }

    // APIS

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
                    this.saveRequestCoordinator.notifyComplete(entryKey, false);
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
                this.saveRequestCoordinator.notifyComplete(entryKey, false);
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
                this.saveRequestCoordinator.notifyComplete(entryKey, false);
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
                this.saveRequestCoordinator.notifyComplete(entryKey, false);
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
                this.saveRequestCoordinator.notifyComplete(entryKey, false);
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
                this.saveRequestCoordinator.notifyComplete(entryGroupKey);
            },
            stop: () => {}, // no-op
        };
        this.saveRequestCoordinator.add(entryGroupKey, pseudoRequest);
    }

    handleDeleteEntryGroup = (entryGroupKey, entry) => {
        console.warn('Delete entry group', entryGroupKey, entry);
    }

    handleSaveEntryGroup = (entryGroupKey, entry) => {
        console.warn('Save entry group', entryGroupKey, entry);
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
            computeSchema,
            entryGroups,
            entryGroupStatuses,
        } = this.props;

        const savableEntries = this.getSavableEntries(
            entries,
            statuses,
        );

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
                    error: entryAccessor.error(entry),

                    schema,
                    computeSchema,
                    onChange: this.handleChange,

                    onValidationFailure: (errors) => {
                        this.handleValidationFailure(errors, entryKey, entry);
                    },
                    onValidationSuccess: (values) => {
                        this.handleValidationSuccess(values, entryKey, entry);
                    },
                });
            }
        });

        const savableEntryGroups = this.getSavableEntryGroups(
            entryGroups,
            entryGroupStatuses,
        );

        savableEntryGroups.forEach((entryGroup) => {
            const entryGroupKey = entryGroupAccessor.key(entryGroup);
            const isMarkedAsDeleted = entryGroupAccessor.isMarkedAsDeleted(entryGroup);

            if (isMarkedAsDeleted) {
                if (entryAccessor.serverId(entryGroup)) {
                    this.handleDeleteEntryGroup(entryGroupKey, entryGroup);
                } else {
                    this.handleDeleteLocalEntryGroup(entryGroupKey);
                }
            } else {
                this.handleSaveEntryGroup(entryGroupKey, entryGroup);
            }
        });

        this.saveRequestCoordinator.start();
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
        } = this.props;

        const {
            pendingSaveAll,
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

        const hasSavableEntries = savableEntries.length > 0;

        const hasSavableEntryGroups = savableEntryGroups.length > 0;

        const hasSavableItems = hasSavableEntries || hasSavableEntryGroups;

        const isSaveDisabled = (
            pendingSaveAll || projectMismatch || !hasSavableItems
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
                                tabs={this.tabs}
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
                                    pending={pendingSaveAll}
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
