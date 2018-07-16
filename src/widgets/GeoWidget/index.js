import { FrameworkListWidget } from './Framework';

const geoWidget = {
    id: 'geoWidget',
    // NOTE: used as _ts('widgetTitle', 'geoWidgetLabel')
    title: 'geoWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { w: 20, h: 12 },
    },
};

export default geoWidget;
