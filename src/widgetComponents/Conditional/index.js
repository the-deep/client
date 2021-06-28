import React from 'react';
import PropTypes from 'prop-types';
import { FaramGroup, FaramInputElement } from '@togglecorp/faram';

import Message from '#rscv/Message';
import {
    fetchWidgetTagComponent,
    fetchWidgetViewComponent,
} from '#widgets';
import _ts from '#ts';

const propTypes = {
    widget: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        properties: PropTypes.object,
    }).isRequired,
    widgetType: PropTypes.string.isRequired,
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    imageRaw: PropTypes.string,
    imageDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tabularField: PropTypes.number,
    tabularFieldData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isView: PropTypes.bool,

    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    entryType: 'excerpt',
    excerpt: undefined,
    imageRaw: undefined,
    imageDetails: undefined,
    tabularField: undefined,
    tabularFieldData: undefined,
    isView: false,

    value: {},
    disabled: false,
    readOnly: false,
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
            return (
                <Message>
                    {_ts('widgets.tagging.conditional', 'noWidgetFoundText')}
                </Message>
            );
        }

        const { widgetId } = widget;
        const { widget: { properties: { addedFrom } }, widgetType, isView } = this.props;

        const Widget = isView ? (
            fetchWidgetViewComponent(widgetId, addedFrom)
        ) : (
            fetchWidgetTagComponent(widgetId, widgetType, addedFrom)
        );

        const {
            entryType,
            excerpt,
            imageDetails,
            imageRaw,
            tabularField,
            tabularFieldData,
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
                        imageDetails={imageDetails}
                        imageRaw={imageRaw}
                        tabularField={tabularField}
                        tabularFieldData={tabularFieldData}
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
        const {
            value,
            onChange,
            disabled,
            readOnly,
        } = this.props;

        const { selectedWidgetKey } = value;
        const widget = this.getWidgetData(selectedWidgetKey);
        const WidgetView = this.getWidgetView(widget);

        return (
            <FaramGroup
                value={value}
                onChange={onChange}
                disabled={disabled}
                readOnly={readOnly}
            >
                {WidgetView}
            </FaramGroup>
        );
    }
}
