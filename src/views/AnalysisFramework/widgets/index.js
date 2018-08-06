import boundError from '#rscg/BoundError';
import { mapToMap, mapToList } from '#rsu/common';
import update from '#rsu/immutable-update';

import FrameworkWidgetError from '#components/FrameworkWidgetError';

import DefaultEditWidget from './Default';
// overview
import Matrix1dEditWidget from './Matrix1d';
import Matrix2dEditWidget from './Matrix2d';
import NumberMatrixEditWidget from './NumberMatrix';
// list
import NumberEditWidget from './Number';
import DateEditWidget from './Date';
import OrganigramEditWidget from './Organigram';
import MultiSelectEditWidget from './MultiSelect';
import ScaleEditWidget from './Scale';

// overview
import ExcerptWidget from '../../EditEntries/widgets/Excerpt';
import Matrix1dWidget from '../../EditEntries/widgets/Matrix1d';
import Matrix1dListWidget from '../../EditEntries/widgets/Matrix1dList';
import Matrix2dWidget from '../../EditEntries/widgets/Matrix2d';
import Matrix2dListWidget from '../../EditEntries/widgets/Matrix2dList';
import NumberMatrixWidget from '../../EditEntries/widgets/NumberMatrix';
import NumberMatrixListWidget from '../../EditEntries/widgets/NumberMatrixList';
// list
import DateWidget from '../../EditEntries/widgets/Date';
import DateRangeWidget from '../../EditEntries/widgets/DateRange';
import GeoWidget from '../../EditEntries/widgets/Geo';
import MultiSelectWidget from '../../EditEntries/widgets/MultiSelect';
import NumberWidget from '../../EditEntries/widgets/Number';
import OrganigramWidget from '../../EditEntries/widgets/Organigram';
import ScaleWidget from '../../EditEntries/widgets/Scale';
import SelectWidget from '../../EditEntries/widgets/Select';
import TimeWidget from '../../EditEntries/widgets/Time';

// overview
import ExcerptViewWidget from '../../Entries/widgets/Excerpt';
import Matrix1dListViewWidget from '../../Entries/widgets/Matrix1dList';
import Matrix2dListViewWidget from '../../Entries/widgets/Matrix2dList';
import NumberMatrixListViewWidget from '../../Entries/widgets/NumberMatrixList';
// list
import DateViewWidget from '../../Entries/widgets/Date';
import DateRangeViewWidget from '../../Entries/widgets/DateRange';
import GeoViewWidget from '../../Entries/widgets/Geo';
import MultiSelectViewWidget from '../../Entries/widgets/MultiSelect';
import NumberViewWidget from '../../Entries/widgets/Number';
import OrganigramViewWidget from '../../Entries/widgets/Organigram';
import ScaleViewWidget from '../../Entries/widgets/Scale';
import SelectViewWidget from '../../Entries/widgets/Select';
import TimeViewWidget from '../../Entries/widgets/Time';

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
    show: 'show',
    readonly: 'readonly',
    hidden: 'hidden',
};

