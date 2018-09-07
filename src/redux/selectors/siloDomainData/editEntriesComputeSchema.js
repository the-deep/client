import memoize from 'memoize-one';

const getComputeSchemaForWidget = (widget) => {
    // Each schema is a function of format:
    // (attributes, widget, data, value) => newValue

    // const { properties: { data: widgetData = {} } = {} } = widget;
    switch (widget.widgetId) {
        case 'conditionalWidget':
            return (a, w, d, v = {}) => {
                // value is already an object but has keys of format
                // `widgetId-randomString` which will never be
                // `selectedWidgetKey`.
                const selectedWidgetKey = 'matrix2dWidget-44uaiyenikgg9ghm';

                // Note: do not create new value unless required.
                if (v.selectedWidgetKey === selectedWidgetKey) {
                    return v;
                }

                return {
                    ...v,
                    selectedWidgetKey,
                };
            };
        default:
            return undefined;
    }
};

export default getComputeSchemaForWidget;
