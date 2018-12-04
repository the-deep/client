import memoize from 'memoize-one';

import { widgetTitlesGroupMapForConditional as widgetTitles } from '#widgets/widgetMetadata';

import selectOptions from './select';
import scaleOptions from './scale';
import matrix1dOptions from './matrix1d';
import matrix2dOptions from './matrix2d';
import organigramOptions from './organigram';

const emptyArray = [];

export const supportedWidgets = {
    selectWidget: selectOptions,
    multiselectWidget: selectOptions,
    scaleWidget: scaleOptions,
    matrix1dWidget: matrix1dOptions,
    matrix2dWidget: matrix2dOptions,
    organigramWidget: organigramOptions,
};

export const getSupportedWidgets = memoize((widgets, widgetKey) => (
    widgets.filter(w => (
        supportedWidgets[w.widgetId] !== undefined && w.key !== widgetKey
    )).map(w => ({
        ...w,
        groupId: widgetTitles[w.widgetId].groupId,
    }))
));

export const getOptionsForSelectedWidget = memoize((selectedWidgetId, widgets) => {
    const selectedWidget = widgets.find(w => w.key === selectedWidgetId);
    if (selectedWidget) {
        return supportedWidgets[selectedWidget.widgetId];
    }
    return emptyArray;
});
