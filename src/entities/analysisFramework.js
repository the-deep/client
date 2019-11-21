// eslint-disable-next-line import/prefer-default-export
export const getAllWidgets = (widgets = []) => {
    const conditionalWidgets = widgets.filter(widget => widget.widgetId === 'conditionalWidget');

    const values = conditionalWidgets.map((conditional) => {
        const {
            properties: { data: { widgets: widgetsInsideConditional = [] } = {} } = {},
        } = conditional;

        const widgetsWithId = widgetsInsideConditional.map(({ widget }) => (
            {
                id: widget.key,
                ...widget,
                title: `${conditional.title} › ${widget.title}`,
                isConditional: true,
                conditionalId: conditional.id,
            }
        ));

        return widgetsWithId;
    }).reduce((acc, widget) => acc.concat(widget), []);

    const newWidgets = [...widgets, ...values];

    return newWidgets;
};
