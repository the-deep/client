import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '#rs/components/Action/Button';
import SuccessButton from '#rs/components/Action/Button/SuccessButton';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import BoundError from '#rs/components/General/BoundError';
import Bundle from '#rs/components/General/Bundle';
import Faram, { requiredCondition } from '#rs/components/Input/Faram';
import FaramGroup from '#rs/components/Input/Faram/FaramGroup';
import List from '#rs/components/View/List';
import GridViewLayout from '#rs/components/View/GridViewLayout';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import { listToMap } from '#rs/utils/common';
import update from '#rs/utils/immutable-update';

import WidgetError from '#components/WidgetError';
import {
    calcNewEntries,
    entryAccessor,
} from '#entities/entry';
import {
    leadIdFromRoute,

    editEntryCurrentAnalysisFrameworkSelector,
    setAnalysisFrameworkAction,
    setEditEntryLeadAction,
    setGeoOptionsAction,
    setRegionsForProjectAction,
} from '#redux';

import EditEntryDataRequest from './requests/EditEntryDataRequest';

import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    setAnalysisFramework: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
    setRegions: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    leadId: leadIdFromRoute(state, props),
    analysisFramework: editEntryCurrentAnalysisFrameworkSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setLead: params => dispatch(setEditEntryLeadAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
    setRegions: params => dispatch(setRegionsForProjectAction(params)),
});


const widgetStore = [
    {
        widgetId: 'dateWidget',
        type: 'list',
        loader: () => import('./FrameworkWidgets/DateWidget'),
    },
    {
        widgetId: 'excerptWidget',
        type: 'overview',
        loader: () => import('./FrameworkWidgets/ExcerptWidget'),
    },
    {
        widgetId: 'excerptWidget',
        type: 'list',
        loader: () => import('./FrameworkWidgets/ExcerptWidget'),
    },
    {
        widgetId: 'geoWidget',
        type: 'list',
        loader: () => import('./FrameworkWidgets/DefaultWidget'),
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'overview',
        loader: () => import('./FrameworkWidgets/DefaultWidget'),
    },
    {
        widgetId: 'matrix2dWidget',
        type: 'overview',
        loader: () => import('./FrameworkWidgets/DefaultWidget'),
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'list',
        loader: () => import('./FrameworkWidgets/DefaultWidget'),
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'overview',
        loader: () => import('./FrameworkWidgets/DefaultWidget'),
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'list',
        loader: () => import('./FrameworkWidgets/DefaultWidget'),
    },
    {
        widgetId: 'multiselectWidget',
        type: 'list',
        loader: () => import('./FrameworkWidgets/MultiselectWidget'),
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'overview',
        loader: () => import('./FrameworkWidgets/DefaultWidget'),
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'list',
        loader: () => import('./FrameworkWidgets/DefaultWidget'),
    },
    {
        widgetId: 'numberWidget',
        type: 'list',
        loader: () => import('./FrameworkWidgets/NumberWidget'),
    },
    {
        widgetId: 'organigramWidget',
        type: 'list',
        loader: () => import('./FrameworkWidgets/DefaultWidget'),
    },
    {
        widgetId: 'scaleWidget',
        type: 'list',
        loader: () => import('./FrameworkWidgets/DefaultWidget'),
    },
];

const BoundWidgetError = BoundError(WidgetError);
const decorator = Component => BoundWidgetError(Component);

const widgetStoreView = listToMap(
    widgetStore,
    widget => `${widget.type}:${widget.widgetId}`,
    (widget, name) => props => (
        <Bundle
            name={name}
            load={widget.loader}
            decorator={decorator}
            {...props}
        />
    ),
);

