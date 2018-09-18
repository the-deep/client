import { createSelector } from 'reselect';
import { afIdFromRoute } from '../domainData';

const emptyObject = {};
const emptyArray = [];

const analysisFrameworkViewSelector = ({ siloDomainData }) => (
    siloDomainData.analysisFrameworkView
);

const afViewFrameworkViewForIdSelector = createSelector(
    afIdFromRoute,
    analysisFrameworkViewSelector,
    (afId, afView) => afView[afId] || emptyObject,
);

export const afViewFaramValuesSelector = createSelector(
    afViewFrameworkViewForIdSelector,
    afView => afView.faramValues || emptyObject,
);

export const afViewFaramErrorsSelector = createSelector(
    afViewFrameworkViewForIdSelector,
    afView => afView.faramErrors || emptyObject,
);

export const afViewPristineSelector = createSelector(
    afViewFrameworkViewForIdSelector,
    afView => !!afView.pristine,
);

export const afViewAnalysisFrameworkSelector = createSelector(
    afViewFrameworkViewForIdSelector,
    afView => afView.data || emptyObject,
);

export const afViewAnalysisFrameworkWidgetsSelector = createSelector(
    afViewAnalysisFrameworkSelector,
    afView => afView.widgets || emptyArray,
);
