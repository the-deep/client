import { listToMap } from '@togglecorp/fujs';

export const widgetGroups = {
    // NOTE: misc is a special kind of widgetGroup (should always be defined)
    misc: {
        // NOTE: used as _ts('widgetGroupTitle', 'miscGroupLabel')
        title: 'miscGroupLabel',
        order: 5,
    },

    excerpts: {
        // NOTE: used as _ts('widgetGroupTitle', 'excerptsGroupLabel')
        title: 'excerptsGroupLabel',
        order: 1,
    },
    matrices: {
        // NOTE: used as _ts('widgetGroupTitle', 'matricesGroupLabel')
        title: 'matricesGroupLabel',
        order: 2,
    },
    temporals: {
        // NOTE: used as _ts('widgetGroupTitle', 'temporalsGroupLabel')
        title: 'temporalsGroupLabel',
        order: 3,
    },
    selections: {
        // NOTE: used as _ts('widgetGroupTitle', 'selectionsGroupLabel')
        title: 'selectionsGroupLabel',
        order: 4,
    },
    conditionals: {
        // NOTE: used as _ts('widgetGroupTitle', 'conditionalsGroupLabel')
        title: 'conditionalsGroupLabel',
        order: 6,
    },
};

export const widgetTitlesGroupMap = {
    excerptWidget: {
        // NOTE: used as _ts('widgetTitle', 'excerptWidgetLabel')
        title: 'excerptWidgetLabel',
        groupId: 'excerpts',
        hasConditions: false,
    },
    matrix1dWidget: {
        // NOTE: used as _ts('widgetTitle', 'matrix1DWidgetLabel')
        title: 'matrix1DWidgetLabel',
        groupId: 'matrices',
        hasConditions: true,
    },
    matrix2dWidget: {
        // NOTE: used as _ts('widgetTitle', 'matrix2DWidgetLabel')
        title: 'matrix2DWidgetLabel',
        groupId: 'matrices',
        hasConditions: true,
    },
    numberMatrixWidget: {
        // NOTE: used as _ts('widgetTitle', 'numberMatrixWidgetLabel')
        title: 'numberMatrixWidgetLabel',
        groupId: 'matrices',
        hasConditions: true,
    },
    dateWidget: {
        // NOTE: used as _ts('widgetTitle', 'dateWidgetLabel')
        title: 'dateWidgetLabel',
        groupId: 'temporals',
        hasConditions: true,
    },
    timeWidget: {
        // NOTE: used as _ts('widgetTitle', 'timeWidgetLabel')
        title: 'timeWidgetLabel',
        groupId: 'temporals',
        hasConditions: true,
    },
    dateRangeWidget: {
        // NOTE: used as _ts('widgetTitle', 'dateRangeWidgetLabel')
        title: 'dateRangeWidgetLabel',
        groupId: 'temporals',
        hasConditions: true,
    },
    timeRangeWidget: {
        // NOTE: used as _ts('widgetTitle', 'timeRangeWidgetLabel')
        title: 'timeRangeWidgetLabel',
        groupId: 'temporals',
        hasConditions: true,
    },
    numberWidget: {
        // NOTE: used as _ts('widgetTitle', 'numberWidgetLabel')
        title: 'numberWidgetLabel',
        groupId: 'misc',
        hasConditions: true,
    },
    scaleWidget: {
        // NOTE: used as _ts('widgetTitle', 'scaleWidgetLabel')
        title: 'scaleWidgetLabel',
        groupId: 'misc',
        hasConditions: true,
    },
    geoWidget: {
        // NOTE: used as _ts('widgetTitle', 'geoWidgetLabel')
        title: 'geoWidgetLabel',
        groupId: 'misc',
        hasConditions: true,
    },
    organigramWidget: {
        // NOTE: used as _ts('widgetTitle', 'organigramWidgetLabel')
        title: 'organigramWidgetLabel',
        groupId: 'misc',
        hasConditions: true,
    },
    selectWidget: {
        // NOTE: used as _ts('widgetTitle', 'selectWidgetLabel')
        title: 'selectWidgetLabel',
        groupId: 'selections',
        hasConditions: true,
    },
    multiselectWidget: {
        // NOTE: used as _ts('widgetTitle', 'multiselectWidgetLabel')
        title: 'multiselectWidgetLabel',
        groupId: 'selections',
        hasConditions: true,
    },
    conditionalWidget: {
        // NOTE: used as _ts('widgetTitle', 'conditionalWidgetLabel')
        title: 'conditionalWidgetLabel',
        groupId: 'conditionals',
        hasConditions: false,
    },
};

export const widgetTitlesGroupMapForConditional = listToMap(
    Object.keys(widgetTitlesGroupMap)
        .filter(key => widgetTitlesGroupMap[key].hasConditions),
    itemKey => itemKey,
    itemKey => widgetTitlesGroupMap[itemKey],
);
