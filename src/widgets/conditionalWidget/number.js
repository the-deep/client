import { mapToList } from '#rsu/common';

const isLessThan = {
    attributes: [{
        key: 'value',
        title: 'Value',
        type: 'number',
    }],
};

const isGreaterThan = {
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
