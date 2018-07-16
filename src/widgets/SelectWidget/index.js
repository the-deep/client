import {
    FrameworkListWidget,
} from './Framework';

const selectWidget = {
    id: 'selectWidget',
    // NOTE: used as _ts('widgetTitle', 'selectWidgetLabel')
    title: 'selectWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { w: 12, h: 3 },
    },
};

export default selectWidget;
