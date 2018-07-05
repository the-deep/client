import React from 'react';

import WidgetError from '#components/WidgetError';
import boundError from '#rs/components/General/BoundError';
import { listToMap } from '#rs/utils/common';

import DateWidget from './Date';
import DefaultWidget from './Default';
import ExcerptWidget from './Excerpt';
import NumberWidget from './Number';
import ScaleWidget from './Scale';
import MultiSelectWidget from './MultiSelect';
import Matrix1dOverviewWidget from './Matrix1dOverview';
import OrganigramWidget from './Organigram';

const WidgetList = [
    {
        widgetId: 'dateWidget',
        type: 'list',
        component: DateWidget,
    },
    {
        widgetId: 'excerptWidget',
        type: 'overview',
        component: ExcerptWidget,
    },
    {
        widgetId: 'excerptWidget',
        type: 'list',
        component: ExcerptWidget,
    },
    {
        widgetId: 'geoWidget',
        type: 'list',
        component: DefaultWidget,
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'overview',
        component: Matrix1dOverviewWidget,
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'list',
        component: DefaultWidget,
    },
    {
        widgetId: 'matrix2dWidget',
        type: 'overview',
        component: DefaultWidget,
    },
    {
        widgetId: 'matrix2dWidget',
        type: 'list',
        component: DefaultWidget,
    },
    {
        widgetId: 'multiselectWidget',
        type: 'list',
        component: MultiSelectWidget,
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'overview',
        component: DefaultWidget,
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'list',
        component: DefaultWidget,
    },
    {
        widgetId: 'numberWidget',
        type: 'list',
        component: NumberWidget,
    },
    {
        widgetId: 'organigramWidget',
        type: 'list',
        component: OrganigramWidget,
    },
    {
        widgetId: 'scaleWidget',
        type: 'list',
        component: ScaleWidget,
    },
];

const boundWidgetError = boundError(WidgetError);
const decorator = Component => boundWidgetError(Component);

const widgets = listToMap(
    WidgetList,
    widget => `${widget.type}:${widget.widgetId}`,
    (widget) => {
        const Widget = decorator(widget.component);
        return props => (
            <Widget
                {...props}
                widgetName={widget.widgetId}
                widgetType={widget.type}
            />
        );
    },
);

export const fetchWidget = (type, widgetId) => (
    widgets[`${type}:${widgetId}`]
);

export const hasWidget = (type, widgetId) => !!fetchWidget(type, widgetId);
