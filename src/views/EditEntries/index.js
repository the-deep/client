import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link, Prompt } from 'react-router-dom';

import { reverseRoute } from '#rs/utils/common';
import update from '#rs/utils/immutable-update';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import { detachedFaram } from '#rsci/Faram';
import FixedTabs from '#rscv/FixedTabs';
import Message from '#rscv/Message';
import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';
import { CoordinatorBuilder } from '#rsu/coordinate';

import Cloak from '#components/Cloak';
import { entryAccessor, ENTRY_STATUS } from '#entities/editEntries';
import {
    iconNames,
    pathNames,
} from '#constants';
import {
    leadIdFromRoute,
    projectIdFromRoute,

    routeUrlSelector,

    editEntriesAnalysisFrameworkSelector,
    editEntriesEntriesSelector,
    editEntriesLeadSelector,
    editEntriesSchemaSelector,
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

    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    setRegionsForProjectAction,
} from '#redux';
import notify from '#notify';
import _ts from '#ts';

import EditEntryDataRequest from './requests/EditEntryDataRequest';
import EditEntryDeleteRequest from './requests/EditEntryDeleteRequest';
import EditEntrySaveRequest from './requests/EditEntrySaveRequest';

import calculateEntryData from './entryDataCalculator';
import Overview from './Overview';
import Listing from './List';

import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    schema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
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

    routeUrl: PropTypes.string.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
    entries: [],
    statuses: {},
    schema: {},
};

