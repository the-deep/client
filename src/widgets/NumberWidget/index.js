import { FrameworkListWidget } from './Framework';

const numberWidget = {
    id: 'numberWidget',
    // NOTE: used as _ts('widgetTitle', 'numberWidgetLabel')
    title: 'numberWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { w: 10, h: 3 },
    },
};

export default numberWidget;
