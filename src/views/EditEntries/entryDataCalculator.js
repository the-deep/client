import update from '#rsu/immutable-update';

const emptyObject = {};

const calculateMatrix1dColor = (value, widgetData) => {
    let color;
    Object.keys(value).forEach((rowId) => {
        if (color) {
            return;
        }

        const row = value[rowId];
        const selectedCol = Object.keys(row).find(c => row[c]);

        if (selectedCol) {
            ({ color } = (widgetData.rows.find(r => r.key === rowId) || emptyObject));
        }
    });
    return color;
};

const calculateMatrix2dColor = (value, widgetData) => {
    let color;
    Object.keys(value).forEach((rowId) => {
        if (color) {
            return;
        }

        const row = value[rowId];
        const selectedSubRow = Object.keys(row)
            .find(sr => Object.keys(row[sr])
                .find(c => row[sr][c]));

        if (selectedSubRow) {
            ({ color } = (widgetData.dimensions.find(r => r.id === rowId) || emptyObject));
        }
    });

    return color;
};

export const calculateEntryColor = (attributes = {}, analysisFramework) => {
    let color;

    Object.keys(attributes).forEach((widgetId) => {
        if (color) {
            return;
        }

        // Widget is undefined when analysis framwork has changed
        const widget = analysisFramework.widgets.find(
            w => String(w.id) === widgetId,
        );
        if (!widget) {
            return;
        }

        const {
            [widgetId]: {
                data: {
                    value: attributeValue,
                } = {},
            } = {},
        } = attributes;
        const widgetData = widget.properties.data;
        if (!attributeValue || !widgetData) {
            return;
        }

        switch (widget.widgetId) {
            case 'matrix1dWidget': {
                color = calculateMatrix1dColor(attributeValue, widgetData);
                break;
            }
            case 'matrix2dWidget': {
                color = calculateMatrix2dColor(attributeValue, widgetData);
                break;
            }
            default:
                break;
        }
    });

    return color;
};

export const calculateFirstTimeAttributes = (
    attributes = {},
    analysisFramework,
    lead,
) => analysisFramework.widgets.reduce(
    (acc, widget) => {
        // Ignore the attributes for widgets which are already set
        if (acc[widget.id]) {
            return acc;
        }

        const {
            widgetId,
            properties: {
                data: widgetData = {},
            } = {},
        } = widget;

        let value;

        // Calculate first time attribute for each widget
        if (widgetId === 'dateWidget') {
            if (widgetData.informationDateSelected) {
                value = lead.publishedOn;
            }
        } /* else if (widgetId === 'nextWidget') { ... } */

        if (value) {
            const settings = {
                [widget.id]: { $auto: {
                    data: { $auto: {
                        value: { $set: value },
                    } },
                } },
            };
            return update(acc, settings);
        }

        return acc;
    }, attributes,
);
