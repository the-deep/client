import { compareDate } from '@togglecorp/fujs';

const includes = {
    title: 'Includes',
    attributes: [{
        key: 'value',
        type: 'date',
        title: 'includes',
    }],
    test: ({ fromValue, toValue }, { value: attrValue }) => (
        compareDate(attrValue, fromValue) >= 0 &&
        compareDate(attrValue, toValue) <= 0
    ),
};

const after = {
    title: 'After',
    attributes: [{
        key: 'value',
        type: 'date',
        title: 'After date',
    }],
    test: ({ fromValue, toValue }, { value: attrValue }) => (
        compareDate(attrValue, fromValue) < 0 &&
        compareDate(attrValue, toValue) < 0
    ),
};

const before = {
    title: 'Before',
    attributes: [{
        key: 'value',
        type: 'date',
        title: 'Before date',
    }],
    test: ({ fromValue, toValue }, { value: attrValue }) => (
        compareDate(attrValue, fromValue) > 0 &&
        compareDate(attrValue, toValue) > 0
    ),
};

export default {
    includes,
    after,
    before,
};
