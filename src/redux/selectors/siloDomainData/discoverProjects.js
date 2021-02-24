import { createSelector } from 'reselect';

const emptyList = [];
const emptyObject = {};

const pageSelector = ({ siloDomainData }) => siloDomainData.discoverProjectsView;

export const discoverProjectsProjectListSelector = createSelector(
    pageSelector,
    discoverProjects => discoverProjects.projectList || emptyList,
);

export const discoverProjectsFiltersSelector = createSelector(
    pageSelector,
    discoverProjects => discoverProjects.filters || emptyObject,
);


export const discoverProjectsActivePageSelector = createSelector(
    pageSelector,
    discoverProjects => discoverProjects.activePage || 1,
);

export const discoverProjectsActiveSortSelector = createSelector(
    pageSelector,
    discoverProjects => discoverProjects.activeSort || '-leads_activity',
);

export const discoverProjectsTotalProjectsCountSelector = createSelector(
    pageSelector,
    discoverProjects => discoverProjects.totalProjectsCount || 0,
);

export const discoverProjectsProjectOptionsSelector = createSelector(
    pageSelector,
    discoverProjects => discoverProjects.projectOptions || emptyObject,
);
