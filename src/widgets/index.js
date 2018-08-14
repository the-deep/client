import boundError from '#rscg/BoundError';
import { mapToMap, mapToList } from '#rsu/common';
import update from '#rsu/immutable-update';

import FrameworkWidgetError from '#components/FrameworkWidgetError';
import WidgetError from '#components/WidgetError';

import DefaultEditWidget from './edit/Default';
// overview
import Matrix1dEditWidget from './edit/Matrix1d';
import Matrix2dEditWidget from './edit/Matrix2d';
import NumberMatrixEditWidget from './edit/NumberMatrix';
// list
import NumberEditWidget from './edit/Number';
// NOTE: using default widget for date instead
// import DateEditWidget from './edit/Date';
import OrganigramEditWidget from './edit/Organigram';
import MultiSelectEditWidget from './edit/MultiSelect';
import ScaleEditWidget from './edit/Scale';
import ConditionalEditWidget from './edit/Conditional';

// overview
import ExcerptWidget from './tagging/Excerpt';
import Matrix1dWidget from './tagging/Matrix1d';
import Matrix1dListWidget from './tagging/Matrix1dList';
import Matrix2dWidget from './tagging/Matrix2d';
import Matrix2dListWidget from './tagging/Matrix2dList';
import NumberMatrixWidget from './tagging/NumberMatrix';
import NumberMatrixListWidget from './tagging/NumberMatrixList';
// list
import DateWidget from './tagging/Date';
import DateRangeWidget from './tagging/DateRange';
import GeoWidget from './tagging/Geo';
import MultiSelectWidget from './tagging/MultiSelect';
import NumberWidget from './tagging/Number';
import OrganigramWidget from './tagging/Organigram';
import ScaleWidget from './tagging/Scale';
import SelectWidget from './tagging/Select';
import TimeWidget from './tagging/Time';
import ConditionalWidget from './tagging/Conditional';

// overview
import ExcerptViewWidget from './view/Excerpt';
import Matrix1dListViewWidget from './view/Matrix1dList';
import Matrix2dListViewWidget from './view/Matrix2dList';
import NumberMatrixListViewWidget from './view/NumberMatrixList';
// list
import DateViewWidget from './view/Date';
import DateRangeViewWidget from './view/DateRange';
import GeoViewWidget from './view/Geo';
import MultiSelectViewWidget from './view/MultiSelect';
import ConditionalViewWidget from './view/Conditional';
import NumberViewWidget from './view/Number';
import OrganigramViewWidget from './view/Organigram';
import ScaleViewWidget from './view/Scale';
import SelectViewWidget from './view/Select';
import TimeViewWidget from './view/Time';

// Constants

export const gridSize = {
    width: 12,
    height: 12,
};

export const VIEW = {
    overview: 'overview',
    list: 'list',
};

// Decorator for each widgets
const editDecorator = boundError(FrameworkWidgetError);
const decorator = boundError(WidgetError);

