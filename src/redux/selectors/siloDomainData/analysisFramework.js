import { createSelector } from 'reselect';
import { mapToList } from '@togglecorp/fujs';
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

export const afViewAnalysisFrameworkStatsConfigSelector = createSelector(
    afViewAnalysisFrameworkSelector,
    (afView) => {
        const {
            properties: {
                statsConfig = emptyObject,
            } = {},
        } = afView;
        return statsConfig;
    },
);
