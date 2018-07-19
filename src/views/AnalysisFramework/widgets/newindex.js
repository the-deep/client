import WidgetError from '#components/WidgetError';
import boundError from '#rs/components/General/BoundError';
import { listToMap } from '#rs/utils/common';

// import DateWidget from './Date';
// import DateRangeWidget from './DateRange';
import ExcerptEditWidget from './Excerpt';
import ExcerptWidget from '../../EditEntries/widgets/Excerpt';
/*
import GeoWidget from './Geo';
import Matrix1dWidget from './Matrix1d';
import Matrix1dListWidget from './Matrix1dList';
import Matrix2dWidget from './Matrix2d';
import Matrix2dListWidget from './Matrix2dList';
import MultiSelectWidget from './MultiSelect';
import NumberWidget from './Number';
import NumberMatrixWidget from './NumberMatrix';
import NumberMatrixListWidget from './NumberMatrixList';
import OrganigramWidget from './Organigram';
import ScaleWidget from './Scale';
import SelectWidget from './Select';
import TimeWidget from './Time';
*/

const widgetList = [
    /*
    {
        widgetId: 'dateRangeWidget',
        type: 'list',
        component: DateRangeWidget,

        // NOTE: used as _ts('widgetTitle', 'dateRangeWidgetLabel')
        title: 'dateRangeWidgetLabel',
        minSize: { w: 26, h: 3 },
    },
    {
        widgetId: 'dateWidget',
        type: 'list',
        component: DateWidget,

        // NOTE: used as _ts('widgetTitle', 'dateWidgetLabel')
        title: 'dateWidgetLabel',
        minSize: { w: 13, h: 3 },
    },
    {
        widgetId: 'timeWidget',
        type: 'list',
        component: TimeWidget,

        // NOTE: used as _ts('widgetTitle', 'timeWidgetLabel')
        title: 'timeWidgetLabel',
        minSize: { w: 13, h: 3 },
    },
    */
    {
        widgetId: 'excerptWidget',
        type: 'overview',
        component: ExcerptWidget,

        // NOTE: used as _ts('widgetTitle', 'excerptWidgetLabel')
        title: 'excerptWidgetLabel',
        minSize: { w: 15, h: 6 },

        editComponent: ExcerptEditWidget,
    },
    {
        widgetId: 'testWidget',
        type: 'overview',
        component: ExcerptWidget,

        // NOTE: used as _ts('widgetTitle', 'testWidgetLabel')
        title: 'testWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    /*
    {
        widgetId: 'excerptWidget',
        type: 'list',
        component: ExcerptWidget,

        // NOTE: used as _ts('widgetTitle', 'excerptWidgetLabel')
        title: 'excerptWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'geoWidget',
        type: 'list',
        component: GeoWidget,

        // NOTE: used as _ts('widgetTitle', 'geoWidgetLabel')
        title: 'geoWidgetLabel',
        minSize: { w: 20, h: 12 },
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'overview',
        component: Matrix1dWidget,

        // NOTE: used as _ts('widgetTitle', 'matrix1DWidgetLabel')
        title: 'matrix1DWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'matrix1dWidget',
        type: 'list',
        component: Matrix1dListWidget,

        // NOTE: used as _ts('widgetTitle', 'matrix1DWidgetLabel')
        title: 'matrix1DWidgetLabel',
        minSize: { w: 12, h: 12 },
    },
    {
        widgetId: 'matrix2dWidget',
        type: 'overview',
        component: Matrix2dWidget,

        // NOTE: used as _ts('widgetTitle', 'matrix2DWidgetLabel')
        title: 'matrix2DWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'matrix2dWidget',
        type: 'list',
        component: Matrix2dListWidget,

        // NOTE: used as _ts('widgetTitle', 'matrix2DWidgetLabel')
        title: 'matrix2DWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'multiselectWidget',
        type: 'list',
        component: MultiSelectWidget,

        // NOTE: used as _ts('widgetTitle', 'multiselectWidgetLabel')
        title: 'multiselectWidgetLabel',
        minSize: { w: 7, h: 15 },
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'overview',
        component: NumberMatrixWidget,

        // NOTE: used as _ts('widgetTitle', 'numberMatrixWidgetLabel')
        title: 'numberMatrixWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'numberMatrixWidget',
        type: 'list',
        component: NumberMatrixListWidget,

        // NOTE: used as _ts('widgetTitle', 'numberMatrixWidgetLabel')
        title: 'numberMatrixWidgetLabel',
        minSize: { w: 15, h: 6 },
    },
    {
        widgetId: 'numberWidget',
        type: 'list',
        component: NumberWidget,

        // NOTE: used as _ts('widgetTitle', 'numberWidgetLabel')
        title: 'numberWidgetLabel',
        minSize: { w: 10, h: 3 },
    },
    {
        widgetId: 'organigramWidget',
        type: 'list',
        component: OrganigramWidget,

        // NOTE: used as _ts('widgetTitle', 'organigramWidgetLabel')
        title: 'organigramWidgetLabel',
        minSize: { w: 10, h: 12 },
    },
    {
        widgetId: 'scaleWidget',
        type: 'list',
        component: ScaleWidget,

        // NOTE: used as _ts('widgetTitle', 'scaleWidgetLabel')
        title: 'scaleWidgetLabel',
        minSize: { w: 6, h: 4 },
    },
    {
        widgetId: 'selectWidget',
        type: 'list',
        component: SelectWidget,

        // NOTE: used as _ts('widgetTitle', 'selectWidgetLabel')
        title: 'selectWidgetLabel',
        minSize: { w: 12, h: 3 },
    },
    */
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
                width: 16 * minSize.w,
                height: 16 * minSize.h,
            },
        };
    },
);

export const fetchWidget = (type, widgetId) => (
    widgets[`${type}:${widgetId}`]
);

export const hasWidget = (type, widgetId) => !!fetchWidget(type, widgetId);
