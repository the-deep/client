const getComputeSchemaForWidget = (widget) => {
    // Each schema is a function of format:
    // (attributes, widget, data, value) => newValue

    const { properties: { data: widgetData = {} } = {} } = widget;
    switch (widget.widgetId) {
        case 'scaleWidget': {
            const { defaultScaleUnit } = widgetData;
            return defaultScaleUnit && (
                (a, w, d, v) => (v || defaultScaleUnit)
            );
        }
        default:
            return undefined;
    }
};

export default getComputeSchemaForWidget;
