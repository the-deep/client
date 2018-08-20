import React from 'react';
import PropTypes from 'prop-types';

import FaramGroup from '#rsci/Faram/FaramGroup';

import {
    fetchWidget,
    widgetVisibility,
    VISIBILITY,
} from '#widgets';

const propTypes = {
    widget: PropTypes.shape({
        properties: PropTypes.object,
    }).isRequired,
    data: PropTypes.shape({}).isRequired,
    widgetType: PropTypes.string.isRequired,
    entryType: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    image: PropTypes.string,
};

const defaultProps = {
    excerpt: undefined,
    image: undefined,
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
        if (!widget) {
            return (<div>asdasd</div>);
        }
        const {
            widgetType,
            data: widgetValue,
            entryType,
            excerpt,
            image,
        } = this.props;

        const {
            widgetId,
            properties: { addedFrom },
        } = widget;

        const {
            component: Widget,
            viewComponent: ViewWidget,
        } = fetchWidget(widgetType, widgetId);

        const isViewComponent = widgetVisibility(
            widgetId,
            widgetType,
            addedFrom,
        ) === VISIBILITY.readonly;

        if (isViewComponent) {
            // Faram not used for view component
            const {
                value: { [widget.key]: { value } = {} } = {},
            } = widgetValue;

            return (
                <div>
                    <ViewWidget
                        data={{ value }}
                        widget={widget}
                    />
                </div>
            );
        }

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
