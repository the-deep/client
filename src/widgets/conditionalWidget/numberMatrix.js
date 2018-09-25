import {
    unique,
    isTruthy,
} from '#rsu/common';

const emptyArray = [];
const emptyObject = {};

const getOptionsForRow = (widgetData = {}) => (
    widgetData.rowHeaders || emptyArray
);

const getOptionsForColumn = (widgetData = {}) => (
    widgetData.columnHeaders || emptyArray
);

const sameValuesInRow = {
    title: 'Same values in row',
    attributes: [{
        key: 'row',
        title: 'Value',
        type: 'select',
        options: getOptionsForRow,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} }, { row }, { columnHeaders = [] }) => {
        const values = Object.values(value[row] || emptyObject).filter(v => isTruthy(v));
        return columnHeaders.length === values.length && unique(values).length === 1;
    },
};

const differentValuesInRow = {
    title: 'Different values in row',
    attributes: [{
        key: 'row',
        title: 'Value',
        type: 'select',
        options: getOptionsForRow,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} }, { row }, { columnHeaders = [] }) => {
        const values = Object.values(value[row] || emptyObject).filter(v => isTruthy(v));
        return columnHeaders.length === values.length && unique(values).length > 1;
    },
};

const hasValue = {
    title: 'Has value',
    attributes: [
        {
            key: 'row',
            title: 'Row',
            type: 'select',
            options: getOptionsForRow,
            keySelector: d => d.key,
            labelSelector: d => d.title,
        },
        {
            key: 'column',
            title: 'Column',
            type: 'select',
            options: getOptionsForColumn,
            keySelector: d => d.key,
            labelSelector: d => d.title,
        },
        {
            key: 'value',
            title: 'Value',
            type: 'number',
        },
    ],
    test: ({ value = {} }, { row, column, value: selectedNumber }) => (
        (value[row] || emptyObject)[column] === selectedNumber
    ),
};

export default {
    sameValuesInRow,
    differentValuesInRow,
    hasValue,
};
