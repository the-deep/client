import React from 'react';

import WidgetError from '#components/WidgetError';
import boundError from '#rs/components/General/BoundError';
import Bundle from '#rs/components/General/Bundle';

import { listToMap } from '#rs/utils/common';

import DateWidget from './Date';
import DefaultWidget from './Default';
import ExcerptWidget from './Excerpt';
import NumberWidget from './Number';
import ScaleWidget from './Scale';
import MultiSelectWidget from './MultiSelect';

/*
const widgetList = [
    {
        widgetId: 'dateWidget',
        type: 'list',
        loader: () => import('./Date'),
    },
    {
        widgetId: 'excerptWidget',
        type: 'overview',
        loader: () => import('./Excerpt'),
    },
    {
        widgetId: 'excerptWidget',
        type: 'list',
        loader: () => import('./Excerpt'),
    },
    {
        widgetId: 'geoWidget',
        type: 'list',
        loader: () => import('./Default'),
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'overview',
        loader: () => import('./Default'),
    },
    {
        widgetId: 'matrix2dWidget',
        type: 'overview',
        loader: () => import('./Default'),
    },
    {
        widgetId: 'matrix2dWidget',
        type: 'list',
        loader: () => import('./Default'),
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'list',
        loader: () => import('./Default'),
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'overview',
        loader: () => import('./Default'),
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'list',
        loader: () => import('./Default'),
    },
    {
        widgetId: 'multiselectWidget',
        type: 'list',
        loader: () => import('./MultiSelect'),
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'overview',
        loader: () => import('./Default'),
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'list',
        loader: () => import('./Default'),
    },
    {
        widgetId: 'numberWidget',
        type: 'list',
        loader: () => import('./Number'),
    },
    {
        widgetId: 'organigramWidget',
        type: 'list',
        loader: () => import('./Default'),
    },
    {
        widgetId: 'scaleWidget',
        type: 'list',
        loader: () => import('./Scale'),
    },
];
*/

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
        widgetId: 'matrix1dWidget',
        type: 'list',
        component: DefaultWidget,
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'overview',
        component: DefaultWidget,
    },
    {
        widgetId: 'matrix1dWidget',
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
        component: DefaultWidget,
    },
    {
        widgetId: 'scaleWidget',
        type: 'list',
        component: ScaleWidget,
    },
];

const boundWidgetError = boundError(WidgetError);
const decorator = Component => boundWidgetError(Component);

/*
const widgets = listToMap(
    widgetList,
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
*/

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
