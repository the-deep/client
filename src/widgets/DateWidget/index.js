import { FrameworkListWidget } from './Framework';

const dateWidget = {
    id: 'dateWidget',
    // NOTE: used as _ts('widgetTitle', 'dateWidgetLabel')
    title: 'dateWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { w: 13, h: 3 },
    },
};

export default dateWidget;
