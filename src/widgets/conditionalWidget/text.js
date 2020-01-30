import {
    isTruthyString,
    caseInsensitiveSubmatch,
} from '@togglecorp/fujs';

const isFilled = {
    title: 'Is filled',
    attributes: [{
        key: 'value',
        title: 'Is filled',
        type: 'boolean',
    }],
    test: data => (
        isTruthyString(data.value)
    ),
};

const textContains = {
    title: 'Text Contains',
    attributes: [{
        key: 'textContains',
        title: 'Text Contains',
        type: 'text',
    }],
    test: ({ value }, { textContains: attrValue }) => (
        caseInsensitiveSubmatch(value, attrValue)
    ),
};

export default {
    isFilled,
    textContains,
};
