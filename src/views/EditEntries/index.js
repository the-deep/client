import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link, Prompt } from 'react-router-dom';
import produce from 'immer';

import { reverseRoute } from '@togglecorp/fujs';
import { detachedFaram } from '@togglecorp/faram';

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
import { entryAccessor, ENTRY_STATUS } from '#entities/editEntries';

import { RequestCoordinator } from '#request';
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

    editEntriesAddEntryAction,
    editEntriesClearEntriesAction,
    editEntriesRemoveEntryAction,
    editEntriesSaveEntryAction,
    editEntriesSetEntriesAction,
    editEntriesUpdateEntriesBulkAction,
    editEntriesSetEntryDataAction,
    editEntriesSetEntryErrorsAction,
    editEntriesSetExcerptAction,
    editEntriesSetLeadAction,
    editEntriesSetPendingAction,
    editEntriesResetUiStateAction,
    editEntriesSetTabularDataAction,

    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    setRegionsForProjectAction,
    activeProjectRoleSelector,
} from '#redux';
import notify from '#notify';
import _ts from '#ts';
import { VIEW } from '#widgets';

import EditEntryDataRequest from './requests/EditEntryDataRequest';
import EditEntryDeleteRequest from './requests/EditEntryDeleteRequest';
import EditEntrySaveRequest from './requests/EditEntrySaveRequest';

import {
    calculateEntryColor,
    calculateFirstTimeAttributes,
} from './entryDataCalculator';
import Overview from './Overview';
import Listing from './List';

import styles from './styles.scss';

const propTypes = {
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    schema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    computeSchema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    addEntry: PropTypes.func.isRequired,
    clearEntries: PropTypes.func.isRequired,
    removeEntry: PropTypes.func.isRequired,
    saveEntry: PropTypes.func.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    setEntries: PropTypes.func.isRequired,
    updateEntriesBulk: PropTypes.func.isRequired,
    setEntryData: PropTypes.func.isRequired,
    setEntryError: PropTypes.func.isRequired,
    setExcerpt: PropTypes.func.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    setPending: PropTypes.func.isRequired,
    setRegions: PropTypes.func.isRequired,
    setTabularData: PropTypes.func.isRequired,

    resetUiState: PropTypes.func.isRequired,
    routeUrl: PropTypes.string.isRequired,
};

const defaultProps = {
    projectRole: {},
    analysisFramework: undefined,
    entries: [],
    statuses: {},
    schema: {},
    computeSchema: {},
};

