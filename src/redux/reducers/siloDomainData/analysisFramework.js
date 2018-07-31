import update from '#rsu/immutable-update';

// TYPE

export const AF__SET_ANALYSIS_FRAMEWORK = 'siloDomainData/AF__SET_ANALYSIS_FRAMEWORK';

export const AF__VIEW_ADD_WIDGET = 'siloDomainData/AF__VIEW_ADD_WIDGET';
export const AF__REMOVE_WIDGET = 'siloDomainData/AF__REMOVE_WIDGET';
export const AF__VIEW_UPDATE_WIDGET = 'siloDomainData/AF__VIEW_UPDATE_WIDGET';
export const AF__VIEW_UPDATE_WIDGET_LAYOUT = 'siloDomainData/AF__VIEW_UPDATE_WIDGET_LAYOUT';

// CREATOR

export const setAfViewAnalysisFrameworkAction = ({ analysisFramework }) => ({
    type: AF__SET_ANALYSIS_FRAMEWORK,
    analysisFramework,
});

export const addAfViewWidgetAction = ({
    analysisFrameworkId,
    widget,
}) => ({
    type: AF__VIEW_ADD_WIDGET,
    analysisFrameworkId,
    widget,
});

export const removeAfViewWidgetAction = ({
    analysisFrameworkId,
    widgetId,
}) => ({
    type: AF__REMOVE_WIDGET,
    analysisFrameworkId,
    widgetId,
});

export const updateAfViewWidgetAction = ({
    analysisFrameworkId,
    widget,
}) => ({
    type: AF__VIEW_UPDATE_WIDGET,
    analysisFrameworkId,
    widget,
});

export const updateAfViewWidgetLayoutAction = ({
    analysisFrameworkId,
    widgetKey,
    widgetType,
    layout,
}) => ({
    type: AF__VIEW_UPDATE_WIDGET_LAYOUT,
    analysisFrameworkId,
    widgetKey,
    widgetType,
    layout,
});


// HELPER

const getWidgetKey = widget => widget.key;

// REDUCER

const afViewSetAnalysisFramework = (state, action) => {
    const { analysisFramework } = action;
    const frameworkId = analysisFramework.id;
    const framework = {
        ...analysisFramework,
        pristine: true,
    };

    const settings = {
        analysisFrameworkView: {
            [frameworkId]: {
                $set: framework,
            },
        },
    };
    return update(state, settings);
};

const afViewAddWidget = (state, action) => {
    const { analysisFrameworkId, widget } = action;

    const settings = {
        analysisFrameworkView: {
            [analysisFrameworkId]: {
                widgets: {
                    $autoArray: { $push: [widget] },
                },
                pristine: { $set: false },
            },
        },
    };
    return update(state, settings);
};

const afViewRemoveWidget = (state, action) => {
    const { analysisFrameworkId, widgetId } = action;

    const settings = {
        analysisFrameworkView: {
            [analysisFrameworkId]: {
                widgets: { $filter: w => getWidgetKey(w) !== widgetId },
                pristine: { $set: false },
            },
        },
    };
    return update(state, settings);
};

const afViewUpdateWidget = (state, action) => {
    const { analysisFrameworkId, widget } = action;
    const { analysisFrameworkView: { [analysisFrameworkId]: analysisFramework } } = state;

    const existingWidgets = analysisFramework.widgets;
    const widgetIndex = existingWidgets.findIndex(w => getWidgetKey(w) === widget.key);

    if (widgetIndex === -1) {
        return state;
    }

    const settings = {
        analysisFrameworkView: {
            [analysisFrameworkId]: {
                widgets: {
                    [widgetIndex]: { $merge: widget },
                },
                pristine: { $set: false },
            },
        },
    };

    return update(state, settings);
};

const afViewUpdateWidgetLayout = (state, action) => {
    const {
        analysisFrameworkId,
        widgetKey,
        widgetType,
        layout,
    } = action;

    const { analysisFrameworkView: { [analysisFrameworkId]: analysisFramework } } = state;

    const existingWidgets = analysisFramework.widgets;
    const widgetIndex = existingWidgets.findIndex(w => getWidgetKey(w) === widgetKey);

    if (widgetIndex === -1) {
        return state;
    }

    const OVERVIEW = 'overview';

    const settings = {
        analysisFrameworkView: {
            [analysisFrameworkId]: {
                widgets: {
                    [widgetIndex]: {
                        properties: {
                            $if: [
                                widgetType === OVERVIEW,
                                { overviewGridLayout: { $set: layout } },
                                { listGridLayout: { $set: layout } },
                            ],
                        },
                    },
                },
            },
        },
    };

    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [AF__SET_ANALYSIS_FRAMEWORK]: afViewSetAnalysisFramework,
    [AF__VIEW_ADD_WIDGET]: afViewAddWidget,
    [AF__REMOVE_WIDGET]: afViewRemoveWidget,
    [AF__VIEW_UPDATE_WIDGET]: afViewUpdateWidget,
    [AF__VIEW_UPDATE_WIDGET_LAYOUT]: afViewUpdateWidgetLayout,
};
export default reducers;
