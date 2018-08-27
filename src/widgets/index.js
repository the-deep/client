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
import DateEditWidget from './edit/Date';
import OrganigramEditWidget from './edit/Organigram';
import MultiSelectEditWidget from './edit/MultiSelect';
import ScaleEditWidget from './edit/Scale';

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

export const VISIBILITY = {
    primary: 'primary',
    secondary: 'secondary',

    hidden: 'hidden',
};

// Decorator for each widgets
const editDecorator = boundError(FrameworkWidgetError);
const decorator = boundError(WidgetError);

let widgets = {
    excerptWidget: {
        // NOTE: used as _ts('widgetTitle', 'excerptWidgetLabel')
        title: 'excerptWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            component: ExcerptWidget,
            minSize: { w: 15, h: 6 },
        },
        list: {
            component: ExcerptWidget,
            viewComponent: ExcerptViewWidget,
            minSize: { w: 15, h: 6 },
        },
    },
    matrix1dWidget: {
        // NOTE: used as _ts('widgetTitle', 'matrix1DWidgetLabel')
        title: 'matrix1DWidgetLabel',
        editComponent: Matrix1dEditWidget,

        overview: {
            component: Matrix1dWidget,
            minSize: { w: 14, h: 5 },
        },
        list: {
            component: Matrix1dListWidget,
            viewComponent: Matrix1dListViewWidget,
            minSize: { w: 12, h: 7 },
        },
    },
    matrix2dWidget: {
        // NOTE: used as _ts('widgetTitle', 'matrix2DWidgetLabel')
        title: 'matrix2DWidgetLabel',
        editComponent: Matrix2dEditWidget,

        overview: {
            component: Matrix2dWidget,
            minSize: { w: 15, h: 6 },
        },
        list: {
            component: Matrix2dListWidget,
            viewComponent: Matrix2dListViewWidget,
            minSize: { w: 12, h: 7 },
        },
    },
    numberMatrixWidget: {
        // NOTE: used as _ts('widgetTitle', 'numberMatrixWidgetLabel')
        title: 'numberMatrixWidgetLabel',
        editComponent: NumberMatrixEditWidget,

        overview: {
            component: NumberMatrixWidget,
            minSize: { w: 15, h: 8 },
        },
        list: {
            component: NumberMatrixListWidget,
            viewComponent: NumberMatrixListViewWidget,
            minSize: { w: 12, h: 7 },
        },
    },


    dateWidget: {
        // NOTE: used as _ts('widgetTitle', 'dateWidgetLabel')
        title: 'dateWidgetLabel',
        editComponent: DateEditWidget,

        overview: {
            component: DateWidget,
            viewComponent: DateViewWidget,
            minSize: { w: 16, h: 5 },
        },
        list: {
            component: DateWidget,
            viewComponent: DateViewWidget,
            minSize: { w: 16, h: 5 },
        },
    },
    timeWidget: {
        // NOTE: used as _ts('widgetTitle', 'timeWidgetLabel')
        title: 'timeWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            component: TimeWidget,
            viewComponent: TimeViewWidget,
            minSize: { w: 11, h: 5 },
        },
        list: {
            component: TimeWidget,
            viewComponent: TimeViewWidget,
            minSize: { w: 11, h: 5 },
        },
    },
    dateRangeWidget: {
        // NOTE: used as _ts('widgetTitle', 'dateRangeWidgetLabel')
        title: 'dateRangeWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            component: DateRangeWidget,
            viewComponent: DateRangeViewWidget,
            minSize: { w: 20, h: 6 },
        },
        list: {
            component: DateRangeWidget,
            viewComponent: DateRangeViewWidget,
            minSize: { w: 20, h: 6 },
        },
    },
    numberWidget: {
        // NOTE: used as _ts('widgetTitle', 'numberWidgetLabel')
        title: 'numberWidgetLabel',
        editComponent: NumberEditWidget,

        overview: {
            component: NumberWidget,
            viewComponent: NumberViewWidget,
            minSize: { w: 10, h: 4 },
        },
        list: {
            component: NumberWidget,
            viewComponent: NumberViewWidget,
            minSize: { w: 10, h: 4 },
        },
    },
    scaleWidget: {
        // NOTE: used as _ts('widgetTitle', 'scaleWidgetLabel')
        title: 'scaleWidgetLabel',
        editComponent: ScaleEditWidget,

        overview: {
            component: ScaleWidget,
            viewComponent: ScaleViewWidget,
            minSize: { w: 6, h: 4 },
        },
        list: {
            component: ScaleWidget,
            viewComponent: ScaleViewWidget,
            minSize: { w: 6, h: 4 },
        },
    },
    geoWidget: {
        // NOTE: used as _ts('widgetTitle', 'geoWidgetLabel')
        title: 'geoWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            component: GeoWidget,
            viewComponent: GeoViewWidget,
            minSize: { w: 12, h: 12 },
        },
        list: {
            component: GeoWidget,
            viewComponent: GeoViewWidget,
            minSize: { w: 12, h: 12 },
        },
    },
    organigramWidget: {
        // NOTE: used as _ts('widgetTitle', 'organigramWidgetLabel')
        title: 'organigramWidgetLabel',
        editComponent: OrganigramEditWidget,

        overview: {
            component: OrganigramWidget,
            viewComponent: OrganigramViewWidget,
            minSize: { w: 12, h: 12 },
        },
        list: {
            component: OrganigramWidget,
            viewComponent: OrganigramViewWidget,
            minSize: { w: 12, h: 12 },
        },
    },
    selectWidget: {
        // NOTE: used as _ts('widgetTitle', 'selectWidgetLabel')
        title: 'selectWidgetLabel',
        editComponent: MultiSelectEditWidget,

        overview: {
            component: SelectWidget,
            viewComponent: SelectViewWidget,
            minSize: { w: 12, h: 4 },
        },
        list: {
            component: SelectWidget,
            viewComponent: SelectViewWidget,
            minSize: { w: 12, h: 4 },
        },
    },
    multiselectWidget: {
        // NOTE: used as _ts('widgetTitle', 'multiselectWidgetLabel')
        title: 'multiselectWidgetLabel',
        editComponent: MultiSelectEditWidget,

        overview: {
            component: MultiSelectWidget,
            viewComponent: MultiSelectViewWidget,
            minSize: { w: 12, h: 12 },
        },
        list: {
            component: MultiSelectWidget,
            viewComponent: MultiSelectViewWidget,
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
            title: { $set: title },
            editComponent: { $set: editDecorator(editComponent) },
            initialLayout: { $set: {
                overviewGridLayout: overview && {
                    left: 0,
                    top: 0,
                    ...prepareMinSize(overview.minSize),
                },
                listGridLayout: list && {
                    left: 0,
                    top: 0,
                    ...prepareMinSize(list.minSize),
                },
            } },
            component: { $apply: c => decorator(c) },
            viewComponent: { $apply: c => (c ? decorator(c) : undefined) },
            minSize: { $apply: prepareMinSize },
        };

        const settings = {
            list: {
                $if: [
                    list,
                    componentSettings,
                ],
            },
            overview: {
                $if: [
                    overview,
                    componentSettings,
                ],
            },
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

// Determine visibility of widgets for WidgetListing
export const widgetListingVisibility = (widgetId, ...otherParams) => {
    const overviewWidgetFn = view => view === VIEW.overview;
    const listWidgetFn = () => true;

    const mapping = {
        excerptWidget: overviewWidgetFn,
        matrix1dWidget: overviewWidgetFn,
        matrix2dWidget: overviewWidgetFn,
        numberMatrixWidget: overviewWidgetFn,

        dateRangeWidget: listWidgetFn,
        dateWidget: listWidgetFn,
        timeWidget: listWidgetFn,
        geoWidget: listWidgetFn,
        multiselectWidget: listWidgetFn,
        numberWidget: listWidgetFn,
        organigramWidget: listWidgetFn,
        scaleWidget: listWidgetFn,
        selectWidget: listWidgetFn,
    };
    return mapping[widgetId](...otherParams);
};

// Determine visibility of widgets for WidgetEditor
export const widgetVisibility = (widgetId, view, addedFrom) => {
    const {
        primary,
        secondary,
        hidden,
    } = VISIBILITY;

    if (addedFrom === VIEW.overview) {
        return view === VIEW.overview ? primary : secondary;
    } else if (addedFrom === VIEW.list) {
        return view === VIEW.list ? primary : hidden;
    } else if (addedFrom === undefined) {
        // NOTE: To support legacy widgets,
        // if there is no addedFrom, only show it in list view
        return view === VIEW.overview ? hidden : primary;
    }
    console.error('Unknown view or addedFrom defined.');
    return hidden;
};

// Access widgets

export const fetchWidget = (type, widgetId) => (
    widgets[widgetId] && widgets[widgetId][type]
);

export const hasWidget = (type, widgetId) => !!fetchWidget(type, widgetId);