// Map of all widgets
let widgets = {
    excerptWidget: {
        // NOTE: used as _ts('widgetTitle', 'excerptWidgetLabel')
        title: 'excerptWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            minSize: { w: 15, h: 6 },
            tagComponent: ExcerptWidget,
        },
        list: {
            minSize: { w: 15, h: 6 },
            altTagComponent: ExcerptWidget,
            viewComponent: ExcerptViewWidget,
        },
    },
    matrix1dWidget: {
        // NOTE: used as _ts('widgetTitle', 'matrix1DWidgetLabel')
        title: 'matrix1DWidgetLabel',
        editComponent: Matrix1dEditWidget,

        overview: {
            minSize: { w: 14, h: 5 },
            tagComponent: Matrix1dWidget,
        },
        list: {
            minSize: { w: 12, h: 7 },
            altTagComponent: Matrix1dListWidget,
            viewComponent: Matrix1dListViewWidget,
        },
    },
    matrix2dWidget: {
        // NOTE: used as _ts('widgetTitle', 'matrix2DWidgetLabel')
        title: 'matrix2DWidgetLabel',
        editComponent: Matrix2dEditWidget,

        overview: {
            minSize: { w: 15, h: 6 },
            tagComponent: Matrix2dWidget,
        },
        list: {
            minSize: { w: 12, h: 7 },
            altTagComponent: Matrix2dListWidget,
            viewComponent: Matrix2dListViewWidget,
        },
    },
    numberMatrixWidget: {
        // NOTE: used as _ts('widgetTitle', 'numberMatrixWidgetLabel')
        title: 'numberMatrixWidgetLabel',
        editComponent: NumberMatrixEditWidget,

        overview: {
            minSize: { w: 15, h: 8 },
            tagComponent: NumberMatrixWidget,
        },
        list: {
            minSize: { w: 12, h: 7 },
            altTagComponent: NumberMatrixListWidget,
            viewComponent: NumberMatrixListViewWidget,
        },
    },


    dateWidget: {
        // NOTE: used as _ts('widgetTitle', 'dateWidgetLabel')
        title: 'dateWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            minSize: { w: 16, h: 5 },
            tagComponent: DateWidget,
        },
        list: {
            minSize: { w: 16, h: 5 },
            tagComponent: DateWidget,
            altTagComponent: DateViewWidget,
            viewComponent: DateViewWidget,
        },
    },
    timeWidget: {
        // NOTE: used as _ts('widgetTitle', 'timeWidgetLabel')
        title: 'timeWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            minSize: { w: 11, h: 5 },
            tagComponent: TimeWidget,
        },
        list: {
            minSize: { w: 11, h: 5 },
            tagComponent: TimeWidget,
            altTagComponent: TimeViewWidget,
            viewComponent: TimeViewWidget,
        },
    },
    dateRangeWidget: {
        // NOTE: used as _ts('widgetTitle', 'dateRangeWidgetLabel')
        title: 'dateRangeWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            minSize: { w: 20, h: 6 },
            tagComponent: DateRangeWidget,
        },
        list: {
            minSize: { w: 20, h: 6 },
            tagComponent: DateRangeWidget,
            altTagComponent: DateRangeViewWidget,
            viewComponent: DateRangeViewWidget,
        },
    },
    numberWidget: {
        // NOTE: used as _ts('widgetTitle', 'numberWidgetLabel')
        title: 'numberWidgetLabel',
        editComponent: NumberEditWidget,

        overview: {
            minSize: { w: 10, h: 4 },
            tagComponent: NumberWidget,
        },
        list: {
            minSize: { w: 10, h: 4 },
            tagComponent: NumberWidget,
            altTagComponent: NumberViewWidget,
            viewComponent: NumberViewWidget,
        },
    },
    scaleWidget: {
        // NOTE: used as _ts('widgetTitle', 'scaleWidgetLabel')
        title: 'scaleWidgetLabel',
        editComponent: ScaleEditWidget,

        overview: {
            minSize: { w: 6, h: 4 },
            tagComponent: ScaleWidget,
        },
        list: {
            minSize: { w: 6, h: 4 },
            tagComponent: ScaleWidget,
            altTagComponent: ScaleViewWidget,
            viewComponent: ScaleViewWidget,
        },
    },
    geoWidget: {
        // NOTE: used as _ts('widgetTitle', 'geoWidgetLabel')
        title: 'geoWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            minSize: { w: 12, h: 12 },
            tagComponent: GeoWidget,
        },
        list: {
            minSize: { w: 12, h: 12 },
            tagComponent: GeoWidget,
            altTagComponent: GeoViewWidget,
            viewComponent: GeoViewWidget,
        },
    },
    organigramWidget: {
        // NOTE: used as _ts('widgetTitle', 'organigramWidgetLabel')
        title: 'organigramWidgetLabel',
        editComponent: OrganigramEditWidget,

        overview: {
            minSize: { w: 12, h: 12 },
            tagComponent: OrganigramWidget,
        },
        list: {
            minSize: { w: 12, h: 12 },
            tagComponent: OrganigramWidget,
            altTagComponent: OrganigramViewWidget,
            viewComponent: OrganigramViewWidget,
        },
    },
    selectWidget: {
        // NOTE: used as _ts('widgetTitle', 'selectWidgetLabel')
        title: 'selectWidgetLabel',
        editComponent: MultiSelectEditWidget,

        overview: {
            minSize: { w: 12, h: 4 },
            tagComponent: SelectWidget,
        },
        list: {
            minSize: { w: 12, h: 4 },
            tagComponent: SelectWidget,
            altTagComponent: SelectViewWidget,
            viewComponent: SelectViewWidget,
        },
    },
    multiselectWidget: {
        // NOTE: used as _ts('widgetTitle', 'multiselectWidgetLabel')
        title: 'multiselectWidgetLabel',
        editComponent: MultiSelectEditWidget,

        overview: {
            minSize: { w: 12, h: 12 },
            tagComponent: MultiSelectWidget,
        },
        list: {
            minSize: { w: 12, h: 12 },
            tagComponent: MultiSelectWidget,
            altTagComponent: MultiSelectViewWidget,
            viewComponent: MultiSelectViewWidget,
        },
    },
    conditionalWidget: {
        // NOTE: used as _ts('widgetTitle', 'conditionalWidgetLabel')
        title: 'conditionalWidgetLabel',
        editComponent: ConditionalEditWidget,

        overview: {
            component: ConditionalWidget,
            viewComponent: ConditionalViewWidget,
            minSize: { w: 12, h: 12 },
        },
        list: {
            component: ConditionalWidget,
            viewComponent: ConditionalViewWidget,
            minSize: { w: 12, h: 12 },
        },
    },
};

