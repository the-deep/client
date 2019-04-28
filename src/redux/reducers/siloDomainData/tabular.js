import produce from 'immer';

export const TABULAR__SET_SELECTED_TAB = 'siloDomainData/TABULAR__SET_SELECTED_TAB';
export const TABULAR__SET_TABULAR_DATA = 'siloDomainData/TABULAR__SET_TABULAR_DATA';
export const TABULAR__PATCH_TABULAR_FIELDS = 'siloDomainData/TABULAR__PATCH_TABULAR_FIELDS';

// ACTION-CREATOR

export const setTabularDataAction = ({ bookId, book }) => ({
    type: TABULAR__SET_TABULAR_DATA,
    bookId,
    book,
});

export const patchTabularFieldsAction = ({ bookId, fields }) => ({
    type: TABULAR__PATCH_TABULAR_FIELDS,
    bookId,
    fields,
});

export const setTabularSelectedTabAction = ({
    bookId,
    selectedTab,
}) => ({
    bookId,
    selectedTab,
    type: TABULAR__SET_SELECTED_TAB,
});

// REDUCER

const setTabularData = (state, action) => {
    const { bookId, book } = action;

    /*
    const fields = tabularData.sheets
        .map(sheet => sheet.fields)
        .flat();
    const fieldMap = listToMap(
        fields,
        field => field.id,
        field => field,
    );
    */

    return produce(state, (safeState) => {
        if (!safeState.tabularView) {
            // eslint-disable-next-line no-param-reassign
            safeState.tabularView = {};
        }
        if (!safeState.tabularView[bookId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.tabularView[bookId] = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState.tabularView[bookId].book = book;
    });
};

const patchTabularFields = (state, action) => {
    const { bookId, fields } = action;

    const {
        tabularView: {
            [bookId]: {
                book,
            },
        },
    } = state;

    return produce(state, (safeState) => {
        fields.forEach((field) => {
            const sheetIndex = book.sheets.findIndex(sheet => sheet.id === field.sheet);
            if (sheetIndex === -1) {
                return;
            }
            const fieldIndex = book.sheets[sheetIndex].fields.findIndex(f => f.id === field.id);
            if (fieldIndex === -1) {
                // eslint-disable-next-line no-param-reassign
                safeState.tabularView[bookId].book.sheets[sheetIndex].fields.push(field);
            } else {
                // eslint-disable-next-line no-param-reassign
                safeState.tabularView[bookId].book.sheets[sheetIndex].fields[fieldIndex] = field;
            }
        });
    });
};

const setTabularSelectedTab = (state, action) => {
    const {
        bookId,
        selectedTab,
    } = action;

    return produce(state, (safeState) => {
        if (!safeState.tabularView) {
            // eslint-disable-next-line no-param-reassign
            safeState.tabularView = {};
        }
        if (!safeState.tabularView[bookId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.tabularView[bookId] = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState.tabularView[bookId].selectedTab = selectedTab;
    });
};

// REDUCER MAP

const reducers = {
    [TABULAR__SET_SELECTED_TAB]: setTabularSelectedTab,
    [TABULAR__SET_TABULAR_DATA]: setTabularData,
    [TABULAR__PATCH_TABULAR_FIELDS]: patchTabularFields,
};

export default reducers;
