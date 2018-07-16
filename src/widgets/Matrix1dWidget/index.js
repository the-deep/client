import {
    FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';

const excerptWidget = {
    id: 'matrix1dWidget',
    // NOTE: used as _ts('widgetTitle', 'matrix1DWidgetLabel')
    title: 'matrix1DWidgetLabel',
    analysisFramework: {
        overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        overviewMinSize: { w: 15, h: 6 },
        listMinSize: { w: 12, h: 12 },
    },
};

export default excerptWidget;
