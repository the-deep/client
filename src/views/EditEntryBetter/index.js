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
import update from '#rs/utils/immutable-update';

import {
    leadIdFromRoute,
    editEntriesLeadSelector,

    editEntriesAnalysisFrameworkSelector,
    editEntriesSetLeadAction,
    editEntriesEntriesSelector,
    editEntriesSetEntriesAction,
    editEntriesClearEntriesAction,
    editEntriesSetSelectedEntryKeyAction,
    editEntriesSelectedEntryKeySelector,

    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    setRegionsForProjectAction,
} from '#redux';

import { entryAccessor } from '#entities/editEntriesBetter';
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

    setSelectedEntryKey: PropTypes.func.isRequired,
    selectedEntryKey: PropTypes.string,
};

const defaultProps = {
    analysisFramework: undefined,
    entries: [],
    selectedEntryKey: undefined,
};

const mapStateToProps = (state, props) => ({
    leadId: leadIdFromRoute(state, props),
    lead: editEntriesLeadSelector(state),
    entries: editEntriesEntriesSelector(state),

    analysisFramework: editEntriesAnalysisFrameworkSelector(state, props),
    selectedEntryKey: editEntriesSelectedEntryKeySelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLead: params => dispatch(editEntriesSetLeadAction(params)),
    setEntries: params => dispatch(editEntriesSetEntriesAction(params)),
    clearEntries: params => dispatch(editEntriesClearEntriesAction(params)),
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),

    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
    setRegions: params => dispatch(setRegionsForProjectAction(params)),
});


@connect(mapStateToProps, mapDispatchToProps)
export default class EditEntry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getSelectedEntryIndex = (entries, entryKey) => {
        const entry = entries.findIndex(e => (entryAccessor.key(e) === entryKey));
        return entry;
    }

    constructor(props) {
        super(props);

        this.state = {
            pendingEditEntryData: true,
        };

        this.views = {
            overview: {
                component: () => {
                    const {
                        entries,
                        selectedEntryKey,
                        analysisFramework = {},
                    } = this.props;
                    const { widgets } = analysisFramework;
                    const entryIndex = EditEntry.getSelectedEntryIndex(entries, selectedEntryKey);
                    const entry = entries[entryIndex];
                    return (
                        <Overview
                            entries={entries}
                            selectedEntryKey={selectedEntryKey}
                            widgets={widgets}
                            entry={entry}
                            pending={this.state.pendingEditEntryData}
                            onEntrySelect={this.handleEntrySelect}

                            // injected inside WidgetFaram
                            onChange={this.handleChange}
                            onValidationFailure={this.handleValidationFailure}
                            onValidationSuccess={this.handleValidationSuccess}
                            onExcerptChange={this.handleExcerptChange}
                        />
                    );
                },
                wrapContainer: true,
                lazyMount: true,
            },

            list: {
                component: () => (
                    <Listing
                        widgets={(this.props.analysisFramework || {}).widgets}
                        entries={this.props.entries}
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
            diffEntries: this.handleDiffEntries,
            getAf: () => this.props.analysisFramework,
            getEntries: () => this.props.entries,
            removeAllEntries: this.handleRemoveAllEntries,
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

    handleDiffEntries = ({ diffs }) => {
        this.props.setEntries({ leadId: this.props.leadId, entryActions: diffs });
    }

    handleRemoveAllEntries = () => {
        this.props.clearEntries({ leadId: this.props.leadId });
    }

    handleEntrySelect = (selectedEntryKey) => {
        this.props.setSelectedEntryKey({
            key: selectedEntryKey,
            leadId: this.props.leadId,
        });
    }

    // REDUX

    handleExcerptChange = ({ type, value }, entryKey) => {
        const entryIndex = EditEntry.getSelectedEntryIndex(this.props.entries, entryKey);

        const settings = {
            [entryIndex]: {
                localData: {
                    isPristine: { $set: false },
                },
                data: {
                    entryType: { $set: type },
                    excerpt: { $set: type === 'excerpt' ? value : undefined },
                    image: { $set: type === 'image' ? value : undefined },
                },
            },
        };

        const newState = {
            entries: update(this.state.entries, settings),
        };

        this.setState(newState);
    }

    handleChange = (faramValues, faramErrors, faramInfo, entryKey) => {
        let newFaramValues = faramValues;

        const errorSettings = { $auto: {
            localData: {
                isPristine: { $set: false },
                error: { $set: faramErrors },
                // hasError must be calculated
            },
        } };
        newFaramValues = update(newFaramValues, errorSettings);

        switch (faramInfo.action) {
            case 'newEntry':
                console.warn('Should create new entry');
                break;
            case 'editEntry': {
                const excerptSettings = {
                    data: {
                        entryType: { $set: faramInfo.entryType },
                        excerpt: { $set: faramInfo.excerpt },
                        image: { $set: faramInfo.image },
                    },
                };
                newFaramValues = update(newFaramValues, excerptSettings);
                break;
            } case undefined:
                break;
            default:
                console.error('Unrecognized action');
        }

        const entryIndex = EditEntry.getSelectedEntryIndex(this.props.entries, entryKey);

        const newEntries = { $auto: {
            [entryIndex]: { $set: newFaramValues },
        } };

        const newState = {
            entries: update(this.state.entries, newEntries),
        };

        this.setState(newState);
    }

    handleValidationFailure = (faramErrors, entryKey) => {
        const entryIndex = EditEntry.getSelectedEntryIndex(this.props.entries, entryKey);

        const settings = { $auto: {
            [entryIndex]: { $auto: {
                localData: { $auto: {
                    error: { $auto: {
                        $set: faramErrors,
                    } },
                } },
            } },
        } };

        const newState = {
            entries: update(this.state.entries, settings),
        };
        this.setState(newState);
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
