import { createSelector } from 'reselect';
import { mapToList } from '@togglecorp/fujs';
import { getAllWidgets } from '#entities/analysisFramework';
import { afIdFromRoute } from '../domainData';

const emptyObject = {};
const emptyArray = [];

const analysisFrameworkViewSelector = ({ siloDomainData }) => (
    siloDomainData.analysisFrameworkView
);

const analysisFrameworkPageSelector = ({ siloDomainData }) => (
    siloDomainData.analysisFrameworksPage || {}
);

const analysisFrameworkPageFrameworksSelector = createSelector(
    analysisFrameworkPageSelector,
    analysisFrameworksPage => analysisFrameworksPage.analysisFrameworks || emptyObject,
);

export const analysisFrameworkPageFrameworksListSelector = createSelector(
    analysisFrameworkPageFrameworksSelector,
    frameworks => mapToList(frameworks, d => d) || emptyObject,
);

const afViewFrameworkViewForIdSelector = createSelector(
    afIdFromRoute,
    analysisFrameworkViewSelector,
    (afId, afView) => afView[afId] || emptyObject,
);

export const afViewPristineSelector = createSelector(
    afViewFrameworkViewForIdSelector,
    afView => !!afView.pristine,
);

export const afViewAnalysisFrameworkSelector = createSelector(
    afViewFrameworkViewForIdSelector,
    afView => afView.data || emptyObject,
);

export const afViewGeoOptionsSelector = createSelector(
    afViewFrameworkViewForIdSelector,
    afView => afView.geoOptions || emptyObject,
);

export const afViewAnalysisFrameworkWidgetsSelector = createSelector(
    afViewAnalysisFrameworkSelector,
    afView => afView.widgets || emptyArray,
);

export const afViewWidgetsForVizSelector = createSelector(
    afViewAnalysisFrameworkSelector,
    (afView) => {
        const { widgets = [], properties: { statsConfig = {} } = {} } = afView;
        const allWidgets = getAllWidgets(widgets);


        const selectedWidgets = [];
        Object.entries(statsConfig).forEach(([key, value]) => {
            const { pk, isConditionalWidget } = value;

            if (isConditionalWidget) {
                const { selectors } = value;
                const widgetIndex = selectors[1];
                const newId = `${pk}-${widgetIndex}`;
                const conditionalWidget = allWidgets.find(widget => widget.id === newId);
                if (conditionalWidget) {
                    const { id } = conditionalWidget;
                    selectedWidgets.push({ [key]: id });
                }
            } else {
                const widget = allWidgets.find(w => w.id === pk);
                if (widget) {
                    const { id } = widget;
                    selectedWidgets.push({ [key]: id });
                }
            }
        });

        return Object.assign({}, ...selectedWidgets);
    },
);
