const isSelected = {
    title: 'Is selected',
    attributes: [{
        key: 'selections',
        type: 'geo',
        title: 'Selection',
    }],
    test: ({ value = [] }, { selections = [] }) => (
        selections.some(selection => (
            value.indexOf(selection) !== -1
        ))
    ),
};

export default {
    isSelected,
};
