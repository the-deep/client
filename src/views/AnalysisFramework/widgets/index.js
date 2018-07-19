import update from '#rsu/immutable-update';

import dateRangeWidget from './DateRangeWidget';
import dateWidget from './DateWidget';
import excerptWidget from './ExcerptWidget';
import geoWidget from './GeoWidget';
import matrix1dWidget from './Matrix1dWidget';
import matrix2dWidget from './Matrix2dWidget';
import multiselectWidget from './MultiselectWidget';
import numberMatrixWidget from './NumberMatrixWidget';
import numberWidget from './NumberWidget';
import organigramWidget from './OrganigramWidget';
import scaleWidget from './ScaleWidget';
import selectWidget from './SelectWidget';
import timeWidget from './TimeWidget';

const changeWidgetUnit = (widget) => {
    const mapper = (minSize) => {
        if (!minSize) {
            return undefined;
        }
        return {
            width: 16 * minSize.w,
            height: 16 * minSize.h,
        };
    };

    const settings = {
        analysisFramework: {
            listMinSize: { $apply: mapper },
            overviewMinSize: { $apply: mapper },
        },
    };

    return update(widget, settings);
};


// NOTE: Using list to maintain ordering
const widgetStore = [
    excerptWidget,
    matrix1dWidget,
    matrix2dWidget,
    numberMatrixWidget,
    dateWidget,
    dateRangeWidget,
    timeWidget,
    numberWidget,
    selectWidget,
    multiselectWidget,
    scaleWidget,
    organigramWidget,
    geoWidget,
].map(changeWidgetUnit);

export default widgetStore;
