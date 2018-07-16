import {
    FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';

const matrix2dWidget = {
    id: 'matrix2dWidget',
    // NOTE: used as _ts('widgetTitle', 'matrix2DWidgetLabel')
    title: 'matrix2DWidgetLabel',
    analysisFramework: {
        overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        overviewMinSize: { w: 15, h: 6 },
        listMinSize: { w: 15, h: 6 },
    },
};

export default matrix2dWidget;
