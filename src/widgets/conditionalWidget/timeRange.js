import { compareTime } from '#utils/common';

const includes = {
    title: 'Includes',
    attributes: [{
        key: 'value',
        type: 'time',
        title: 'includes',
    }],
    test: ({ fromValue, toValue }, { value: attrValue }) => (
        compareTime(attrValue, fromValue) >= 0 &&
        compareTime(attrValue, toValue) <= 0
    ),
};

const after = {
    title: 'After',
    attributes: [{
        key: 'value',
        type: 'time',
        title: 'After time',
    }],
    test: ({ fromValue, toValue }, { value: attrValue }) => (
        compareTime(attrValue, fromValue) < 0 &&
        compareTime(attrValue, toValue) < 0
    ),
};

const before = {
    title: 'Before',
    attributes: [{
        key: 'value',
        type: 'time',
        title: 'Before time',
    }],
    test: ({ fromValue, toValue }, { value: attrValue }) => (
        compareTime(attrValue, fromValue) > 0 &&
        compareTime(attrValue, toValue) > 0
    ),
};

export default {
    includes,
    after,
    before,
};
