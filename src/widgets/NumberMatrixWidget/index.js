import {
    FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';

const numberMatrixWidget = {
    id: 'numberMatrixWidget',
    // NOTE: used as _ts('widgetTitle', 'numberMatrixWidgetLabel')
    title: 'numberMatrixWidgetLabel',
    analysisFramework: {
        overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        overviewMinSize: { w: 15, h: 6 },
        listMinSize: { w: 15, h: 6 },
    },
};

export default numberMatrixWidget;
