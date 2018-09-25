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
    test: ({ value }, { selection }) => {
        if (Array.isArray(value)) {
            return value.indexOf(selection) >= 0;
        }
        return value === selection;
    },
};

export default {
    isSelected,
};
