const emptyObject = {};

const createHighlightColor = (attribute, { rows }) => {
    let color;
    Object.keys(attribute || emptyObject).forEach((key) => {
        const row = attribute[key];

        const rowExists = Object.keys(row).reduce((acc, k) => acc || row[k], false);
        if (rowExists) {
            color = rows.find(d => d.key === key).color; // eslint-disable-line prefer-destructuring
        }
    });

    return color;
};

const entryUpdater = (modifier, id, attribute, data) => {
    if (!attribute || !data) {
        modifier.setHighlightColor(id, undefined);
        return;
    }

    modifier.setHighlightColor(id, createHighlightColor(attribute, data));
};

export default entryUpdater;
