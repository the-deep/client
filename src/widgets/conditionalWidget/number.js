import { mapToList } from '#rsu/common';

const isLessThan = {
    title: 'Is less than',
    attributes: [{
        key: 'value',
        title: 'Value',
        type: 'number',
    }],
};

const isGreaterThan = {
    title: 'Is greater than',
    attributes: [{
        key: 'value',
        title: 'Value',
        type: 'number',
    }],
};

export default mapToList({
    isLessThan,
    isGreaterThan,
}, (condition, key) => ({ key, ...condition }));
