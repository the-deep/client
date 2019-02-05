import { createSelector } from 'reselect';
import { projectIdFromRoute } from '../domainData';

const emptyList = [];
const emptyObject = {};

const leadPageSelector = ({ siloDomainData }) => siloDomainData.leadPage;

const leadPageForProjectSelector = createSelector(
    leadPageSelector,
    projectIdFromRoute,
    (leadPage, activeProject) => (
        leadPage[activeProject] || emptyObject
    ),
);

export const leadPageViewSelector = createSelector(
    leadPageSelector,
    leadPage => leadPage.view || 'table',
);

export const leadPageForActiveViewSelector = createSelector(
    leadPageForProjectSelector,
    leadPageViewSelector,
    (leadPage, view) => leadPage[view] || emptyObject,
);

export const leadPageTableViewSelector = createSelector(
    leadPageForProjectSelector,
    leadPage => leadPage.table || emptyObject,
);

export const leadPageGridViewSelector = createSelector(
    leadPageForProjectSelector,
    leadPage => leadPage.grid || emptyObject,
);

export const leadPageFilterSelector = createSelector(
    leadPageForProjectSelector,
    leadPage => leadPage.filter || emptyObject,
);

export const leadPageActivePageSelector = createSelector(
    leadPageForActiveViewSelector,
    leadPage => leadPage.activePage || 1,
);

export const leadPageActiveSortSelector = createSelector(
    leadPageForActiveViewSelector,
    leadPage => leadPage.activeSort || '-created_at',
);

export const leadPageLeadsPerPageSelector = createSelector(
    leadPageForActiveViewSelector,
    leadPage => leadPage.leadsPerPage || 25,
);

export const leadsForProjectSelector = createSelector(
    leadPageForActiveViewSelector,
    leadPage => leadPage.leads || emptyList,
);

export const leadsForProjectGridViewSelector = createSelector(
    leadPageGridViewSelector,
    leadPage => leadPage.leads || emptyList,
);

export const leadsForProjectTableViewSelector = createSelector(
    leadPageTableViewSelector,
    leadPage => leadPage.leads || emptyList,
);

export const totalLeadsCountForProjectSelector = createSelector(
    leadPageForProjectSelector,
    leadPage => leadPage.totalLeadsCount || 0,
);
