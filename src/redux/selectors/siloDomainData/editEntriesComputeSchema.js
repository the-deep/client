const getComputeSchemaForWidget = (widget) => {
    // Each schema is a function of format:
    // (attributes, widget, data, value) => newValue

    const { properties: { data: widgetData = {} } = {} } = widget;
    switch (widget.widgetId) {
        default:
            // If we do not compute anything for the widget,
            // we return nothing/undefined
            // so that no compute schema is set.
            return undefined;
    }
};

export default getComputeSchemaForWidget;
