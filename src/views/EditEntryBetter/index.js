import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '#rs/components/Action/Button';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import List from '#rs/components/View/List';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import update from '#rs/utils/immutable-update';

import {
    calcNewEntries,
} from '#entities/entry';
import {
    leadIdFromRoute,

    editEntriesAnalysisFrameworkSelector,
    editEntriesSetLeadAction,

    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    setRegionsForProjectAction,
} from '#redux';

import WidgetFaram from './WidgetFaram';
import { hasWidget } from './widgets';
import entryAccessor from './entryAccessor';
import EditEntryDataRequest from './requests/EditEntryDataRequest';

import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,

    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setLead: PropTypes.func.isRequired,

    setAnalysisFramework: PropTypes.func.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
    setRegions: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    leadId: leadIdFromRoute(state, props),

    // Rewrite this
    analysisFramework: editEntriesAnalysisFrameworkSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    // Rewrite this
    setLead: params => dispatch(editEntriesSetLeadAction(params)),

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

            viewMode: 'list',

            selectedEntryKey: undefined,
            entries: [],
            entryErrors: [],
        };

        this.editEntryDataRequest = new EditEntryDataRequest({
            diffEntries: this.handleDiffEntries,
            getAf: () => this.props.analysisFramework,
            getEntries: () => this.state.entries,
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
        const newEntries = calcNewEntries(this.state.entries, diffs);

        // TODO:
        // If last selected was delete, set first item as selected
        const selectedEntryKey = entryAccessor.key(newEntries[0]);

        this.setState({ entries: newEntries, selectedEntryKey });
    }

    handleRemoveAllEntries = () => {
        this.setState({ entries: [] });
    }

    // UI

    handleEntrySelect = (selectedEntryKey) => {
        this.setState({ selectedEntryKey });
    }

    handleModeToggle = () => {
        this.setState({
            viewMode: this.state.viewMode === 'overview' ? 'list' : 'overview',
        });
    }

    // REDUX

    handleExcerptChange = ({ type, value }, entryKey) => {
        const entryIndex = EditEntry.getSelectedEntryIndex(this.state.entries, entryKey);

        const settings = {
            [entryIndex]: {
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
        switch (faramInfo.action) {
            case 'newEntry':
                console.warn('Should create new entry');
                break;
            case 'editEntry': {
                const settings = {
                    data: {
                        entryType: { $set: faramInfo.entryType },
                        excerpt: { $set: faramInfo.excerpt },
                        image: { $set: faramInfo.image },
                    },
                };
                // FIXME: clear other errors
                newFaramValues = update(newFaramValues, settings);
                break;
            } case undefined:
                break;
            default:
                console.error('Unrecognized action');
        }

        const entryIndex = EditEntry.getSelectedEntryIndex(this.state.entries, entryKey);

        const newEntries = { $auto: {
            [entryIndex]: { $set: newFaramValues },
        } };
        const newEntryErrors = { $auto: {
            [entryIndex]: { $set: faramErrors },
        } };

        const newState = {
            entries: update(this.state.entries, newEntries),
            entryErrors: update(this.state.entryErrors, newEntryErrors),
        };

        this.setState(newState);
    }

    handleValidationFailure = (faramErrors, entryKey) => {
        console.error('Failure', faramErrors, entryKey);

        const entryIndex = EditEntry.getSelectedEntryIndex(this.state.entries, entryKey);
        const newEntryErrors = { $auto: {
            [entryIndex]: { $set: faramErrors },
        } };

        const newState = {
            entryErrors: update(this.state.entryErrors, newEntryErrors),
        };
        this.setState(newState);
    }

    handleValidationSuccess = (values, entryKey) => {
        console.warn('success', values, entryKey);
    }

    // LIST

    renderEntry = (k, entry) => {
        const key = entryAccessor.key(entry);
        const { entryType, excerpt, image } = entryAccessor.data(entry) || {};

        const selected = this.state.selectedEntryKey === key;

        return (
            <Button
                key={key}
                onClick={() => this.handleEntrySelect(key)}
                disabled={selected}
            >
                {
                    entryType === 'image' ? (
                        <img
                            src={image}
                            alt={excerpt}
                        />
                    ) : (
                        excerpt
                    )
                }
            </Button>
        );
    };

    render() {
        const {
            pendingEditEntryData,
            entries,
            entryErrors,
            viewMode,
            selectedEntryKey,
        } = this.state;
        const {
            analysisFramework: {
                widgets = [],
            },
        } = this.props;

        if (pendingEditEntryData) {
            return (
                <div className={styles.editEntry} >
                    <LoadingAnimation large />
                </div>
            );
        }

        const entryIndex = EditEntry.getSelectedEntryIndex(entries, selectedEntryKey);
        const entry = entries[entryIndex];
        const entryError = entryErrors[entryIndex];

        // move this somewhere
        const filteredWidgets = widgets.filter(
            widget => hasWidget(viewMode, widget.widgetId),
        );

        return (
            <div className={styles.editEntry}>
                <div className={styles.sidebar}>
                    <PrimaryButton onClick={this.handleModeToggle}>
                        {viewMode}
                    </PrimaryButton>
                    <List
                        data={entries}
                        modifier={this.renderEntry}
                    />
                </div>
                <WidgetFaram
                    entry={entry}
                    widgets={filteredWidgets}
                    entryError={entryError}
                    pending={pendingEditEntryData}
                    viewMode={viewMode}
                    analysisFramework={this.props.analysisFramework}

                    onChange={this.handleChange}
                    onValidationFailure={this.handleValidationFailure}
                    onValidationSuccess={this.handleValidationSuccess}
                    onExcerptChange={this.handleExcerptChange}
                />
            </div>
        );
    }
}
