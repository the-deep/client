import testMultiSelect from './testMultiSelect';

const emptyArray = [];

const getSelectionOptions = ({ options } = {}) => (
    options || emptyArray
);

const isSelected = {
    title: 'Is selected',
    attributes: [{
        key: 'selections',
        type: 'multiselect',
        title: 'Selection',
        options: getSelectionOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: ({ value }, { selections }) => testMultiSelect(
        (selection) => {
            if (Array.isArray(value)) {
                return value.indexOf(selection) >= 0;
            }
            return value === selection;
        },
        selections,
    ),
};

export default {
    isSelected,
};
