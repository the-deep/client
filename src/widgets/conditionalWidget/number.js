import _ts from '#ts';
import { isFalsy } from '@togglecorp/fujs';

const isLessThan = {
    title: 'Is less than',
    attributes: [{
        key: 'value',
        title: 'Value',
        type: 'number',
    }],
    test: (data, attributes) => (
        data.value && data.value < attributes.value
    ),
};

const isGreaterThan = {
    title: 'Is greater than',
    attributes: [{
        key: 'value',
        title: 'Value',
        type: 'number',
    }],
    test: (data, attributes) => (
        data.value && data.value > attributes.value
    ),
};

const isEqualTo = {
    title: 'Is equal to',
    attributes: [{
        key: 'value',
        title: 'Value',
        type: 'number',
    }],
    test: (data, attributes) => (
        data.value && data.value === attributes.value
    ),
};

const isInBetween = {
    title: 'Is in between',
    attributes: [
        {
            key: 'minValue',
            type: 'number',
            title: 'Min',
        },
        {
            key: 'maxValue',
            type: 'number',
            title: 'Max',
        },
    ],
    validate: ({ minValue, maxValue }) => ({
        ok: isFalsy(minValue) || isFalsy(maxValue) || minValue <= maxValue,
        message: _ts('conditional.number', 'invalidRangeErrorMessage'),
    }),
    test: ({ value }, { minValue, maxValue }) => (
        value <= maxValue &&
        value >= minValue
    ),
};

export default {
    isLessThan,
    isGreaterThan,
    isEqualTo,
    isInBetween,
};
