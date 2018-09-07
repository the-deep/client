import { mapToList } from '#rsu/common';

import matrix1dConditions from './matrix1d';
import numberConditions from './number';

const emptyObject = {};

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
const conditionsAsMap = {
    matrix1dWidget: matrix1dConditions,
    numberWidget: numberConditions,
};

// Conditions As List
export const conditions = Object.keys(conditionsAsMap).reduce(
    (acc, widgetId) => ({
        ...acc,
        [widgetId]: mapToList(
            conditionsAsMap[widgetId],
            (condition, key) => ({ key, ...condition }),
        ),
    }),
    {},
);


const checkConditions = (widgetConditions, globalWidgets, entryAttributes) => {
    const { operator, list: conditionList } = widgetConditions;

    if (conditionList.length <= 0) {
        return false;
    }

    for (let i = 0; i < conditionList.length; i += 1) {
        const {
            widgetId,
            widgetKey,
            conditionType,
            attributes: conditionAttributes,
        } = conditionList[i];

        const widgetToCheck = globalWidgets.find(w => w.key === widgetKey);
        const attributes = entryAttributes[widgetToCheck.id] || emptyObject;

        const evaluator = conditionsAsMap[widgetId][conditionType].test;
        const evaluation = evaluator && evaluator(
            attributes.data || emptyObject,
            conditionAttributes || emptyObject,
        );

        if (operator === 'AND' && !evaluation) {
            return false;
        }
        if (operator === 'OR' && evaluation) {
            return true;
        }
    }

    return operator === 'AND';
};

export const resolveWidget = (widgets, globalWidgets, entryAttributes) => {
    const widget = widgets.find(w => checkConditions(
        w.conditions,
        globalWidgets,
        entryAttributes,
    ));
    return widget && widget.widget.key;
};
