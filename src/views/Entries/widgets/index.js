import React from 'react';
import WidgetError from '#components/WidgetError';
import boundError from '#rscg/BoundError';

import { listToMap } from '#rsu/common';

import Matrix1dListWidget from './Matrix1dList';
import Matrix2dListWidget from './Matrix2dList';
import ExcerptWidget from './Excerpt';
import NumberMatrixWidget from './NumberMatrix';
import GeoWidget from './Geo';
import OrganigramWidget from './Organigram';
import MultiSelectWidget from './MultiSelect';
import DateWidget from './Date';
import TimeWidget from './Time';
import NumberWidget from './Number';
import ScaleWidget from './Scale';
import SelectWidget from './Select';
import DateRangeWidget from './DateRange';
// import DefaultWidget from './Default';

const widgetList = [
    {
        widgetId: 'dateRangeWidget',
        component: DateRangeWidget,
    },
    {
        widgetId: 'dateWidget',
        component: DateWidget,
    },
    {
        widgetId: 'timeWidget',
        component: TimeWidget,
    },
    {
        widgetId: 'excerptWidget',
        component: ExcerptWidget,
    },
    {
        widgetId: 'geoWidget',
        component: GeoWidget,
    },
    {
        widgetId: 'matrix1dWidget',
        component: Matrix1dListWidget,
    },
    {
        widgetId: 'matrix2dWidget',
        component: Matrix2dListWidget,
    },
    {
        widgetId: 'multiselectWidget',
        component: MultiSelectWidget,
    },
    {
        widgetId: 'numberMatrixWidget',
        component: NumberMatrixWidget,
    },
    {
        widgetId: 'numberWidget',
        component: NumberWidget,
    },
    {
        widgetId: 'organigramWidget',
        component: OrganigramWidget,
    },
    {
        widgetId: 'scaleWidget',
        component: ScaleWidget,
    },
    {
        widgetId: 'selectWidget',
        component: SelectWidget,
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
