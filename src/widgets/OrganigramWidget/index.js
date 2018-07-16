import { FrameworkListWidget } from './Framework';

const multiselectWidget = {
    id: 'organigramWidget',
    // NOTE: used as _ts('widgetTitle', 'organigramWidgetLabel')
    title: 'organigramWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { w: 10, h: 12 },
    },
};

export default multiselectWidget;
