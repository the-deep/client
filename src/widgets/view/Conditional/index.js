import React from 'react';
import PropTypes from 'prop-types';

import FaramGroup from '#rscg/FaramGroup';

import { fetchWidget } from '#widgets';

const propTypes = {
    widget: PropTypes.shape({
        properties: PropTypes.object,
    }).isRequired,
    widgetType: PropTypes.string.isRequired,
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
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
        const { widgetType } = this.props;
        const { viewComponent: Widget } = fetchWidget(widgetType, widgetId);

        return (
            <FaramGroup faramElementName={widget.key}>
                <FaramGroup faramElementName="data">
                    <Widget
                        widgetName={widgetId}
                        widgetType={widgetType}
                        widget={widget}
                    />
                </FaramGroup>
            </FaramGroup>
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
