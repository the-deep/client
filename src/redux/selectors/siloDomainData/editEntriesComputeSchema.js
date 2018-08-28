const getComputeSchemaForWidget = (widget) => {
    // Each schema is a function of format:
    // (attributes, widget, data, value) => newValue

    // const { properties: { data: widgetData = {} } = {} } = widget;
    switch (widget.widgetId) {
        default:
            return undefined;
    }
};

export default getComputeSchemaForWidget;
