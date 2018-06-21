import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { iconNames } from '#constants';
import Button from '#rsca/Button';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';
import FixedTabs from '#rscv/FixedTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';
import LoadingAnimation from '#rscv/LoadingAnimation';

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

    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    setRegionsForProjectAction,
} from '#redux';

import EditEntryDataRequest from './requests/EditEntryDataRequest';

import Overview from './Overview';
import Listing from './List';

import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    setLead: PropTypes.func.isRequired,
    setEntries: PropTypes.func.isRequired,
    clearEntries: PropTypes.func.isRequired,

    setAnalysisFramework: PropTypes.func.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
    setRegions: PropTypes.func.isRequired,

    setExcerpt: PropTypes.func.isRequired,
    setEntryData: PropTypes.func.isRequired,
    setEntryError: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
    entries: [],
};

const mapStateToProps = state => ({
    leadId: leadIdFromRoute(state),
    lead: editEntriesLeadSelector(state),
    entries: editEntriesEntriesSelector(state),

    analysisFramework: editEntriesAnalysisFrameworkSelector(state),
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
});


@connect(mapStateToProps, mapDispatchToProps)
export default class EditEntry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingEditEntryData: true,
        };

        this.views = {
            overview: {
                component: () => (
                    <Overview
                        pending={this.state.pendingEditEntryData}

                        // injected inside WidgetFaram
                        onChange={this.handleChange}
                        onValidationFailure={this.handleValidationFailure}
                        onValidationSuccess={this.handleValidationSuccess}
                        onExcerptChange={this.handleExcerptChange}
                    />
                ),
                wrapContainer: true,
                lazyMount: true,
            },

            list: {
                component: () => (
                    <Listing
                        pending={this.state.pendingEditEntryData}

                        // injected inside WidgetFaram
                        onChange={this.handleChange}
                        onValidationFailure={this.handleValidationFailure}
                        onValidationSuccess={this.handleValidationSuccess}
                        onExcerptChange={this.handleExcerptChange}
                    />
                ),
                wrapContainer: true,
                lazyMount: true,
            },
        };

        // FIXME: use strings
        this.tabs = {
            overview: 'Overview',
            list: 'List',
        };

        this.defaultHash = 'overview';

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
    }

    handleExcerptChange = ({ type, value }, entryKey) => {
        this.props.setExcerpt({
            leadId: this.props.leadId,
            key: entryKey,
            excerptType: type,
            excerptValue: value,
        });
    }

    handleChange = (faramValues, faramErrors, faramInfo, entryKey) => {
        this.props.setEntryData({
            leadId: this.props.leadId,
            key: entryKey,
            values: faramValues,
            errors: faramErrors,
            info: faramInfo,
        });
    }

    handleValidationFailure = (faramErrors, entryKey) => {
        console.warn(faramErrors);
        this.props.setEntryError({
            leadId: this.props.leadId,
            key: entryKey,
            errors: faramErrors,
        });
    }

    handleValidationSuccess = (values, entryKey) => {
        console.warn('success', values, entryKey);
    }

    render() {
        const {
            lead: { title: leadTitle } = {},
        } = this.props;
        const {
            pendingEditEntryData,
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
        const backButtonTooltip = 'Back to murica';

        return (
            <div className={styles.editEntriesBetter}>
                <header className={styles.header}>
                    <Button
                        className={styles.backButton}
                        title={backButtonTooltip}
                        iconName={iconNames.back}
                        transparent
                        disabled={pendingEditEntryData}
                    />
                    <h4 className={styles.heading}>
                        { leadTitle }
                    </h4>
                    <FixedTabs
                        className={styles.tabs}
                        tabs={this.tabs}
                        useHash
                        deafultHash={this.defaultHash}
                    />
                    <div className={styles.actionButtons}>
                        <DangerButton
                            disabled={pendingEditEntryData}
                        >
                            { cancelButtonTitle }
                        </DangerButton>
                        <SuccessButton
                            disabled={pendingEditEntryData}
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
