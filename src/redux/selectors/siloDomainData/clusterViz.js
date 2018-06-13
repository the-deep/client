import { createSelector } from 'reselect';
import { projectIdFromRoute } from '../domainData';

const emptyObject = {};

export const clusterDataSelector = ({ siloDomainData }) => (
    siloDomainData.clusterVisualization || emptyObject
);

export const projectClusterDataSelector = createSelector(
    clusterDataSelector,
    projectIdFromRoute,
    (data, projectId) => data[projectId] || emptyObject,
);