const mapStateToProps = state => ({
    analysisFramework: editEntriesAnalysisFrameworkSelector(state),
    entries: editEntriesEntriesSelector(state),
    lead: editEntriesLeadSelector(state),
    leadId: leadIdFromRoute(state),
    projectId: projectIdFromRoute(state),
    schema: editEntriesSchemaSelector(state),
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
});


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
        };

        this.views = {
            overview: {
                component: () => (
                    <Overview
                        // injected inside WidgetFaram
                        onChange={this.handleChange}
                        onExcerptChange={this.handleExcerptChange}
                        onExcerptCreate={this.handleExcerptCreate}
                        schema={this.props.schema}
                    />
                ),
                wrapContainer: true,
                lazyMount: true,
                mount: true,
            },

            list: {
                component: () => (
                    <Listing
                        // NOTE: to re-render Listing when has changes
                        hash={window.location.hash}
                        // injected inside WidgetFaram
                        onChange={this.handleChange}
                        onExcerptChange={this.handleExcerptChange}
                        onExcerptCreate={this.handleExcerptCreate}
                        schema={this.props.schema}
                    />
                ),
                wrapContainer: true,
                lazyMount: true,
                mount: true,
            },
        };

        // FIXME: use strings
        this.tabs = {
            overview: 'Overview',
            list: 'List',
        };

        this.defaultHash = 'overview';

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
            clearEntries: this.props.clearEntries,
            getAf: () => this.props.analysisFramework,
            getProjectId: () => this.props.projectId,
            getEntries: () => this.props.entries,
            setAnalysisFramework: this.props.setAnalysisFramework,
            setEntries: this.props.setEntries,
            setGeoOptions: this.props.setGeoOptions,
            setLead: this.props.setLead,
            setRegions: this.props.setRegions,
            setState: params => this.setState(params),
            calculateEntryData,
        });

        this.savableEntries = EditEntries.calculateSavableEntries(
            this.props.entries,
            this.props.statuses,
        );
    }

    componentDidMount() {
        const { leadId, entries, analysisFramework } = this.props;

        // Update extra data (like color) for all existing entries
        if (entries && analysisFramework && entries.length > 0) {
            const data = entries.reduce((acc, entry) => {
                const entryKey = entryAccessor.key(entry);
                acc[entryKey] = calculateEntryData(
                    entryAccessor.dataAttributes(entry),
                    analysisFramework,
                );
                return acc;
            }, {});

            this.props.updateEntriesBulk({ leadId, data });
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

    // APIS

    handleExcerptChange = ({ type, value }, entryKey) => {
        if (!entryKey) {
            console.error('This should not occur');
            // this.handleExcerptCreate({ type, value });
        } else {
            this.props.setExcerpt({
                leadId: this.props.leadId,
                key: entryKey,
                excerptType: type,
                excerptValue: value,
            });
        }
    }

    handleExcerptCreate = ({ type, value }) => {
        this.props.addEntry({
            leadId: this.props.leadId,
            entry: {
                analysisFramework: this.props.analysisFramework.id,
                excerptType: type,
                excerptValue: value,
            },
        });
    }

    // FARAM

    handleChange = (faramValues, faramErrors, faramInfo, entryKey) => {
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
            const extraData = calculateEntryData(attributes, analysisFramework);

            this.props.addEntry({
                leadId: this.props.leadId,
                entry: {
                    excerptType,
                    excerptValue,
                    lead: this.props.leadId,
                    attributes,
                    analysisFramework: analysisFramework.id,
                    ...extraData,
                },
            });
        } else if (entryKey === undefined) {
            const excerptValue = '';
            const excerptType = 'excerpt';
            const attributes = faramValues;
            const extraData = calculateEntryData(attributes, analysisFramework);

            this.props.addEntry({
                leadId: this.props.leadId,
                entry: {
                    excerptType,
                    excerptValue,
                    lead: this.props.leadId,
                    attributes,
                    analysisFramework: analysisFramework.id,
                    ...extraData,
                },
            });
        } else {
            const extraData = calculateEntryData(faramValues, analysisFramework);
            this.props.setEntryData({
                leadId: this.props.leadId,
                key: entryKey,
                values: faramValues,
                errors: faramErrors,
                info: faramInfo,
                ...extraData,
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
            calculateEntryData: attrs => calculateEntryData(attrs, this.props.analysisFramework),
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

    render() {
        const {
            lead: {
                title: leadTitle,
                project: projectId,
            } = {},
            analysisFramework = {},
        } = this.props;
        const {
            pendingEditEntryData,
            pendingSaveAll,
            projectMismatch,
        } = this.state;

        if (pendingEditEntryData) {
            return (
                <div className={styles.editEntries} >
                    <LoadingAnimation large />
                </div>
            );
        }

        // FIXME: use strings
        const cancelButtonTitle = 'Cancel';
        const saveButtonTitle = 'Save';
        const backButtonTooltip = 'Back to leads page';
        const editFrameworkTitle = 'Edit Framework';

        const exitPath = reverseRoute(pathNames.leads, {
            projectId,
        });

        const frameworkPath = reverseRoute(pathNames.analysisFramework, {
            analysisFrameworkId: analysisFramework.id,
        });

        const hasSavableEntries = this.savableEntries.length > 0;
        const isSaveDisabled = (
            pendingEditEntryData || pendingSaveAll || projectMismatch || !hasSavableEntries
        );

        // FIXME: add prompt

        return (
            <div className={styles.editEntries}>
                <Prompt
                    message={
                        (location) => {
                            const { routeUrl } = this.props;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (isSaveDisabled) {
                                return true;
                            }
                            return _ts('common', 'youHaveUnsavedChanges');
                        }
                    }
                />
                <header className={styles.header}>
                    <Link
                        className={styles.backLink}
                        title={backButtonTooltip}
                        to={exitPath}
                    >
                        <i className={iconNames.back} />
                    </Link>
                    <h4 className={styles.heading}>
                        { leadTitle }
                    </h4>
                    <FixedTabs
                        className={styles.tabs}
                        tabs={this.tabs}
                        useHash
                        replaceHistory
                        deafultHash={this.defaultHash}
                        disabled={projectMismatch}
                    />
                    <div className={styles.actionButtons}>
                        <Cloak
                            hide={({ isAdmin }) => !isAdmin}
                            render={({ disabled }) => (
                                <Link
                                    className={styles.editFrameworkLink}
                                    to={frameworkPath}
                                    disabled={!analysisFramework.id || disabled}
                                >
                                    <span className={`${iconNames.edit} ${styles.editIcon}`} />
                                    { editFrameworkTitle }
                                </Link>
                            )}
                        />
                        <DangerConfirmButton
                            disabled={isSaveDisabled}
                            onClick={this.handleCancel}
                            // FIXME: use strings
                            confirmationMessage="Do you want to cancel all changes?"
                        >
                            { cancelButtonTitle }
                        </DangerConfirmButton>
                        <SuccessButton
                            disabled={isSaveDisabled}
                            onClick={this.handleSave}
                        >
                            { saveButtonTitle }
                        </SuccessButton>
                    </div>
                </header>
                {
                    !projectMismatch ? (
                        <MultiViewContainer
                            views={this.views}
                            useHash
                            containerClassName={styles.content}
                            activeClassName={styles.active}
                        />
                    ) : (
                        <Message>
                            {/* FIXME: use strings */}
                            Cannot find lead inside current project.
                        </Message>
                    )
                }
            </div>
        );
    }
}
