import { createSelector } from 'reselect';
import { projectIdFromRoute } from '../domainData';

const emptyObject = {};

// ARYS SELECTORS
const aryPageSelector = ({ siloDomainData }) => siloDomainData.aryPage;

const aryPageForProjectSelector = createSelector(
    aryPageSelector,
    projectIdFromRoute,
    (aryPage, activeProject) => (
        aryPage[activeProject] || emptyObject
    ),
);

export const aryPageActivePageSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.activePage || 1,
);

export const aryPageActiveSortSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.activeSort || '-created_at',
);

export const aryPageFilterSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.filter || emptyObject,
);
