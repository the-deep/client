import { createSelector } from 'reselect';

const emptyObject = {};

export const tabularViewSelector = ({ siloDomainData }) => (
    siloDomainData.tabularView || emptyObject
);

const bookIdFromProps = (state, { bookId }) => (
    bookId
);

export const tabularViewForBookSelector = createSelector(
    tabularViewSelector,
    bookIdFromProps,
    (tabularView, bookId) => tabularView[bookId] || emptyObject,
);

export const selectedTabForTabularBook = createSelector(
    tabularViewForBookSelector,
    book => book.selectedTab,
);
