import React from 'react';
import PropTypes from 'prop-types';

import FaramGroup from '#rsci/Faram/FaramGroup';

import {
    fetchWidget,
    VIEW,
} from '#widgets';

const propTypes = {
    widget: PropTypes.shape({
        properties: PropTypes.object,
    }).isRequired,
    data: PropTypes.shape({}).isRequired,
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
                    data = {},
                },
            },
        } = this.props;
        const widgetData = data
            .widgets
            .find(w => ((w || {}).widget || {}).key === selectedWidgetKey);

        return (widgetData || {}).widget;
    }

    getWidgetView = (widget) => {
        const { widgetId } = widget;

        const { viewComponent: Widget } = fetchWidget(VIEW.list, widgetId);
        const { data: widgetData } = this.props;
        const {
            value: { [widget.key]: { data } = {} } = {},
        } = widgetData;

        return (
            <Widget
                widget={widget}
                data={data}
            />
        );
    }

    render() {
        const selectedWidgetKey = 'matrix2dWidget-wcmmdkxe2hc0arju';
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
