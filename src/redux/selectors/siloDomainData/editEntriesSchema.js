import {
    dateCondition,
    timeCondition,
    greaterThanOrEqualToCondition,
    lessThanOrEqualToCondition,
} from '#rsci/Faram';

import {
    isTruthy,
    decodeDate,
} from '#rsu/common';

const getSchemaForWidget = (widget) => {
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
                validation: ({ fromValue, toValue } = {}) => {
                    const errors = [];
                    if (fromValue && toValue && decodeDate(fromValue) > decodeDate(toValue)) {
                        // FIXME: use strings
                        errors.push('Invalid date range');
                    }
                    return errors;
                },
                fields: {
                    fromValue: [dateCondition],
                    toValue: [dateCondition],
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

            const validations = [];
            if (isTruthy(minValue)) {
                validations.push(greaterThanOrEqualToCondition(minValue));
            }
            if (isTruthy(maxValue)) {
                validations.push(lessThanOrEqualToCondition(maxValue));
            }
            return {
                fields: {
                    value: validations,
                },
            };
        }
        default:
            return [];
    }
};


export default getSchemaForWidget;
