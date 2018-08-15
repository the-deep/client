import { mapToList } from '#rsu/common';

import matrix1dConditions from './matrix1d';
import numberConditions from './number';

// Widgets that can be used in the
// ConditionalWidget
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


// Conditions for all widgets that support
// conditions.
export const conditions = {
    matrix1dWidget: matrix1dConditions,
    numberWidget: numberConditions,
};
