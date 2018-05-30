import { createSelector } from 'reselect';

import {
    analysisFrameworksSelector,
    projectsSelector,
    projectIdFromRoute,
} from '../domainData';

const emptyList = [];
const emptyObject = {};

const entriesViewSelector = ({ siloDomainData }) => siloDomainData.entriesView;

export const entriesViewForProjectSelector = createSelector(
    entriesViewSelector,
    projectIdFromRoute,
    (entriesView, activeProject) => (
        entriesView[activeProject] || emptyObject
    ),
);

export const entriesViewFilterSelector = createSelector(
    entriesViewForProjectSelector,
    entriesView => entriesView.filter || emptyObject,
);


export const entriesViewActivePageSelector = createSelector(
    entriesViewForProjectSelector,
    entriesView => entriesView.activePage || 1,
);

export const totalEntriesCountForProjectSelector = createSelector(
    entriesViewForProjectSelector,
    entriesView => entriesView.totalEntriesCount || 0,
);

export const entriesForProjectSelector = createSelector(
    entriesViewForProjectSelector,
    entriesView => entriesView.entries || emptyList,
);

export const analysisFrameworkForProjectSelector = createSelector(
    projectIdFromRoute,
    projectsSelector,
    analysisFrameworksSelector,
    (projectId, projects, analysisFrameworks) => {
        if (!projects[projectId] || !projects[projectId].analysisFramework) {
            return emptyObject;
        }
        return analysisFrameworks[projects[projectId].analysisFramework] || emptyObject;
    },
);
