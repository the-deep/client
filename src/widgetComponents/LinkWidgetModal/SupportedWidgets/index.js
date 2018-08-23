import selectOptions from './select';
import scaleOptions from './scale';
import matrix1dOptions from './matrix1d';

export const supportedWidgets = {
    selectWidget: selectOptions,
    multiselectWidget: selectOptions,
    scaleWidget: scaleOptions,
    matrix1dWidget: matrix1dOptions,
};

export const getSupportedWidgets = widgets => (
    widgets.filter(w => supportedWidgets[w.widgetId] !== undefined)
);

export const getOptionsForSelectedWidget = (selectedWidgetId, widgets) => {
    const selectedWidget = widgets.find(w => w.key === selectedWidgetId);
    if (selectedWidget) {
        return supportedWidgets[selectedWidget.widgetId];
    }
    return [];
};
