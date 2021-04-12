import { createSelector } from 'reselect';

import { pillarAnalysisIdFromRoute } from '../domainData';

const emptyObject = {};

const editPillarAnalysisSelector = ({ siloDomainData }) => (
    siloDomainData.editPillarAnalysis || emptyObject
);

// eslint-disable-next-line import/prefer-default-export
export const editPillarAnalysisPillarAnalysisSelector = createSelector(
    pillarAnalysisIdFromRoute,
    editPillarAnalysisSelector,
    (leadId, pillarAnalysis) => pillarAnalysis[leadId] || emptyObject,
);
