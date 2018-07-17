import { FrameworkListWidget } from './Framework';

const timeWidget = {
    id: 'timeWidget',
    // NOTE: used as _ts('widgetTitle', 'timeWidgetLabel')
    title: 'timeWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { w: 13, h: 3 },
    },
};

export default timeWidget;
