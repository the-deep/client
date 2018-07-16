import {
    FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';

const excerptTextWidget = {
    id: 'excerptWidget',
    // NOTE: used as _ts('widgetTitle', 'excerptWidgetLabel')
    title: 'excerptWidgetLabel',
    analysisFramework: {
        overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        overviewMinSize: { w: 15, h: 6 },
        listMinSize: { w: 15, h: 6 },
    },
};

export default excerptTextWidget;
