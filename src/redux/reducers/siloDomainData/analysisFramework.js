import update from '#rs/utils/immutable-update';
import { isEqualAndTruthy } from '#rs/utils/common';

// TYPE

export const AF__SET_ANALYSIS_FRAMEWORK = 'siloDomainData/AF__SET_ANALYSIS_FRAMEWORK';

export const AF__VIEW_ADD_WIDGET = 'siloDomainData/AF__VIEW_ADD_WIDGET';
export const AF__REMOVE_WIDGET = 'siloDomainData/AF__REMOVE_WIDGET';
export const AF__VIEW_UPDATE_WIDGET = 'siloDomainData/AF_VIEW_UPDATE_WIDGET';

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

// HELPER

const isAnalysisFrameworkValid = (af = {}, id) => isEqualAndTruthy(id, af.id);

const getWidgetKey = widget => widget.key;
const createWidgetKeyComparator = key => (w => w.key === key);

// Check collision of widget at `index` with all other widgets
// using layout corresponding to `layoutKey` in the properties.
const checkCollision = (widgets, layoutKey, index) => {
    const rect1 = widgets[index].properties[layoutKey];
    for (let i = 0; i < widgets.length; i += 1) {
        if (i !== index) {
            const rect2 = widgets[i].properties[layoutKey];
            if (
                (rect1.left < rect2.left + rect2.width) &&
                (rect1.left + rect1.width > rect2.left) &&
                (rect1.top < rect2.top + rect2.height) &&
                (rect1.height + rect1.top > rect2.top)
            ) {
                return true;
            }
        }
    }
    return false;
};

// Get height of widget using layout corresponding to `layoutKey`
// in the properties.
const getHeightOfWidget = layoutKey => widget => (
    widget.properties[layoutKey].top + widget.properties[layoutKey].height
);


// Validate an analysis framework and returns new one with
// updated widgets.
const getValidatedAnalysisFramework = (analysisFramework) => {
    let { widgets } = analysisFramework;

    let overviewWidgets = widgets.filter(w => w.properties.overviewGridLayout);

    // Get max height of all widgets
    let maxOverviewHeight = Math.max(
        ...overviewWidgets.map(getHeightOfWidget('overviewGridLayout')),
    );

    let settings = {};
    // Go through each widget, to check for collision
    for (let i = overviewWidgets.length - 1; i >= 1; i -= 1) {
        // If this widget collide with any, ...
        if (checkCollision(overviewWidgets, 'overviewGridLayout', i)) {
            // Move it's top to max height
            settings[i] = {
                properties: {
                    overviewGridLayout: {
                        top: { $set: maxOverviewHeight },
                    },
                },
            };

            // Update max height
            maxOverviewHeight += overviewWidgets[i].properties.overviewGridLayout.height;
            // Update the widgets
            overviewWidgets = update(overviewWidgets, settings);

            // Update thr original widget list as well
            const widgetIndex = widgets.findIndex(
                createWidgetKeyComparator(overviewWidgets[i].key),
            );
            widgets = update(widgets, {
                [widgetIndex]: settings[i],
            });
        }
    }

    // Do the same for list widgets
    let listWidgets = widgets.filter(w => w.properties.listGridLayout);
    let maxListHeight = Math.max(
        ...listWidgets.map(getHeightOfWidget('listGridLayout')),
    );

    settings = {};
    for (let i = listWidgets.length - 1; i >= 1; i -= 1) {
        if (checkCollision(listWidgets, 'listGridLayout', i)) {
            settings[i] = {
                properties: {
                    listGridLayout: {
                        top: { $set: maxListHeight },
                    },
                },
            };
            maxListHeight += listWidgets[i].properties.listGridLayout.height;
            listWidgets = update(listWidgets, settings);

            const widgetIndex = widgets.findIndex(
                createWidgetKeyComparator(listWidgets[i].key),
            );
            widgets = update(widgets, {
                [widgetIndex]: settings[i],
            });
        }
    }

    const analysisFrameworkSettings = {
        widgets: { $set: widgets },
        pristine: { $set: false },
    };

    // Return updates widget list
    return update(analysisFramework, analysisFrameworkSettings);
};

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
    const { analysisFrameworkView: { [analysisFrameworkId]: analysisFramework } } = state;
    if (!isAnalysisFrameworkValid(analysisFramework, analysisFrameworkId)) {
        return state;
    }

    const settings = {
        analysisFrameworkView: {
            [analysisFrameworkId]: {
                widgets: {
                    $autoArray: { $push: [widget] },
                },
            },
        },
    };
    const newState = update(state, settings);
    const newSettings = {
        analysisFrameworkView: {
            [analysisFrameworkId]: { $set: getValidatedAnalysisFramework(
                newState.analysisFrameworkView[analysisFrameworkId],
            ) },
        },
    };

    return update(newState, newSettings);
};

const afViewRemoveWidget = (state, action) => {
    const { analysisFrameworkId, widgetId } = action;
    const { analysisFrameworkView: { [analysisFrameworkId]: analysisFramework } } = state;

    if (!isAnalysisFrameworkValid(analysisFramework, analysisFrameworkId)) {
        return state;
    }

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

    if (!isAnalysisFrameworkValid(analysisFramework, analysisFrameworkId)) {
        return state;
    }

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

// REDUCER MAP

const reducers = {
    [AF__SET_ANALYSIS_FRAMEWORK]: afViewSetAnalysisFramework,
    [AF__VIEW_ADD_WIDGET]: afViewAddWidget,
    [AF__REMOVE_WIDGET]: afViewRemoveWidget,
    [AF__VIEW_UPDATE_WIDGET]: afViewUpdateWidget,
};
export default reducers;
