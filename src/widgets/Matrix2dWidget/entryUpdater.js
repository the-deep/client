const emptyObject = {};

const createHighlightColor = (attribute, data) => {
    const selectedKey = Object.keys(attribute || emptyObject).find(d => (
        Object.keys(attribute[d]).find(s => (
            Object.keys(attribute[d][s]).length > 0
        ))
    ));

    if (selectedKey) {
        const { dimensions } = data;
        const dimension = dimensions && dimensions.find(d => d.id === selectedKey);
        return dimension && dimension.color;
    }

    return undefined;
};

const entryUpdater = (modifier, id, attribute, data) => {
    if (!attribute || !data) {
        modifier.setHighlightColor(id, undefined);
        return;
    }

    modifier.setHighlightColor(id, createHighlightColor(attribute, data));
};

export default entryUpdater;
