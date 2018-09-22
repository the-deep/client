const emptyArray = [];

const getSelectionOptions = ({ options } = {}) => (
    options || emptyArray
);

const isSelected = {
    title: 'Is selected',
    attributes: [{
        key: 'selection',
        type: 'select',
        title: 'Selection',
        options: getSelectionOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
};

export default {
    isSelected,
};
