import { createSelector } from 'reselect';
import { afIdFromRoute } from '../domainData';

const emptyObject = {};

const analysisFrameworkViewSelector = ({ siloDomainData }) => (
    siloDomainData.analysisFrameworkView
);

// eslint-disable-next-line import/prefer-default-export
export const afViewAnalysisFrameworkSelector = createSelector(
    afIdFromRoute,
    analysisFrameworkViewSelector,
    (afId, afView) => afView[afId] || emptyObject,
);
