import {
    FrameworkListWidget,
} from './Framework';

const multiselectWidget = {
    id: 'multiselectWidget',
    // NOTE: used as _ts('widgetTitle', 'multiselectWidgetLabel')
    title: 'multiselectWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { w: 120, h: 15 },
    },
};

export default multiselectWidget;
