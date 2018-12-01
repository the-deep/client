import _ts from '#ts';

const decodeTimeInMinutes = (value, separator = ':') => {
    if (!value) {
        return 0;
    }
    const values = value.split(separator);
    return ((+values[0] * 60) + values[1]);
};

const compareTime = (a, b) => (
    decodeTimeInMinutes(a) - decodeTimeInMinutes(b)
);

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
        ok: compareTime(minValue, maxValue) <= 0,
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
