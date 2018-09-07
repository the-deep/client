import React from 'react';
import PropTypes from 'prop-types';

import FaramGroup from '#rscg/FaramGroup';

import { fetchWidgetTagComponent } from '#widgets';

const propTypes = {
    widget: PropTypes.shape({
        properties: PropTypes.object,
    }).isRequired,
    widgetType: PropTypes.string.isRequired,
    entryType: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    image: PropTypes.string,
};

const defaultProps = {
    excerpt: undefined,
    image: undefined,
};


// FIXME: This should be rewritten after widget framework change
export default class ConditionalWidget extends React.PureComponent {
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
        const { widget: { properties: { addedFrom } }, widgetType } = this.props;
        const Widget = fetchWidgetTagComponent(widgetId, widgetType, addedFrom);

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
        const selectedWidgetKey = 'matrix1dWidget-xcvsqifo1t5fixgz';
        const widget = this.getWidgetData(selectedWidgetKey);
        const WidgetView = this.getWidgetView(widget);

        return (
            <div>
                <FaramGroup faramElementName="value">
                    {WidgetView}
                </FaramGroup>
            </div>
        );
    }
}
