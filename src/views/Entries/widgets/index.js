import React from 'react';
import WidgetError from '#components/WidgetError';
import boundError from '#rscg/BoundError';

import { listToMap } from '#rs/utils/common';

import Matrix1dListWidget from './Matrix1dList';
import ExcerptWidget from './Excerpt';
import DefaultWidget from './Default';


const widgetList = [
    {
        widgetId: 'dateRangeWidget',
        component: DefaultWidget,
    },
    {
        widgetId: 'dateWidget',
        component: DefaultWidget,
    },
    {
        widgetId: 'excerptWidget',
        component: ExcerptWidget,
    },
    {
        widgetId: 'geoWidget',
        component: DefaultWidget,
    },
    {
        widgetId: 'matrix1dWidget',
        component: Matrix1dListWidget,
    },
    {
        widgetId: 'matrix2dWidget',
        component: DefaultWidget,
    },
    {
        widgetId: 'multiselectWidget',
        component: DefaultWidget,
    },
    {
        widgetId: 'numberMatrixWidget',
        component: DefaultWidget,
    },
    {
        widgetId: 'numberWidget',
        component: DefaultWidget,
    },
    {
        widgetId: 'organigramWidget',
        component: DefaultWidget,
    },
    {
        widgetId: 'scaleWidget',
        component: DefaultWidget,
    },
    {
        widgetId: 'selectWidget',
        component: DefaultWidget,
    },
];

const boundWidgetError = boundError(WidgetError);
const decorator = Component => boundWidgetError(Component);

const widgets = listToMap(
    widgetList,
    widget => widget.widgetId,
    (widget) => {
        const Widget = decorator(widget.component);
        return props => (
            <Widget
                {...props}
                widgetName={widget.widgetId}
            />
        );
    },
);

export const fetchWidget = widgetId => (
    widgets[widgetId]
);

export const dummy = {};
