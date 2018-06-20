import React from 'react';

import WidgetError from '#components/WidgetError';
import boundError from '#rs/components/General/BoundError';
import Bundle from '#rs/components/General/Bundle';

import { listToMap } from '#rs/utils/common';

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


const boundWidgetError = boundError(WidgetError);
const decorator = Component => boundWidgetError(Component);

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

export const fetchWidget = (type, widgetId) => (
    widgets[`${type}:${widgetId}`]
);

export const hasWidget = (type, widgetId) => !!fetchWidget(type, widgetId);
