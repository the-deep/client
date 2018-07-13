import WidgetError from '#components/WidgetError';
import boundError from '#rs/components/General/BoundError';
import { listToMap } from '#rs/utils/common';

import DateRangeWidget from './DateRange';
import DateWidget from './Date';
import DefaultWidget from './Default';
import ExcerptWidget from './Excerpt';
import GeoWidget from './Geo';
import Matrix1dListWidget from './Matrix1dList';
import Matrix1dWidget from './Matrix1d';
import Matrix2dWidget from './Matrix2d';
import MultiSelectWidget from './MultiSelect';
import NumberMatrixListWidget from './NumberMatrixList';
import NumberMatrixWidget from './NumberMatrix';
import NumberWidget from './Number';
import OrganigramWidget from './Organigram';
import ScaleWidget from './Scale';
import SelectWidget from './Select';

const widgetList = [
    {
        widgetId: 'dateRangeWidget',
        type: 'list',
        component: DateRangeWidget,
    },
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
        component: GeoWidget,
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'overview',
        component: Matrix1dWidget,
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'list',
        component: Matrix1dListWidget,
    },
    {
        widgetId: 'matrix2dWidget',
        type: 'overview',
        component: Matrix2dWidget,
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
        component: NumberMatrixWidget,
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'list',
        component: NumberMatrixListWidget,
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
    {
        widgetId: 'selectWidget',
        type: 'list',
        component: SelectWidget,
    },
];

const boundWidgetError = boundError(WidgetError);
const decorator = Component => boundWidgetError(Component);

const widgets = listToMap(
    widgetList,
    widget => `${widget.type}:${widget.widgetId}`,
    widget => decorator(widget.component),
);

export const fetchWidget = (type, widgetId) => (
    widgets[`${type}:${widgetId}`]
);

export const hasWidget = (type, widgetId) => !!fetchWidget(type, widgetId);
