import { createSelector } from 'reselect';

const emptyList = [];
const emptyObject = {};

const pageSelector = ({ siloDomainData }) => siloDomainData.discoverProjectsView;

export const discoverProjectsProjectListSelector = createSelector(
    pageSelector,
    discoverProjects => discoverProjects.projectList || emptyList,
);

// fake selector
export const discoverProjectsFiltersSelector = createSelector(
    pageSelector,
    discoverProjects => discoverProjects.filters || emptyObject,
);
