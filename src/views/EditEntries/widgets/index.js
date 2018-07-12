import WidgetError from '#components/WidgetError';
import boundError from '#rs/components/General/BoundError';
import { listToMap } from '#rs/utils/common';

import DateWidget from './Date';
import DateRangeWidget from './DateRange';
import DefaultWidget from './Default';
import ExcerptWidget from './Excerpt';
import NumberWidget from './Number';
import ScaleWidget from './Scale';
import MultiSelectWidget from './MultiSelect';
import SelectWidget from './Select';
import Matrix1dOverviewWidget from './Matrix1dOverview';
import OrganigramWidget from './Organigram';
import GeoWidget from './Geo';
import NumberMatrixOverviewWidget from './NumberMatrixOverview';
import NumberMatrixListWidget from './NumberMatrixList';
import Matrix2dOverviewWidget from './Matrix2dOverview';

const WidgetList = [
    {
        widgetId: 'dateWidget',
        type: 'list',
        component: DateWidget,
    },
    {
        widgetId: 'dateRangeWidget',
        type: 'list',
        component: DateRangeWidget,
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
        component: Matrix2dOverviewWidget,
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
        widgetId: 'selectWidget',
        type: 'list',
        component: SelectWidget,
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'overview',
        component: NumberMatrixOverviewWidget,
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
];

const boundWidgetError = boundError(WidgetError);
const decorator = Component => boundWidgetError(Component);

const widgets = listToMap(
    WidgetList,
    widget => `${widget.type}:${widget.widgetId}`,
    widget => decorator(widget.component),
);

export const fetchWidget = (type, widgetId) => (
    widgets[`${type}:${widgetId}`]
);

export const hasWidget = (type, widgetId) => !!fetchWidget(type, widgetId);
