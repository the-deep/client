import {
    FrameworkListWidget,
} from './Framework';

const selectWidget = {
    id: 'selectWidget',
    // NOTE: used as _ts('widgetTitle', 'selectWidgetLabel')
    title: 'selectWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 192, height: 48 },
    },
};

export default selectWidget;
