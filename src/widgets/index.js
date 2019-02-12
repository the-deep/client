import boundError from '#rscg/BoundError';
import { mapToMap, mapToList } from '@togglecorp/fujs';
import update from '#rsu/immutable-update';

import FrameworkWidgetError from '#components/error/FrameworkWidgetError';
import WidgetError from '#components/error/WidgetError';
import { widgetTitlesGroupMap } from '#widgets/widgetMetadata';

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
import ConditionalFrameworkPreview from './edit/Conditional/Preview';

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
import TimeRangeWidget from './tagging/TimeRange';
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
import TimeRangeViewWidget from './view/TimeRange';
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

export const globalWidgets = {
    excerptWidget: {
        editComponent: DefaultEditWidget,

        overview: {
            tagComponent: ExcerptWidget,
            minSize: { w: 16, h: 7 },
        },
        list: {
            altTagComponent: ExcerptWidget,
            viewComponent: ExcerptViewWidget,
            minSize: { w: 16, h: 7 },
        },
    },

    matrix1dWidget: {
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
        editComponent: DefaultEditWidget,

        overview: {
            tagComponent: DateWidget,
            minSize: { w: 16, h: 6 },
        },
        list: {
            tagComponent: DateWidget,
            altTagComponent: DateViewWidget,
            viewComponent: DateViewWidget,
            minSize: { w: 16, h: 6 },
        },
    },
    timeWidget: {
        editComponent: DefaultEditWidget,

        overview: {
            tagComponent: TimeWidget,
            minSize: { w: 11, h: 6 },
        },
        list: {
            tagComponent: TimeWidget,
            altTagComponent: TimeViewWidget,
            viewComponent: TimeViewWidget,
            minSize: { w: 11, h: 6 },
        },
    },
    timeRangeWidget: {
        editComponent: DefaultEditWidget,

        overview: {
            tagComponent: TimeRangeWidget,
            minSize: { w: 14, h: 7 },
        },
        list: {
            tagComponent: TimeRangeWidget,
            altTagComponent: TimeRangeViewWidget,
            viewComponent: TimeRangeViewWidget,
            minSize: { w: 14, h: 7 },
        },
    },
    dateRangeWidget: {
        editComponent: DefaultEditWidget,

        overview: {
            tagComponent: DateRangeWidget,
            minSize: { w: 19, h: 7 },
        },
        list: {
            tagComponent: DateRangeWidget,
            altTagComponent: DateRangeViewWidget,
            viewComponent: DateRangeViewWidget,
            minSize: { w: 19, h: 7 },
        },
    },

    numberWidget: {
        editComponent: NumberEditWidget,

        overview: {
            tagComponent: NumberWidget,
            minSize: { w: 11, h: 6 },
        },
        list: {
            tagComponent: NumberWidget,
            altTagComponent: NumberViewWidget,
            viewComponent: NumberViewWidget,
            minSize: { w: 11, h: 6 },
        },
    },
    scaleWidget: {
        editComponent: ScaleEditWidget,

        overview: {
            tagComponent: ScaleWidget,
            minSize: { w: 9, h: 5 },
        },
        list: {
            tagComponent: ScaleWidget,
            altTagComponent: ScaleViewWidget,
            viewComponent: ScaleViewWidget,
            minSize: { w: 9, h: 5 },
        },
    },

    geoWidget: {
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
        editComponent: MultiSelectEditWidget,

        overview: {
            tagComponent: SelectWidget,
            minSize: { w: 11, h: 6 },
        },
        list: {
            tagComponent: SelectWidget,
            altTagComponent: SelectViewWidget,
            viewComponent: SelectViewWidget,
            minSize: { w: 11, h: 6 },
        },
    },
    multiselectWidget: {
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
        editComponent: ConditionalEditWidget,
        frameworkComponent: ConditionalFrameworkPreview,

        overview: {
            tagComponent: ConditionalWidget,
            minSize: { w: 12, h: 12 },
        },
        list: {
            tagComponent: ConditionalWidget,
            altTagComponent: ConditionalWidget,
            viewComponent: ConditionalViewWidget,
            minSize: { w: 12, h: 12 },
        },
    },
};

// Modify widgets to inject and transform properties
const widgets = mapToMap(
    globalWidgets,
    undefined,
    (widget, widgetKey) => {
        const {
            editComponent,
            frameworkComponent,
            list,
            overview,
        } = widget;
        const {
            title,
            groupId = 'misc',
        } = widgetTitlesGroupMap[widgetKey];

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
            frameworkComponent: { $set: frameworkComponent },
            groupId: { $set: groupId },

            minSize: { $apply: prepareMinSize },
            tagComponent: { $apply: c => (c ? decorator(c) : undefined) },
            altTagComponent: { $apply: c => (c ? decorator(c) : undefined) },
            viewComponent: { $apply: c => (c ? decorator(c) : undefined) },

            // groupOrder: { $set: groupInfo.order },
            // groupTitle: { $set: groupInfo.title },
            // groupId: { $setDefault: 'misc' },
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

// Get viewComponent
export const fetchWidgetViewComponent = widgetId => fetchWidget(
    VIEW.list,
    widgetId,
).viewComponent;

// Same as above but also check if a frameworkComponent exists
export const fetchWidgetFrameworkComponent = (widgetId, view, addedFrom) => {
    const { frameworkComponent } = fetchWidget(view, widgetId);
    const tagComponent = fetchWidgetTagComponent(widgetId, view, addedFrom);

    if (!tagComponent) {
        return undefined;
    }

    if (frameworkComponent) {
        return frameworkComponent;
    }

    return tagComponent;
};

// Identify if there is a tag component
export const hasWidgetTagComponent = (widgetId, view, addedFrom) => (
    !!fetchWidgetTagComponent(widgetId, view, addedFrom)
);

// Identify if there is a framework component
export const hasWidgetFrameworkComponent = (widgetId, view, addedFrom) => (
    !!fetchWidgetFrameworkComponent(widgetId, view, addedFrom)
);