// Decorator for each widgets
const boundWidgetError = boundError(FrameworkWidgetError);
const decorator = Component => boundWidgetError(Component);

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
            minSize: { w: 15, h: 6 },
        },
        list: {
            component: Matrix1dListWidget,
            viewComponent: Matrix1dListViewWidget,
            minSize: { w: 12, h: 12 },
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
            minSize: { w: 15, h: 6 },
        },
    },
    numberMatrixWidget: {
        // NOTE: used as _ts('widgetTitle', 'numberMatrixWidgetLabel')
        title: 'numberMatrixWidgetLabel',
        editComponent: NumberMatrixEditWidget,

        overview: {
            component: NumberMatrixWidget,
            minSize: { w: 15, h: 6 },
        },
        list: {
            component: NumberMatrixListWidget,
            viewComponent: NumberMatrixListViewWidget,
            minSize: { w: 15, h: 6 },
        },
    },


    dateRangeWidget: {
        // NOTE: used as _ts('widgetTitle', 'dateRangeWidgetLabel')
        title: 'dateRangeWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            component: DateRangeWidget,
            viewComponent: DateRangeViewWidget,
            minSize: { w: 26, h: 3 },
        },
        list: {
            component: DateRangeWidget,
            viewComponent: DateRangeViewWidget,
            minSize: { w: 26, h: 3 },
        },
    },
    dateWidget: {
        // NOTE: used as _ts('widgetTitle', 'dateWidgetLabel')
        title: 'dateWidgetLabel',
        editComponent: DateEditWidget,

        overview: {
            component: DateWidget,
            viewComponent: DateViewWidget,
            minSize: { w: 13, h: 3 },
        },
        list: {
            component: DateWidget,
            viewComponent: DateViewWidget,
            minSize: { w: 13, h: 3 },
        },
    },
    timeWidget: {
        // NOTE: used as _ts('widgetTitle', 'timeWidgetLabel')
        title: 'timeWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            component: TimeWidget,
            viewComponent: TimeViewWidget,
            minSize: { w: 13, h: 3 },
        },
        list: {
            component: TimeWidget,
            viewComponent: TimeViewWidget,
            minSize: { w: 13, h: 3 },
        },
    },
    geoWidget: {
        // NOTE: used as _ts('widgetTitle', 'geoWidgetLabel')
        title: 'geoWidgetLabel',
        editComponent: DefaultEditWidget,

        overview: {
            component: GeoWidget,
            viewComponent: GeoViewWidget,
            minSize: { w: 15, h: 6 },
        },
        list: {
            component: GeoWidget,
            viewComponent: GeoViewWidget,
            minSize: { w: 15, h: 6 },
        },
    },
    multiselectWidget: {
        // NOTE: used as _ts('widgetTitle', 'multiselectWidgetLabel')
        title: 'multiselectWidgetLabel',
        editComponent: MultiSelectEditWidget,

        overview: {
            component: MultiSelectWidget,
            viewComponent: MultiSelectViewWidget,
            minSize: { w: 7, h: 15 },
        },
        list: {
            component: MultiSelectWidget,
            viewComponent: MultiSelectViewWidget,
            minSize: { w: 7, h: 15 },
        },
    },
    numberWidget: {
        // NOTE: used as _ts('widgetTitle', 'numberWidgetLabel')
        title: 'numberWidgetLabel',
        editComponent: NumberEditWidget,

        overview: {
            component: NumberWidget,
            viewComponent: NumberViewWidget,
            minSize: { w: 10, h: 3 },
        },
        list: {
            component: NumberWidget,
            viewComponent: NumberViewWidget,
            minSize: { w: 10, h: 3 },
        },
    },
    organigramWidget: {
        // NOTE: used as _ts('widgetTitle', 'organigramWidgetLabel')
        title: 'organigramWidgetLabel',
        editComponent: OrganigramEditWidget,

        overview: {
            component: OrganigramWidget,
            viewComponent: OrganigramViewWidget,
            minSize: { w: 10, h: 12 },
        },
        list: {
            component: OrganigramWidget,
            viewComponent: OrganigramViewWidget,
            minSize: { w: 10, h: 12 },
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
    selectWidget: {
        // NOTE: used as _ts('widgetTitle', 'selectWidgetLabel')
        title: 'selectWidgetLabel',
        editComponent: MultiSelectEditWidget,

        overview: {
            component: SelectWidget,
            viewComponent: SelectViewWidget,
            minSize: { w: 12, h: 3 },
        },
        list: {
            component: SelectWidget,
            viewComponent: SelectViewWidget,
            minSize: { w: 12, h: 3 },
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
            editComponent: { $set: decorator(editComponent) },
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
export const widgetVisibility = (widgetId, ...otherParams) => {
    const overviewWidgetFn = () => VISIBILITY.show;
    const listWidgetFn = (view, addedFrom) => {
        if (addedFrom === VIEW.list) {
            return view === VIEW.list ? VISIBILITY.show : VISIBILITY.readonly;
        } else if (addedFrom === VIEW.overview) {
            return view === VIEW.overview ? VISIBILITY.show : VISIBILITY.hidden;
        } else if (addedFrom === undefined) {
            return view === VIEW.overview ? VISIBILITY.hidden : VISIBILITY.show;
        }
        console.error('Unknown view or addedFrom defined.');
        return VISIBILITY.hidden;
    };
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

// Access widgets

export const fetchWidget = (type, widgetId) => (
    widgets[widgetId] && widgets[widgetId][type]
);

export const hasWidget = (type, widgetId) => !!fetchWidget(type, widgetId);
