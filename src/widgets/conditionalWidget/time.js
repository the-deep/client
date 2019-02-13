import _ts from '#ts';
import { isFalsy } from '@togglecorp/fujs';
import { compareTime } from '#utils/common';

const isEqualTo = {
    title: 'Is equal to',
    attributes: [{
        key: 'value',
        type: 'time',
        title: 'Is equal to',
    }],
    test: ({ value }, { value: attrValue }) => (
        compareTime(value, attrValue) === 0
    ),
};

const after = {
    title: 'After',
    attributes: [{
        key: 'value',
        type: 'time',
        title: 'After',
    }],
    test: ({ value }, { value: attrValue }) => (
        compareTime(value, attrValue) > 0
    ),
};

const before = {
    title: 'Before',
    attributes: [{
        key: 'value',
        type: 'time',
        title: 'Before',
    }],
    test: ({ value }, { value: attrValue }) => (
        compareTime(value, attrValue) < 0
    ),
};

const isInBetween = {
    title: 'Is in between',
    attributes: [
        {
            key: 'minValue',
            type: 'time',
            title: 'Min time',
        },
        {
            key: 'maxValue',
            type: 'time',
            title: 'Max time',
        },
    ],
    validate: ({ minValue, maxValue }) => ({
        ok: isFalsy(minValue) || isFalsy(maxValue) || compareTime(minValue, maxValue) <= 0,
        message: _ts('conditional.time', 'invalidRangeErrorMessage'),
    }),
    test: ({ value }, { minValue, maxValue }) => (
        minValue && maxValue &&
        compareTime(value, maxValue) <= 0 &&
        compareTime(value, minValue) >= 0
    ),
};

export default {
    isEqualTo,
    after,
    before,
    isInBetween,
};