@connect(mapStateToProps, mapDispatchToProps)
export default class EditEntry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static createSchemaForWidget = (widget) => {
        switch (widget.widgetId) {
            // add case for date to identify good date with bad date
            case 'numberWidget':
                return {
                    fields: {
                        value: [requiredCondition],
                    },
                };
            default:
                return [];
        }
    }

    static createSchema = (widgets) => {
        const schema = {
            fields: {
                data: {
                    fields: {
                        analysisFramework: [],
                        attributes: {
                            fields: {
                            },
                        },
                        createdAt: [],
                        entryType: [],
                        excerpt: [],
                        exportData: [],
                        filterData: [],
                        id: [],
                        image: [],
                        lead: [],
                        order: [],
                    },
                },
                localData: [],
                serverData: [],
            },
        };
        widgets.forEach((widget) => {
            schema.fields.data.fields.attributes.fields[widget.id] = {
                fields: {
                    data: EditEntry.createSchemaForWidget(widget),
                    id: [],
                },
            };
        });
        return schema;
    }

    constructor(props) {
        super(props);

        this.state = {
            pendingEditEntryData: true,
            viewMode: 'overview',
            pending: false,

            selectedEntryId: undefined,
            entries: [],
            entryErrors: [],
        };

        const {
            analysisFramework: {
                widgets = [],
            },
        } = this.props;
        this.schema = EditEntry.createSchema(widgets);
    }

    componentWillMount() {
        const request = new EditEntryDataRequest({
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

        this.editEntryDataRequest = request.create(this.props.leadId);
        this.editEntryDataRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            analysisFramework: {
                widgets: newWidgets = [],
            },
        } = nextProps;
        const {
            analysisFramework: {
                widgets: oldWidgets = [],
            },
        } = this.props;
        if (oldWidgets !== newWidgets) {
            this.schema = EditEntry.createSchema(newWidgets);
        }
    }

    componentWillUnmount() {
        this.editEntryDataRequest.stop();
    }

    // FIXME: make this static
    getSelectedEntryIndex = () => {
        const { entries, selectedEntryId } = this.state;
        const entry = entries.findIndex(
            e => entryAccessor.getKey(e) === selectedEntryId,
        );
        return entry;
    }

    handleDiffEntries = ({ diffs }) => {
        const newEntries = calcNewEntries(this.state.entries, diffs);

        // TODO:
        // If last selected was delete, set first item as selected
        const selectedEntryId = entryAccessor.getKey(newEntries[0]);

        this.setState({ entries: newEntries, selectedEntryId });
    }

    handleRemoveAllEntries = () => {
        this.setState({ entries: [] });
    }

    handleEntrySelect = (selectedEntryId) => {
        this.setState({ selectedEntryId });
    }

    handleModeToggle = () => {
        this.setState({
            viewMode: this.state.viewMode === 'overview' ? 'list' : 'overview',
        });
    }

    handleChange = (faramValues, faramErrors) => {
        const entryIndex = this.getSelectedEntryIndex();

        const newEntries = { $auto: {
            [entryIndex]: { $set: faramValues },
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

    handleValidationFailure = (faramErrors) => {
        console.warn('Failure', faramErrors);

        const entryIndex = this.getSelectedEntryIndex();

        const newEntryErrors = { $auto: {
            [entryIndex]: { $set: faramErrors },
        } };

        const newState = {
            entryErrors: update(this.state.entryErrors, newEntryErrors),
        };
        this.setState(newState);
    }

    handleValidationSuccess = (values) => {
        console.warn('success', values);
    }

    renderEntry = (k, entry) => {
        const key = entryAccessor.getKey(entry);
        const { excerpt } = entryAccessor.getValues(entry);

        const selected = this.state.selectedEntryId === key;
        return (
            <Button
                key={key}
                onClick={() => this.handleEntrySelect(key)}
                disabled={selected}
            >
                {excerpt}
            </Button>
        );
    };

    renderWidgetHeader = (d) => {
        const { title } = d;
        return (
            <div className={styles.header}>
                { d.title }
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const { viewMode, entries } = this.state;
        const { id, key, widgetId, title } = widget;

        const Widget = widgetStoreView[`${viewMode}:${widgetId}`];
        if (!Widget) {
            return null;
        }

        const entryIndex = this.getSelectedEntryIndex();
        const entry = entries[entryIndex];

        let entryType;
        let excerpt;
        let image;
        if (entry) {
            ({ entryType, excerpt, image } = entryAccessor.getValues(entry));
        }

        return (
            <div className={styles.content}>
                {/* FIXME: Bundle causes re-rendering of List (ie parent) */}
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        <Widget
                            entryType={entryType}
                            excerpt={excerpt}
                            image={image}
                            widget={widget}
                        />
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }


    render() {
        const {
            pendingEditEntryData,
            entries,
            entryErrors,
            viewMode,
            pending,
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

        const entryIndex = this.getSelectedEntryIndex();
        const entry = entries[entryIndex];
        const entryError = entryErrors[entryIndex];

        console.warn(widgets);

        return (
            <div className={styles.editEntry}>
                <div className={styles.sidebar}>
                    <List
                        data={entries}
                        modifier={this.renderEntry}
                    />
                </div>
                { entryIndex !== 1 &&
                    <Faram
                        className={styles.main}

                        onChange={this.handleChange}
                        onValidationFailure={this.handleValidationFailure}
                        onValidationSuccess={this.handleValidationSuccess}

                        schema={this.schema}
                        value={entry}
                        error={entryError}
                        disabled={pending}
                    >
                        <FaramGroup faramElementName="data">
                            <FaramGroup faramElementName="attributes">
                                <SuccessButton type="submit">
                                    Save
                                </SuccessButton>
                                <PrimaryButton onClick={this.handleModeToggle}>
                                    {viewMode}
                                </PrimaryButton>
                                <GridViewLayout
                                    data={widgets}
                                    layoutSelector={d => d.properties.listGridLayout}
                                    itemHeaderModifier={this.renderWidgetHeader}
                                    itemContentModifier={this.renderWidgetContent}
                                    keySelector={d => d.key}
                                    itemClassName={styles.widget}
                                />
                            </FaramGroup>
                        </FaramGroup>
                    </Faram>
                }
            </div>
        );
    }
}
