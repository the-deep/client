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

export default {
    isLessThan,
    isGreaterThan,
    isEqualTo,
};
