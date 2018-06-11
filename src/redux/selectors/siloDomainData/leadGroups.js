import { createSelector } from 'reselect';
import { projectIdFromRoute } from '../domainData';

const emptyObject = {};
const emptyList = [];

// Lead Groups selectors
//
const pageSelector = ({ siloDomainData }) => siloDomainData.leadGroupsView;

const leadGroupsViewForProjectSelector = createSelector(
    pageSelector,
    projectIdFromRoute,
    (leadGroupsView, activeProject) => (
        leadGroupsView[activeProject] || emptyObject
    ),
);

export const leadGroupsForProjectSelector = createSelector(
    leadGroupsViewForProjectSelector,
    leadGroupsView => leadGroupsView.leadGroups || emptyList,
);

export const totalLeadGroupsCountSelector = createSelector(
    leadGroupsViewForProjectSelector,
    leadGroupsView => leadGroupsView.totalLeadGroupsCount || 0,
);

export const leadGroupsViewActivePageSelector = createSelector(
    leadGroupsViewForProjectSelector,
    leadGroupsView => leadGroupsView.activePage || 1,
);

export const leadGroupsViewActiveSortSelector = createSelector(
    leadGroupsViewForProjectSelector,
    leadGroupsView => leadGroupsView.activeSort || '-created_at',
);

export const leadGroupsViewFilterSelector = createSelector(
    leadGroupsViewForProjectSelector,
    leadGroupsView => leadGroupsView.filter || emptyObject,
);
