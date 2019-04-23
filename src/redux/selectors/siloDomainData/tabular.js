// import { createSelector } from 'reselect';

const emptyObject = {};

export const tabularViewSelector = ({ siloDomainData }) => (
    siloDomainData.tabularView || emptyObject
);

export const selectedTabForTabularBook = ({ siloDomainData }, { bookId }) => (
    ((siloDomainData.tabularView || emptyObject)[bookId] || emptyObject).selectedTab || undefined
);
