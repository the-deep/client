// eslint-disable-next-line import/prefer-default-export
export const getAllWidgets = (widgets = []) => {
    const conditionalWidget = widgets.filter(widget => widget.widgetId === 'conditionalWidget');

    const values = conditionalWidget.map((conditionals, conditionalId) => {
        const {
            properties: { data: { widgets: conditionalWidgets = [] } = {} } = {},
        } = conditionals;
        const widgetsWithId = conditionalWidgets.map(({ widget }, index) => (
            {
                id: `${conditionalId}-${index}`,
                ...widget,
                isConditional: true,
                conditionalId,
                widgetIndex: index,
            }
        ));

        return widgetsWithId;
    });

    const newWidgets = [...widgets, ...values.flat(2)];

    return newWidgets;
};
