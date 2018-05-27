import {
    FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';
import {
    TaggingOverviewWidget,
    TaggingListWidget,
} from './Tagging';
import { ViewListWidget } from './View';
import entryUpdater from './entryUpdater';


const matrix2dWidget = {
    id: 'matrix2dWidget',
    // NOTE: used as _ts('widgetTitle', 'matrix2DWidgetLabel')
    title: 'matrix2DWidgetLabel',
    analysisFramework: {
        overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        overviewMinSize: { width: 240, height: 108 },
        listMinSize: { width: 240, height: 108 },
    },
    tagging: {
        overviewComponent: TaggingOverviewWidget,
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
    entryUpdater,
};

export default matrix2dWidget;
