import excerptWidget from './ExcerptWidget';
import matrix1dWidget from './Matrix1dWidget';
import matrix2dWidget from './Matrix2dWidget';
import dateWidget from './DateWidget';
import numberWidget from './NumberWidget';
import multiselectWidget from './MultiselectWidget';
import scaleWidget from './ScaleWidget';
import organigramWidget from './OrganigramWidget';
import numberMatrixWidget from './NumberMatrixWidget';
import geoWidget from './GeoWidget';

// Using list to maintain ordering
const widgetStore = [
    excerptWidget,
    matrix1dWidget,
    matrix2dWidget,
    numberMatrixWidget,
    dateWidget,
    numberWidget,
    multiselectWidget,
    scaleWidget,
    organigramWidget,
    geoWidget,
];

export default widgetStore;

export const entryUpdater = (widget, modifier, entry, analysisFramework) => {
    if (!widget.entryUpdater || !analysisFramework.widgets) {
        return;
    }

    const widgets = analysisFramework.widgets.filter(
        w => w.widgetId === widget.id,
    );
    const attributes = entry.widget.values.attributes.reduce(
        (acc, a) => {
            acc[a.widget] = a;
            return acc;
        },
        {},
    );

    widgets.forEach((w) => {
        const attr = attributes[w.id];
        const attribute = attr && attr.data;
        const { data } = w.properties;

        widget.entryUpdater(modifier, w.id, attribute, data);
    });
};