// Modify widgets to inject and transform properties
widgets = mapToMap(
    widgets,
    undefined,
    (widget) => {
        const {
            title,
            editComponent,
            list,
            overview,
        } = widget;

        const prepareMinSize = ms => ({
            width: gridSize.width * ms.w,
            height: gridSize.height * ms.h,
        });

        const componentSettings = {
            initialLayout: { $set: {
                overviewGridLayout: {
                    left: 0,
                    top: 0,
                    ...prepareMinSize(overview.minSize),
                },
                listGridLayout: {
                    left: 0,
                    top: 0,
                    ...prepareMinSize(list.minSize),
                },
            } },
            title: { $set: title },
            editComponent: { $set: editDecorator(editComponent) },

            minSize: { $apply: prepareMinSize },
            tagComponent: { $apply: c => (c ? decorator(c) : undefined) },
            altTagComponent: { $apply: c => (c ? decorator(c) : undefined) },
            viewComponent: { $apply: c => (c ? decorator(c) : undefined) },
        };

        const settings = {
            list: componentSettings,
            overview: componentSettings,
        };
        return update(widget, settings);
    },
);

// Get list of widgets
export const widgetList = mapToList(
    widgets,
    (widget, key) => ({
        widgetId: key,
        ...widget.list,
    }),
);

// Access widgets

export const fetchWidget = (type, widgetId) => (
    widgets[widgetId] && widgets[widgetId][type]
);

export const hasWidget = (type, widgetId) => !!fetchWidget(type, widgetId);

// Determine visibility of widgets for WidgetListing
export const widgetListingVisibility = (widgetId, view) => (
    !!fetchWidget(view, widgetId).tagComponent
);

// Determine if tagComponent or altTagComponent should be shown
export const shouldShowAltTagComponent = (widgetId, view, addedFrom) => (
    view !== addedFrom
);

// Get tagComponent or altTagComponent
export const fetchWidgetTagComponent = (widgetId, view, addedFrom) => {
    const widget = fetchWidget(view, widgetId);

    if (!addedFrom) {
        console.warn(`ERROR: addedFrom is not defined for ${widgetId}`);
        return undefined;
    }

    return shouldShowAltTagComponent(widgetId, view, addedFrom)
        ? widget.altTagComponent
        : widget.tagComponent;
};

// Identify if there is a tag component
export const hasWidgetTagComponent = (widgetId, view, addedFrom) => (
    !!fetchWidgetTagComponent(widgetId, view, addedFrom)
);
