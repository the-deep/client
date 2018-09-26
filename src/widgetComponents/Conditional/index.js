import React from 'react';
import PropTypes from 'prop-types';

import FaramGroup from '#rscg/FaramGroup';
import { FaramInputElement } from '#rscg/FaramElements';
import {
    fetchWidgetTagComponent,
    fetchWidgetViewComponent,
} from '#widgets';

const propTypes = {
    widget: PropTypes.shape({
        properties: PropTypes.object,
    }).isRequired,
    widgetType: PropTypes.string.isRequired,
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    image: PropTypes.string,
    isView: PropTypes.bool,

    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    entryType: 'excerpt',
    excerpt: undefined,
    image: undefined,
    isView: false,

    value: {},
    disabled: false,
    onChange: () => {},
};


@FaramInputElement
export default class Conditional extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getWidgetData = (selectedWidgetKey) => {
        const {
            widget: {
                properties: {
                    data: {
                        widgets = [],
                    } = {},
                },
            },
        } = this.props;

        const widgetData = widgets.find(
            w => (
                (w || {}).widget || {}
            ).key === selectedWidgetKey,
        );

        return (widgetData || {}).widget;
    }

    getWidgetView = (widget) => {
        if (!widget) {
            // FIXME: Use strings
            return (<div>No widget</div>);
        }

        const { widgetId } = widget;
        const { widget: { properties: { addedFrom } }, widgetType, isView } = this.props;
        let Widget;

        if (isView) {
            Widget = fetchWidgetViewComponent(widgetId);
        } else {
            Widget = fetchWidgetTagComponent(widgetId, widgetType, addedFrom);
        }

        const {
            entryType,
            excerpt,
            image,
        } = this.props;

        let child = null;
        switch (widgetId) {
            case 'organigramWidget':
            case 'geoWidget': {
                child = (
                    <Widget
                        widgetName={widgetId}
                        widgetType={widgetType}
                        widget={widget}
                        entryType={entryType}
                        excerpt={excerpt}
                        image={image}
                    />
                );
                break;
            }
            default: {
                child = (
                    <Widget
                        widgetName={widgetId}
                        widgetType={widgetType}
                        widget={widget}
                    />
                );
                break;
            }
        }

        return (
            <div>
                <FaramGroup faramElementName={widget.key}>
                    <FaramGroup faramElementName="data">
                        { child }
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }

    render() {
        const { value, onChange, disabled } = this.props;
        const { selectedWidgetKey } = value;
        const widget = this.getWidgetData(selectedWidgetKey);
        const WidgetView = this.getWidgetView(widget);

        return (
            <div>
                <FaramGroup
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                >
                    {WidgetView}
                </FaramGroup>
            </div>
        );
    }
}
