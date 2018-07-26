import WidgetError from '#components/WidgetError';
import boundError from '#rs/components/General/BoundError';
import { listToMap } from '#rs/utils/common';

import DefaultEditWidget from './Default';
import NumberEditWidget from './Number';
import DateEditWidget from './Date';
import OrganigramEditWidget from './Organigram';
import MultiSelectEditWidget from './MultiSelect';
import ScaleEditWiget from './Scale';

import DateWidget from '../../EditEntries/widgets/Date';
import DateRangeWidget from '../../EditEntries/widgets/DateRange';
import ExcerptWidget from '../../EditEntries/widgets/Excerpt';
import GeoWidget from '../../EditEntries/widgets/Geo';
import Matrix1dWidget from '../../EditEntries/widgets/Matrix1d';
import Matrix1dListWidget from '../../EditEntries/widgets/Matrix1dList';
import Matrix2dWidget from '../../EditEntries/widgets/Matrix2d';
import Matrix2dListWidget from '../../EditEntries/widgets/Matrix2dList';
import MultiSelectWidget from '../../EditEntries/widgets/MultiSelect';
import NumberWidget from '../../EditEntries/widgets/Number';
import NumberMatrixWidget from '../../EditEntries/widgets/NumberMatrix';
import NumberMatrixListWidget from '../../EditEntries/widgets/NumberMatrixList';
import OrganigramWidget from '../../EditEntries/widgets/Organigram';
import ScaleWidget from '../../EditEntries/widgets/Scale';
import SelectWidget from '../../EditEntries/widgets/Select';
import TimeWidget from '../../EditEntries/widgets/Time';

export const gridSize = {
    width: 16,
    height: 16,
};

const widgetList = [
    {
        widgetId: 'dateRangeWidget',
        type: 'list',
        component: DateRangeWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'dateRangeWidgetLabel')
        title: 'dateRangeWidgetLabel',
        minSize: { w: 26, h: 3 },
    },
    {
        widgetId: 'dateWidget',
        type: 'list',
        component: DateWidget,
        editComponent: DateEditWidget,

        // NOTE: used as _ts('widgetTitle', 'dateWidgetLabel')
        title: 'dateWidgetLabel',
        minSize: { w: 13, h: 3 },
    },
    {
        widgetId: 'timeWidget',
        type: 'list',
        component: TimeWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'timeWidgetLabel')
        title: 'timeWidgetLabel',
        minSize: { w: 13, h: 3 },
    },
    {
        widgetId: 'excerptWidget',
        type: 'overview',
        component: ExcerptWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'excerptWidgetLabel')
        title: 'excerptWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'excerptWidget',
        type: 'list',
        component: ExcerptWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'excerptWidgetLabel')
        title: 'excerptWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'geoWidget',
        type: 'list',
        component: GeoWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'geoWidgetLabel')
        title: 'geoWidgetLabel',
        minSize: { w: 20, h: 12 },
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'overview',
        component: Matrix1dWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'matrix1DWidgetLabel')
        title: 'matrix1DWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'list',
        component: Matrix1dListWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'matrix1DWidgetLabel')
        title: 'matrix1DWidgetLabel',
        minSize: { w: 12, h: 12 },
    },
    {
        widgetId: 'matrix2dWidget',
        type: 'overview',
        component: Matrix2dWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'matrix2DWidgetLabel')
        title: 'matrix2DWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'matrix2dWidget',
        type: 'list',
        component: Matrix2dListWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'matrix2DWidgetLabel')
        title: 'matrix2DWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'overview',
        component: NumberMatrixWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'numberMatrixWidgetLabel')
        title: 'numberMatrixWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'list',
        component: NumberMatrixListWidget,
        editComponent: DefaultEditWidget,

        // NOTE: used as _ts('widgetTitle', 'numberMatrixWidgetLabel')
        title: 'numberMatrixWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'multiselectWidget',
        type: 'list',
        component: MultiSelectWidget,
        editComponent: MultiSelectEditWidget,

        // NOTE: used as _ts('widgetTitle', 'multiselectWidgetLabel')
        title: 'multiselectWidgetLabel',
        minSize: { w: 7, h: 15 },
    },
    {
        widgetId: 'numberWidget',
        type: 'list',
        component: NumberWidget,
        editComponent: NumberEditWidget,

        // NOTE: used as _ts('widgetTitle', 'numberWidgetLabel')
        title: 'numberWidgetLabel',
        minSize: { w: 10, h: 3 },
    },
    {
        widgetId: 'organigramWidget',
        type: 'list',
        component: OrganigramWidget,
        editComponent: OrganigramEditWidget,

        // NOTE: used as _ts('widgetTitle', 'organigramWidgetLabel')
        title: 'organigramWidgetLabel',
        minSize: { w: 10, h: 12 },
    },
    {
        widgetId: 'scaleWidget',
        type: 'list',
        component: ScaleWidget,
        editComponent: ScaleEditWiget,

        // NOTE: used as _ts('widgetTitle', 'scaleWidgetLabel')
        title: 'scaleWidgetLabel',
        minSize: { w: 6, h: 4 },
    },
    {
        widgetId: 'selectWidget',
        type: 'list',
        component: SelectWidget,
        editComponent: MultiSelectEditWidget,

        // NOTE: used as _ts('widgetTitle', 'selectWidgetLabel')
        title: 'selectWidgetLabel',
        minSize: { w: 12, h: 3 },
    },
];

export const listWidgets = widgetList.filter(widget => widget.type === 'list');
export const overviewWidgets = widgetList.filter(widget => widget.type === 'overview');

const boundWidgetError = boundError(WidgetError);
const decorator = Component => boundWidgetError(Component);

const widgets = listToMap(
    widgetList,
    widget => `${widget.type}:${widget.widgetId}`,
    (widget) => {
        const {
            minSize,
            component,
            editComponent,
        } = widget;
        return {
            ...widget,
            component: decorator(component),
            editComponent: editComponent ? decorator(editComponent) : undefined,
            minSize: {
                width: gridSize.width * minSize.w,
                height: gridSize.height * minSize.h,
            },
        };
    },
);

export const fetchWidget = (type, widgetId) => (
    widgets[`${type}:${widgetId}`]
);

export const hasWidget = (type, widgetId) => !!fetchWidget(type, widgetId);
