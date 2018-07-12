import { FrameworkListWidget } from './Framework';

const dateWidget = {
    id: 'dateRangeWidget',
    // NOTE: used as _ts('widgetTitle', 'dateRangeWidgetLabel')
    title: 'dateRangeWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 416, height: 48 },
    },
};

export default dateWidget;
