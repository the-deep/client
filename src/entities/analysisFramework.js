// eslint-disable-next-line import/prefer-default-export
export const getAllWidgets = (widgets = []) => {
    const conditionalWidgets = widgets.filter(widget => widget.widgetId === 'conditionalWidget');

    const values = conditionalWidgets.map((conditional) => {
        const {
            properties: { data: { widgets: widgetsInsideConditional = [] } = {} } = {},
        } = conditional;

        const widgetsWithId = widgetsInsideConditional.map(({ widget }, index) => (
            {
                id: `${conditional.id}-${index}`,
                ...widget,
                title: `${conditional.title} > ${widget.title}`,
                isConditional: true,
                conditionalId: conditional.id,
                widgetIndex: index,
            }
        ));

        return widgetsWithId;
    });

    const newWidgets = [...widgets, ...values.flat(2)];

    return newWidgets;
};
