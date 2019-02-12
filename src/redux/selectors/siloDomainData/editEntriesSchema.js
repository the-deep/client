import {
    dateCondition,
    timeCondition,
    inclusiveInBetweenCondition,
} from '#rscg/Faram';

import { decodeDate } from '@togglecorp/fujs';

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


export default getSchemaForWidget;
