import { mapToList } from '#rsu/common';

import matrix1dConditions from './matrix1d';
import matrix2dConditions from './matrix2d';
import numberConditions from './number';
import scaleConditions from './scale';
import selectConditions from './select';
import dateConditions from './date';
import timeConditions from './time';
import organigramConditions from './organigram';
import numberMatrixConditions from './numberMatrix';
import geoOptions from './geo';

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

export const compatibleWidgetIds = Object.keys(widgetTitles);

export const widgetList = mapToList(
    widgetTitles,
    (title, widgetId) => ({
        widgetId,
        title,
    }),
);


// Conditions for all widgets that support
// conditions.
export const conditionsAsMap = {
    matrix1dWidget: matrix1dConditions,
    matrix2dWidget: matrix2dConditions,
    numberWidget: numberConditions,
    scaleWidget: scaleConditions,
    selectWidget: selectConditions,
    multiselectWidget: selectConditions,
    dateWidget: dateConditions,
    timeWidget: timeConditions,
    organigramWidget: organigramConditions,
    numberMatrixWidget: numberMatrixConditions,
    geoWidget: geoOptions,
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
    const { operator = 'AND', list: conditionList } = widgetConditions;

    if (conditionList.length <= 0) {
        return false;
    }

    let onceTrue = false;
    for (let i = 0; i < conditionList.length; i += 1) {
        const {
            widgetId,
            widgetKey,
            conditionType,
            attributes: conditionAttributes,
            invertLogic,
        } = conditionList[i];

        const widgetToCheck = globalWidgets.find(w => w.key === widgetKey);
        const attributes = entryAttributes[widgetToCheck.id] || emptyObject;
        const { properties: { data: widgetData } = {} } = widgetToCheck;

        const evaluator = conditionsAsMap[widgetId][conditionType].test;
        let evaluation = evaluator && evaluator(
            attributes.data || emptyObject,
            conditionAttributes || emptyObject,
            widgetData || emptyObject,
        );

        if (invertLogic) {
            evaluation = !evaluation;
        }

        if (operator === 'AND' && !evaluation) {
            return false;
        }
        if (operator === 'OR' && evaluation) {
            return true;
        }
        if (operator === 'XOR' && evaluation) {
            if (!onceTrue) {
                onceTrue = true;
            } else {
                return false;
            }
        }
    }

    return (
        (operator === 'XOR' && onceTrue) ||
        (operator === 'AND')
    );
};

export const resolveWidget = (widgets = [], globalWidgets, entryAttributes) => {
    const widget = widgets.find(w => checkConditions(
        w.conditions,
        globalWidgets,
        entryAttributes,
    ));
    return widget && widget.widget.key;
};
