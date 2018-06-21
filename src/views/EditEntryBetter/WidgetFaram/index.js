import PropTypes from 'prop-types';
import React from 'react';

import Faram, { requiredCondition } from '#rs/components/Input/Faram';
import FaramGroup from '#rs/components/Input/Faram/FaramGroup';
import SuccessButton from '#rs/components/Action/Button/SuccessButton';
import GridViewLayout from '#rs/components/View/GridViewLayout';
import List from '#rs/components/View/List';

import { entryAccessor } from '#entities/editEntriesBetter';
import { fetchWidget } from '../widgets';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    widgetType: PropTypes.string.isRequired,

    onExcerptChange: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onValidationFailure: PropTypes.func.isRequired,
    onValidationSuccess: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    entry: undefined,
    widgets: [],
    pending: false,
    onChange: () => {},
    onValidationFailure: () => {},
    onValidationSuccess: () => {},
};

export default class WidgetFaram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // Schema

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
                    data: WidgetFaram.createSchemaForWidget(widget),
                    id: [],
                },
            };
        });
        return schema;
    }

    static keySelector = widget => widget.key

    constructor(props) {
        super(props);

        const { widgets } = this.props;
        this.schema = WidgetFaram.createSchema(widgets);
    }

    componentWillReceiveProps(nextProps) {
        const { widgets: newWidgets } = nextProps;
        const { widgets: oldWidgets } = this.props;
        if (oldWidgets !== newWidgets) {
            this.schema = WidgetFaram.createSchema(newWidgets);
        }
    }

    // Faram

    handleChange = (faramValues, faramErrors, faramInfo) => {
        const entryKey = entryAccessor.key(this.props.entry);
        this.props.onChange(faramValues, faramErrors, faramInfo, entryKey);
    }

    handleValidationFailure = (faramErrors) => {
        const entryKey = entryAccessor.key(this.props.entry);
        this.props.onValidationFailure(faramErrors, entryKey);
    }

    handleValidationSuccess = (faramValues) => {
        const entryKey = entryAccessor.key(this.props.entry);
        this.props.onValidationSuccess(faramValues, entryKey);
    }

    handleExcerptChange = (excerptData) => {
        const entryKey = entryAccessor.key(this.props.entry);
        this.props.onExcerptChange(excerptData, entryKey);
    }

    // Grid View Layout

    layoutSelector = (widget = {}) => {
        const { widgetType } = this.props;
        const {
            properties: {
                listGridLayout,
                overviewGridLayout,
            } = {},
        } = widget;
        return (widgetType === 'list' ? listGridLayout : overviewGridLayout);
    }

    renderWidgetHeader = (widget) => {
        const { title } = widget;
        return (
            <div className={styles.header}>
                { title }
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const {
            widgetType,
            entry,
        } = this.props;

        const { entryType, excerpt, image } = entryAccessor.data(entry) || {};
        const { id, widgetId } = widget;
        const Widget = fetchWidget(widgetType, widgetId);

        // FIXME: Bundle causes re-rendering of parent
        return (
            <div className={styles.content}>
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        {
                            // NOTE: excerptWidget is a special case
                            widgetId === 'excerptWidget' ? (
                                <Widget
                                    entryType={entryType}
                                    excerpt={excerpt}
                                    image={image}
                                    widget={widget}
                                    onExcerptChange={this.handleExcerptChange}
                                />
                            ) : (
                                <Widget
                                    widget={widget}
                                />
                            )
                        }
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }

    render() {
        const {
            entry,
            pending,
            widgets,
            className: classNameFromProps,
        } = this.props;

        const error = entryAccessor.error(entry);
        const className = `
            ${classNameFromProps}
            ${styles.widgetFaram}
            'widget-faram'
        `;

        console.warn(entry);

        return (
            <Faram
                className={className}
                onChange={this.handleChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={entry}
                error={error}
                disabled={pending}
            >
                <FaramGroup faramElementName="data">
                    <FaramGroup faramElementName="attributes">
                        <GridViewLayout
                            data={widgets}
                            layoutSelector={this.layoutSelector}
                            itemHeaderModifier={this.renderWidgetHeader}
                            itemContentModifier={this.renderWidgetContent}
                            keySelector={WidgetFaram.keySelector}
                            itemClassName={styles.widget}
                        />
                        <SuccessButton type="submit">
                            Save
                        </SuccessButton>
                    </FaramGroup>
                </FaramGroup>
            </Faram>
        );
    }
}
