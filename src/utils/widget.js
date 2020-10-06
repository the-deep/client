import { resolveWidget } from '#widgets/conditionalWidget';
import {
    dateCondition,
    timeCondition,
    inclusiveInBetweenCondition,
} from '@togglecorp/faram';
import { decodeDate } from '@togglecorp/fujs';

export const getComputeSchemaForWidget = (widget, globalWidgets) => {
    // Each schema is a function of format:
    // (attributes, widget, data, value) => newValue

    const { properties: { data: widgetData = {} } = {} } = widget;
    switch (widget.widgetId) {
        case 'conditionalWidget':
            return (attributes, w, d, v = {}) => {
                // value is already an object but has keys of format
                // `widgetId-randomString` which will never be
                // `selectedWidgetKey`.
                const selectedWidgetKey = resolveWidget(
                    widgetData.widgets,
                    globalWidgets,
                    attributes,
                ) || widgetData.defaultWidget;

                // Note: do not create new value unless required.
                if (v.selectedWidgetKey === selectedWidgetKey) {
                    return v;
                }

                return {
                    ...v,
                    selectedWidgetKey,
                };
            };
        default:
            return undefined;
    }
};


export const getSchemaForWidget = (widget) => {
    switch (widget.widgetId) {
        case 'dateWidget': {
            return {
                fields: {
                    value: [dateCondition],
                },
            };
        }
        case 'timeWidget': {
            return {
                fields: {
                    value: [timeCondition],
                },
            };
        }
        case 'dateRangeWidget': {
            return {
                fields: {
                    value: {
                        fields: {
                            from: [dateCondition],
                            to: [dateCondition],
                        },
                        validation: ({ from, to } = {}) => {
                            const errors = [];
                            if (from && to && decodeDate(from) > decodeDate(to)) {
                                // FIXME: use strings
                                errors.push('Invalid date range');
                            }
                            return errors;
                        },
                    },
                },
            };
        }
        case 'numberWidget': {
            const {
                properties: {
                    data: {
                        minValue,
                        maxValue,
                    } = {},
                } = {},
            } = widget;

            return {
                fields: {
                    value: [inclusiveInBetweenCondition(minValue, maxValue)],
                },
            };
        }
        default:
            return [];
    }
};


// Level one widgets can view excerpt information
export const levelOneWidgets = [
    'excerptWidget',
    'geoWidget',
    'organigramWidget',
    'conditionalWidget',
];

// Level two widgets can edit excerpt information
export const levelTwoWidgets = ['excerptWidget'];

export const droppableOverviewWidgets = {
    excerptWidget: true,
    matrix1dWidget: true,
    matrix2dWidget: true,
    textWidget: true,
};

export const droppableListWidgets = {
    excerptWidget: true,
};
