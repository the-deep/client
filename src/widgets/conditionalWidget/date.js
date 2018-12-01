import _ts from '#ts';
import { compareDate } from '#rsu/common';

const isEqualTo = {
    title: 'Is equal to',
    attributes: [{
        key: 'value',
        type: 'date',
        title: 'Is equal to',
    }],
    test: ({ value }, { value: attrValue }) => (
        compareDate(value, attrValue) === 0
    ),
};

const after = {
    title: 'After',
    attributes: [{
        key: 'value',
        type: 'date',
        title: 'After date',
    }],
    test: ({ value }, { value: attrValue }) => (
        compareDate(value, attrValue) > 0
    ),
};

const before = {
    title: 'Before',
    attributes: [{
        key: 'value',
        type: 'date',
        title: 'Before date',
    }],
    test: ({ value }, { value: attrValue }) => (
        compareDate(value, attrValue) < 0
    ),
};

const isInBetween = {
    title: 'Is in between',
    attributes: [
        {
            key: 'minValue',
            type: 'date',
            title: 'Min date',
        },
        {
            key: 'maxValue',
            type: 'date',
            title: 'Max date',
        },
    ],
    validate: ({ minValue, maxValue }) => ({
        ok: compareDate(minValue, maxValue) <= 0,
        message: _ts('conditional.date', 'invalidRangeErrorMessage'),
    }),
    test: ({ value }, { minValue, maxValue }) => (
        minValue && maxValue &&
        compareDate(value, maxValue) <= 0 &&
        compareDate(value, minValue) >= 0
    ),
};

export default {
    isEqualTo,
    after,
    before,
    isInBetween,
};
