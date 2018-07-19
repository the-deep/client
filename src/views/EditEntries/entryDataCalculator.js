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

const calculateEntryData = (values = {}, analysisFramework) => {
    let color;

    Object.keys(values).forEach((widgetId) => {
        if (color) {
            return;
        }

        const widget = analysisFramework.widgets.find(w => String(w.id) === widgetId);
        const attributeValue = values[widgetId].data.value;
        const widgetData = widget.properties.data;

        if (!attributeValue || !widgetData) {
            return;
        }

        if (widget.widgetId === 'matrix1dWidget') {
            color = calculateMatrix1dColor(attributeValue, widgetData);
        } else if (widget.widgetId === 'matrix2dWidget') {
            color = calculateMatrix2dColor(attributeValue, widgetData);
        }
    });

    return { color };
};

export default calculateEntryData;
