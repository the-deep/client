import { mapToList } from '#rsu/common';

const widgetTitles = {
    matrix1dWidget: 'matrix1DWidgetLabel',
    matrix2dWidget: 'matrix2DWidgetLabel',
    numberMatrixWidget: 'numberMatrixWidgetLabel',
    dateWidget: 'dateWidgetLabel',
    timeWidget: 'timeWidgetLabel',
    dateRangeWidget: 'dateRangeWidgetLabel',
    numberWidget: 'numberWidgetLabel',
    scaleWidget: 'scaleWidgetLabel',
    geoWidget: 'geoWidgetLabel',
    organigramWidget: 'organigramWidgetLabel',
    selectWidget: 'selectWidgetLabel',
    multiselectWidget: 'multiselectWidgetLabel',
};

export const widgetList = mapToList(
    widgetTitles,
    (title, widgetId) => ({
        widgetId,
        title,
    }),
);

export const widgetConditions = {
};
