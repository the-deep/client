import update from '#rsu/immutable-update';

// TYPE

export const AF__SET_ANALYSIS_FRAMEWORK = 'siloDomainData/AF__SET_ANALYSIS_FRAMEWORK';

export const AF__VIEW_ADD_WIDGET = 'siloDomainData/AF__VIEW_ADD_WIDGET';
export const AF__REMOVE_WIDGET = 'siloDomainData/AF__REMOVE_WIDGET';
export const AF__VIEW_UPDATE_WIDGET = 'siloDomainData/AF__VIEW_UPDATE_WIDGET';
export const AF__VIEW_UPDATE_WIDGET_LAYOUT = 'siloDomainData/AF__VIEW_UPDATE_WIDGET_LAYOUT';
export const AF__SET_FARAM = 'siloDomainData/AF__SET_FARAM';
export const AF__SET_GEO = 'siloDomainData/AF__SET_GEO';

// CREATOR

export const setAfViewGeoOptionsAction = ({ analysisFrameworkId, geoOptions }) => ({
    type: AF__SET_GEO,
    analysisFrameworkId,
    geoOptions,
});

export const setAfViewFaramAction = ({ analysisFrameworkId, faramValues, faramErrors }) => ({
    type: AF__SET_FARAM,
    analysisFrameworkId,
    faramValues,
    faramErrors,
});

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

    const faramValues = {
        title: analysisFramework.title,
        description: analysisFramework.description,
    };

    const settings = {
        analysisFrameworkView: { $auto: {
            [frameworkId]: { $auto: {
                pristine: { $set: true },
                data: { $set: analysisFramework },
                faramValues: { $set: faramValues },
                faramErrors: { $set: {} },
            } },
        } },
    };
    return update(state, settings);
};

const afViewAddWidget = (state, action) => {
    const { analysisFrameworkId, widget } = action;

    const settings = {
        analysisFrameworkView: {
            [analysisFrameworkId]: {
                data: {
                    widgets: {
                        $autoArray: { $push: [widget] },
                    },
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
                data: {
                    widgets: { $filter: w => getWidgetKey(w) !== widgetId },
                },
                pristine: { $set: false },
            },
        },
    };
    return update(state, settings);
};

const afViewUpdateWidget = (state, action) => {
    const { analysisFrameworkId, widget } = action;
    const { analysisFrameworkView: { [analysisFrameworkId]: { data: analysisFramework } } } = state;

    const existingWidgets = analysisFramework.widgets;
    const widgetIndex = existingWidgets.findIndex(w => getWidgetKey(w) === widget.key);

    if (widgetIndex === -1) {
        return state;
    }

    const settings = {
        analysisFrameworkView: {
            [analysisFrameworkId]: {
                data: {
                    widgets: {
                        [widgetIndex]: { $merge: widget },
                    },
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

    const { analysisFrameworkView: { [analysisFrameworkId]: { data: analysisFramework } } } = state;

    const existingWidgets = analysisFramework.widgets;
    const widgetIndex = existingWidgets.findIndex(w => getWidgetKey(w) === widgetKey);

    if (widgetIndex === -1) {
        return state;
    }

    const OVERVIEW = 'overview';

    const settings = {
        analysisFrameworkView: {
            [analysisFrameworkId]: {
                data: {
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
                pristine: { $set: false },
            },
        },
    };

    return update(state, settings);
};

const afViewSetFaram = (state, action) => {
    const {
        faramErrors,
        faramValues,
        analysisFrameworkId,
    } = action;
    const settings = {
        analysisFrameworkView: { $auto: {
            [analysisFrameworkId]: {
                faramValues: { $set: faramValues },
                faramErrors: { $set: faramErrors },
                pristine: { $set: false },
            },
        } },
    };
    return update(state, settings);
};

const afViewSetGeo = (state, action) => {
    const {
        analysisFrameworkId,
        geoOptions,
    } = action;

    const settings = {
        analysisFrameworkView: { $auto: {
            [analysisFrameworkId]: { $auto: {
                geoOptions: { $set: geoOptions },
            } },
        } },
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
    [AF__SET_FARAM]: afViewSetFaram,
    [AF__SET_GEO]: afViewSetGeo,
};
export default reducers;
