import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';
import AccentConfirmButton from '#rsca/ConfirmButton/AccentConfirmButton';
import DangerButton from '#rsca/Button/DangerButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import { detachedFaram } from '#rsci/Faram';
import FixedTabs from '#rscv/FixedTabs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';
import { CoordinatorBuilder } from '#rsu/coordinate';

import { reverseRoute } from '#rs/utils/common';

import { entryAccessor } from '#entities/editEntriesBetter';
import {
    iconNames,
    routes,
} from '#constants';
import {
    leadIdFromRoute,
    editEntriesLeadSelector,

    editEntriesAnalysisFrameworkSelector,
    editEntriesSetLeadAction,
    editEntriesEntriesSelector,
    editEntriesSetEntriesAction,
    editEntriesClearEntriesAction,
    editEntriesSetExcerptAction,
    editEntriesSetEntryDataAction,
    editEntriesSetEntryErrorsAction,
    editEntriesSchemaSelector,
    editEntriesAddEntryAction,

    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    setRegionsForProjectAction,
} from '#redux';
import notify from '#notify';
import _ts from '#ts';

import EditEntryDataRequest from './requests/EditEntryDataRequest';

import Overview from './Overview';
import Listing from './List';

import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    setLead: PropTypes.func.isRequired,
    setEntries: PropTypes.func.isRequired,
    clearEntries: PropTypes.func.isRequired,

    setAnalysisFramework: PropTypes.func.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
    setRegions: PropTypes.func.isRequired,

    setExcerpt: PropTypes.func.isRequired,
    setEntryData: PropTypes.func.isRequired,
    setEntryError: PropTypes.func.isRequired,
    addEntry: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
    entries: [],
    schema: {},
};

const mapStateToProps = state => ({
    leadId: leadIdFromRoute(state),
    lead: editEntriesLeadSelector(state),
    entries: editEntriesEntriesSelector(state),

    analysisFramework: editEntriesAnalysisFrameworkSelector(state),
    schema: editEntriesSchemaSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLead: params => dispatch(editEntriesSetLeadAction(params)),
    setEntries: params => dispatch(editEntriesSetEntriesAction(params)),
    clearEntries: params => dispatch(editEntriesClearEntriesAction(params)),

    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
    setRegions: params => dispatch(setRegionsForProjectAction(params)),
    setExcerpt: params => dispatch(editEntriesSetExcerptAction(params)),

    setEntryData: params => dispatch(editEntriesSetEntryDataAction(params)),
    setEntryError: params => dispatch(editEntriesSetEntryErrorsAction(params)),
    addEntry: params => dispatch(editEntriesAddEntryAction(params)),
});


const HeaderComponent = ({ attributeKey, attributeData }) => (
    <Fragment>
        <AccentConfirmButton
            title={_ts('editEntry', 'applyAllButtonTitle')}
            tabIndex="-1"
            transparent
            iconName={iconNames.applyAll}
            confirmationMessage={_ts('editEntry', 'applyToAll')}
        />
        <WarningConfirmButton
            title={_ts('editEntry', 'applyAllBelowButtonTitle')}
            tabIndex="-1"
            transparent
            iconName={iconNames.applyAllBelow}
            confirmationMessage={_ts('editEntry', 'applyToAllBelow')}
        />
    </Fragment>
);

@connect(mapStateToProps, mapDispatchToProps)
export default class EditEntryBetter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingEditEntryData: true,
            pendingSaveAll: false,
        };

        this.views = {
            overview: {
                component: () => (
                    <Overview
                        pending={this.state.pendingEditEntryData}

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
                        pending={this.state.pendingEditEntryData}

                        // injected inside WidgetFaram
                        onChange={this.handleChange}
                        onExcerptChange={this.handleExcerptChange}
                        onExcerptCreate={this.handleExcerptCreate}
                        schema={this.props.schema}
                        actionComponent={HeaderComponent}
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
            .maxActiveActors(3)
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
            setEntries: this.props.setEntries,
            getAf: () => this.props.analysisFramework,
            getEntries: () => this.props.entries,
            clearEntries: this.props.clearEntries,
            setAnalysisFramework: this.props.setAnalysisFramework,
            setGeoOptions: this.props.setGeoOptions,
            setLead: this.props.setLead,
            setRegions: this.props.setRegions,
            setState: params => this.setState(params),
        });
    }

    componentWillMount() {
        const { leadId } = this.props;
        this.editEntryDataRequest.init({ leadId });
        this.editEntryDataRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { leadId } = nextProps;
        if (this.props.leadId !== leadId && leadId) {
            this.editEntryDataRequest.init({ leadId });
            this.editEntryDataRequest.start();
        }
    }

    componentWillUnmount() {
        this.editEntryDataRequest.stop();

        this.saveRequestCoordinator.stop();
    }

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
                entryType: type,
                entryValue: value,
            },
        });
    }

    handleChange = (faramValues, faramErrors, faramInfo, entryKey) => {
        if (faramInfo.action === 'newEntry' || entryKey === undefined) {
            this.props.addEntry({
                leadId: this.props.leadId,
                entry: {
                    lead: this.props.leadId,
                    attributes: faramValues,
                    analysisFramework: this.props.analysisFramework.id,
                },
            });
        } else {
            this.props.setEntryData({
                leadId: this.props.leadId,
                key: entryKey,
                values: faramValues,
                errors: faramErrors,
                info: faramInfo,
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

    handleValidationSuccess = (values, entryKey) => {
        const request = {
            start: () => {
                this.saveRequestCoordinator.notifyComplete(entryKey, false);
            },
            stop: () => {},
        };
        this.saveRequestCoordinator.add(entryKey, request);
    }

    handleSave = () => {
        this.props.entries.forEach((entry) => {
            const entryKey = entryAccessor.key(entry);
            detachedFaram({
                value: entry.data.attributes,
                schema: this.props.schema,
                error: entry.localData.error,
                onChange: this.handleChange,

                onValidationFailure: errors => this.handleValidationFailure(errors, entryKey),
                onValidationSuccess: values => this.handleValidationSuccess(values, entryKey),
            });
            // FIXME: add conditions for delete later
        });
        this.saveRequestCoordinator.start();
    }

    render() {
        const {
            lead: {
                title: leadTitle,
                project: projectId,
            } = {},
        } = this.props;
        const {
            pendingEditEntryData,
            pendingSaveAll,
        } = this.state;

        if (pendingEditEntryData) {
            return (
                <div className={styles.editEntriesBetter} >
                    <LoadingAnimation large />
                </div>
            );
        }

        // FIXME: use strings
        const cancelButtonTitle = 'Cancel';
        const saveButtonTitle = 'Save';
        const backButtonTooltip = 'Back to leads page';

        const exitPath = reverseRoute(routes.leads.path, {
            projectId,
        });

        return (
            <div className={styles.editEntriesBetter}>
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
                    />
                    <div className={styles.actionButtons}>
                        <DangerButton
                            disabled={pendingEditEntryData || pendingSaveAll}
                        >
                            { cancelButtonTitle }
                        </DangerButton>
                        <SuccessButton
                            disabled={pendingEditEntryData || pendingSaveAll}
                            onClick={this.handleSave}
                        >
                            { saveButtonTitle }
                        </SuccessButton>
                    </div>
                </header>
                <MultiViewContainer
                    views={this.views}
                    useHash
                    containerClassName={styles.content}
                    activeClassName={styles.active}
                />
            </div>
        );
    }
}
