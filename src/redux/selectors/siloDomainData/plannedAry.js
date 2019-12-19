import { createSelector } from 'reselect';
import { projectIdFromRoute } from '../domainData';

const emptyObject = {};

// ARYS SELECTORS
const plannedAryPageSelector = ({ siloDomainData }) => siloDomainData.plannedAryPage;

const plannedAryPageForProjectSelector = createSelector(
    plannedAryPageSelector,
    projectIdFromRoute,
    (plannedAryPage, activeProject) => (
        plannedAryPage[activeProject] || emptyObject
    ),
);

export const plannedAryPageActivePageSelector = createSelector(
    plannedAryPageForProjectSelector,
    plannedAry => plannedAry.activePage || 1,
);

export const plannedAryPageActiveSortSelector = createSelector(
    plannedAryPageForProjectSelector,
    plannedAry => plannedAry.activeSort || '-created_at',
);

export const plannedAryPageFilterSelector = createSelector(
    plannedAryPageForProjectSelector,
    plannedAry => plannedAry.filter || emptyObject,
);
