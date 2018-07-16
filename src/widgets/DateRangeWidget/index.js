import { FrameworkListWidget } from './Framework';

const dateWidget = {
    id: 'dateRangeWidget',
    // NOTE: used as _ts('widgetTitle', 'dateRangeWidgetLabel')
    title: 'dateRangeWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { w: 26, h: 3 },
    },
};

export default dateWidget;
