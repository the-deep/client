import produce from 'immer';

export const TABULAR_SET_SELECTED_TAB = 'siloDomainData/TABULAR_SET_SELECTED_TAB';

// ACTION-CREATOR

export const setTabularSelectedTabAction = ({
    bookId,
    selectedTab,
}) => ({
    bookId,
    selectedTab,
    type: TABULAR_SET_SELECTED_TAB,
});

// REDUCER

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
    [TABULAR_SET_SELECTED_TAB]: setTabularSelectedTab,
};

export default reducers;
