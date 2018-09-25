const emptyArray = [];

const getOptionsForRow = (widgetData = {}) => (
    widgetData.rowHeaders || emptyArray
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
};

export default {
    sameValuesInRow,
};
