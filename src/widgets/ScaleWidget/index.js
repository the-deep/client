import { FrameworkListWidget } from './Framework';

const scaleWidget = {
    id: 'scaleWidget',
    // NOTE: used as _ts('widgetTitle', 'scaleWidgetLabel')
    title: 'scaleWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { w: 6, h: 4 },
    },
};

export default scaleWidget;
