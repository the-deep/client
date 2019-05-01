import { createSelector } from 'reselect';
import { listToMap } from '@togglecorp/fujs';

const emptyObject = {};
const emptyList = [];


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

export const selectedTabForTabularBookSelector = createSelector(
    tabularViewForBookSelector,
    book => book.selectedTab,
);

const tabularBookSelector = createSelector(
    tabularViewForBookSelector,
    tabularView => (tabularView.book || emptyObject),
);

export const sheetsForTabularBookSelector = createSelector(
    tabularBookSelector,
    (book) => {
        const validSheets = (book.sheets || emptyList).filter(
            sheet => sheet.fields.length > 0,
        );
        const filteredSheets = validSheets.filter(
            sheet => !sheet.hidden,
        );
        return filteredSheets;
    },
);

export const sheetsMapForTabularBookSelector = createSelector(
    sheetsForTabularBookSelector,
    (sheets) => {
        const sheetsMap = listToMap(
            sheets,
            sheet => sheet.id,
            sheet => sheet,
        );
        return sheetsMap;
    },
);

export const tabsForTabularBookSelector = createSelector(
    sheetsForTabularBookSelector,
    (sheets) => {
        const tabs = listToMap(
            sheets,
            sheet => sheet.id,
            sheet => sheet.title,
        );
        return tabs;
    },
);

export const fieldsMapForTabularBookSelector = createSelector(
    sheetsForTabularBookSelector,
    (sheets) => {
        const fields = sheets
            .map(sheet => sheet.fields)
            .flat();
        const fieldsMap = listToMap(
            fields,
            field => field.id,
            field => field,
        );
        return fieldsMap;
    },
);
