import selectOptions from './select';
import scaleOptions from './scale';
import matrix1dOptions from './matrix1d';
import matrix2dOptions from './matrix2d';
import organigramOptions from './organigram';

export const supportedWidgets = {
    selectWidget: selectOptions,
    multiselectWidget: selectOptions,
    scaleWidget: scaleOptions,
    matrix1dWidget: matrix1dOptions,
    matrix2dWidget: matrix2dOptions,
    organigramWidget: organigramOptions,
};

export const getSupportedWidgets = (widgets, widgetKey) => (
    widgets.filter(w => (
        supportedWidgets[w.widgetId] !== undefined && w.key !== widgetKey
    ))
);

export const getOptionsForSelectedWidget = (selectedWidgetId, widgets) => {
    const selectedWidget = widgets.find(w => w.key === selectedWidgetId);
    if (selectedWidget) {
        return supportedWidgets[selectedWidget.widgetId];
    }
    return [];
};