const mapStateToProps = state => ({
    projectRole: activeProjectRoleSelector(state),
    analysisFramework: editEntriesAnalysisFrameworkSelector(state),
    entries: editEntriesEntriesSelector(state),
    lead: editEntriesLeadSelector(state),
    leadId: leadIdFromRoute(state),
    projectId: projectIdFromRoute(state),
    schema: editEntriesSchemaSelector(state),
    computeSchema: editEntriesComputeSchemaSelector(state),
    statuses: editEntriesStatusesSelector(state),
    routeUrl: routeUrlSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addEntry: params => dispatch(editEntriesAddEntryAction(params)),
    clearEntries: params => dispatch(editEntriesClearEntriesAction(params)),
    removeEntry: params => dispatch(editEntriesRemoveEntryAction(params)),
    saveEntry: params => dispatch(editEntriesSaveEntryAction(params)),
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setEntries: params => dispatch(editEntriesSetEntriesAction(params)),
    updateEntriesBulk: params => dispatch(editEntriesUpdateEntriesBulkAction(params)),
    setEntryData: params => dispatch(editEntriesSetEntryDataAction(params)),
    setEntryError: params => dispatch(editEntriesSetEntryErrorsAction(params)),
    setExcerpt: params => dispatch(editEntriesSetExcerptAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
    setLead: params => dispatch(editEntriesSetLeadAction(params)),
    setPending: params => dispatch(editEntriesSetPendingAction(params)),
    setRegions: params => dispatch(setRegionsForProjectAction(params)),
    resetUiState: params => dispatch(editEntriesResetUiStateAction(params)),
    setTabularData: params => dispatch(editEntriesSetTabularDataAction(params)),
});

@RequestCoordinator
@connect(mapStateToProps, mapDispatchToProps)
export default class EditEntries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calculateSavableEntries = (entries, statuses) => entries.filter((entry) => {
        const entryKey = entryAccessor.key(entry);
        const status = statuses[entryKey];
        return status === ENTRY_STATUS.serverError || status === ENTRY_STATUS.nonPristine;
    })

    constructor(props) {
        super(props);

        this.state = {
            pendingEditEntryData: true,
            pendingSaveAll: false,
            projectMismatch: false,
            entryStates: {},
        };

        this.views = {
            [VIEW.overview]: {
                component: () => (
                    <Overview
                        // injected inside WidgetFaram
                        onChange={this.handleChange}
                        onTabularLoad={this.handleTabularLoad}
                        onExcerptChange={this.handleExcerptChange}
                        onExcerptCreate={this.handleExcerptCreate}
                        schema={this.props.schema}
                        computeSchema={this.props.computeSchema}
                        entryStates={this.state.entryStates}
                        onEntryStateChange={this.handleEntryStateChange}
                    />
                ),
                wrapContainer: true,
                lazyMount: false,
                mount: true,
            },

            [VIEW.list]: {
                component: () => (
                    <Listing
                        // NOTE: to re-render Listing when has changes
                        hash={window.location.hash}
                        // injected inside WidgetFaram
                        onChange={this.handleChange}
                        onExcerptChange={this.handleExcerptChange}
                        onExcerptCreate={this.handleExcerptCreate}
                        schema={this.props.schema}
                        computeSchema={this.props.computeSchema}
                        entryStates={this.state.entryStates}
                        onEntryStateChange={this.handleEntryStateChange}
                    />
                ),
                wrapContainer: true,
                lazyMount: true,
                mount: true,
            },
        };

        this.tabs = {
            [VIEW.overview]: _ts('editEntry', 'overviewTabTitle'),
            [VIEW.list]: _ts('editEntry', 'listTabTitle'),
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

        this.editEntryDataRequest = new EditEntryDataRequest({
            getProjectId: () => this.props.projectId,
            getEntries: () => this.props.entries,
            setAnalysisFramework: this.props.setAnalysisFramework,
            setEntries: this.props.setEntries,
            setGeoOptions: this.props.setGeoOptions,
            setLead: this.props.setLead,
            setRegions: this.props.setRegions,
            setState: params => this.setState(params),
            calculateEntryColor,
        });

        this.savableEntries = EditEntries.calculateSavableEntries(
            this.props.entries,
            this.props.statuses,
        );
    }

    componentWillMount() {
        const { leadId, resetUiState } = this.props;
        resetUiState(leadId);
    }

    componentDidMount() {
        const { leadId, entries, analysisFramework } = this.props;

        // Update all entries with new color
        if (entries && analysisFramework && entries.length > 0) {
            const bulkData = entries.reduce((acc, entry) => {
                const entryKey = entryAccessor.key(entry);
                acc[entryKey] = { localData: {} };
                acc[entryKey].localData.color = this.calculateEntryColor(
                    entryAccessor.dataAttributes(entry),
                );
                return acc;
            }, {});

            this.props.updateEntriesBulk({ leadId, bulkData });
        }

        this.editEntryDataRequest.init({ leadId });
        this.editEntryDataRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { leadId } = nextProps;
        if (this.props.leadId !== leadId && leadId) {
            this.saveRequestCoordinator.stop();

            this.editEntryDataRequest.init({ leadId });
            this.editEntryDataRequest.start();
        }

        if (
            this.props.entries !== nextProps.entries ||
            this.props.statuses !== nextProps.statuses
        ) {
            this.savableEntries = EditEntries.calculateSavableEntries(
                nextProps.entries,
                nextProps.statuses,
            );
        }
    }

    componentWillUnmount() {
        this.editEntryDataRequest.stop();
        this.saveRequestCoordinator.stop();
    }

    // PERMISSION

    setExcerpt = (val) => {
        if (this.shouldDisableEntryChange(val.id)) {
            console.warn('No permission to edit entry excerpt');
            return;
        }
        this.props.setExcerpt(val);
    }

    setEntryData = (val) => {
        if (this.shouldDisableEntryChange(val.id)) {
            console.warn('No permission to edit entry');
            return;
        }
        this.props.setEntryData(val);
    }

    addEntry = (val) => {
        if (this.shouldDisableEntryCreate()) {
            console.warn('No permission to create entry');
            return;
        }
        this.props.addEntry(val);
    }

    // PERMISSIONS

    shouldDisableEntryChange = (entryId) => {
        const { projectRole: { entryPermissions = {} } } = this.props;
        return !entryPermissions.modify && !!entryId;
    }

    shouldDisableEntryCreate = () => {
        const { projectRole: { entryPermissions = {} } } = this.props;
        return !entryPermissions.create;
    }

    shouldHideEditLink = () => {
        const {
            analysisFramework: {
                isAdmin,
            },
        } = this.props;
        return !isAdmin;
    }

    // CALCULATIONS

    calculateFirstTimeAttributes = attributes => calculateFirstTimeAttributes(
        attributes,
        this.props.analysisFramework,
        this.props.lead,
    )

    calculateEntryColor = attributes => calculateEntryColor(
        attributes,
        this.props.analysisFramework,
    )

    // APIS

    handleTabularLoad = (book) => {
        this.props.setTabularData({
            leadId: this.props.leadId,
            tabularData: book,
        });
    }

    // can only edit entry
    handleExcerptChange = ({ type, value }, entryKey, entryId) => {
        if (!entryKey) {
            console.warn('There is no entry key while changing excerpt.');
            // this.handleExcerptCreate({ type, value });
        } else {
            this.setExcerpt({
                leadId: this.props.leadId,
                key: entryKey,
                id: entryId,
                excerptType: type,
                excerptValue: value,
            });
        }
    }

    // can only create entry
    handleExcerptCreate = ({ type, value }) => {
        this.addEntry({
            leadId: this.props.leadId,
            entry: {
                analysisFramework: this.props.analysisFramework.id,
                excerptType: type,
                excerptValue: value,
                attributes: this.calculateFirstTimeAttributes({}),
            },
        });
    }

    // FARAM

    // can edit/create entry
    // create when 'newEntry' is on info or entryKey is undefined
    handleChange = (faramValues, faramErrors, faramInfo, entryKey, entryId) => {
        const { analysisFramework } = this.props;
        if (faramInfo.action === 'newEntry') {
            // TODO: if excerpt already exists modify existing entry
            // instead of creating a new one

            const {
                excerptType,
                excerptValue,
                value,
                faramElementName,
            } = faramInfo;

            // Create attribute using faramElementName and value
            let attributes = value;
            [...faramElementName].reverse().forEach((key) => {
                attributes = { [key]: attributes };
            });

            attributes = this.calculateFirstTimeAttributes(attributes);
            const color = this.calculateEntryColor(attributes);

            this.addEntry({
                leadId: this.props.leadId,
                entry: {
                    excerptType,
                    excerptValue,
                    lead: this.props.leadId,
                    attributes,
                    color,
                    analysisFramework: analysisFramework.id,
                },
            });
        } else if (entryKey === undefined && faramInfo.isComputed) {
            console.warn('Ignoring entry change if there is no entry key and the change is from entry creation.');
            // pass
        } else if (entryKey === undefined) {
            const excerptValue = '';
            const excerptType = 'excerpt';

            const attributes = this.calculateFirstTimeAttributes(faramValues);
            const color = this.calculateEntryColor(attributes);

            this.addEntry({
                leadId: this.props.leadId,
                entry: {
                    excerptType,
                    excerptValue,
                    lead: this.props.leadId,
                    attributes,
                    color,
                    analysisFramework: analysisFramework.id,
                },
            });
        } else {
            const color = this.calculateEntryColor(faramValues);
            this.setEntryData({
                leadId: this.props.leadId,
                key: entryKey,
                id: entryId,
                values: faramValues,
                errors: faramErrors,
                info: faramInfo,
                color,
            });
        }
    }

    handleValidationFailure = (faramErrors, entryKey) => {
        const proxyRequest = {
            start: () => {
                this.props.setEntryError({
                    leadId: this.props.leadId,
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

        const request = new EditEntrySaveRequest({
            setPending: this.props.setPending,
            saveEntry: this.props.saveEntry,
            setEntryServerError: (data) => {
                console.warn('Entry save error', data);
                this.props.setEntryError({
                    leadId: this.props.leadId,
                    key: entryKey,
                    // TODO: handle error messages later
                    errors: undefined,
                    isServerError: true,
                });
            },
            getCoordinator: () => this.saveRequestCoordinator,
            calculateEntryColor: this.calculateEntryColor,
        });
        request.init({
            leadId: this.props.leadId,
            entryKey: entryAccessor.key(newEntry),
            entryData: {
                ...entryAccessor.data(newEntry),
                clientId: entryKey,
            },
            serverId: entryAccessor.serverId(newEntry),
        });
        this.saveRequestCoordinator.add(entryKey, request);
    }

    // HANDLERS

    handleDeleteLocalEntry = (entryKey) => {
        const pseudoRequest = {
            start: () => {
                this.props.removeEntry({
                    leadId: this.props.leadId,
                    key: entryKey,
                });
                this.saveRequestCoordinator.notifyComplete(entryKey);
            },
            stop: () => {}, // no-op
        };
        this.saveRequestCoordinator.add(entryKey, pseudoRequest);
    }

    handleDeleteEntry = (entryKey, entry) => {
        const request = new EditEntryDeleteRequest({
            setPending: this.props.setPending,
            removeEntry: this.props.removeEntry,
            setEntryServerError: (data) => {
                console.warn('Entry delete error', data);
                this.props.setEntryError({
                    leadId: this.props.leadId,
                    key: entryKey,
                    // TODO: handle error messages later
                    errors: undefined,
                    isServerError: true,
                });
            },
            getCoordinator: () => this.saveRequestCoordinator,
        });
        request.init({
            leadId: this.props.leadId,
            entryKey: entryAccessor.key(entry),
            serverId: entryAccessor.serverId(entry),
        });
        this.saveRequestCoordinator.add(entryKey, request);
    }

    handleSave = () => {
        this.savableEntries.forEach((entry) => {
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

                    schema: this.props.schema,
                    computeSchema: this.props.computeSchema,
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

        this.saveRequestCoordinator.start();
    }

    handleCancel = () => {
        const { leadId } = this.props;
        this.props.clearEntries({ leadId });
        this.editEntryDataRequest.init({ leadId });
        this.editEntryDataRequest.start();
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
        } = this.props;

        const {
            pendingEditEntryData,
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

        const hasSavableEntries = this.savableEntries.length > 0;
        const isSaveDisabled = (
            pendingEditEntryData || pendingSaveAll || projectMismatch || !hasSavableEntries
        );

        return (
            <React.Fragment>
                <Prompt
                    message={
                        (location) => {
                            const { routeUrl } = this.props;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (!hasSavableEntries) {
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
                                        /* viewsAcl not used because it
                                            doesn't consider admin of af */
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
