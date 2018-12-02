import update from '#rsu/immutable-update';
import createReducerWithMap from '#utils/createReducerWithMap';
import { randomString } from '#rsu/common';

const UNIQUE_TAB_ID = randomString(64);
export const getDefaultTabId = () => UNIQUE_TAB_ID;

// TYPE

export const SET_TAB_STATUS = 'tabStatus/SET_TAB_STATUS';
export const REMOVE_TAB_STATUS = 'tabStatus/REMOVE_TAB_STATUS';


// ACTION-CREATOR

export const setTabStatusAction = ({ tabStatus }) => ({
    type: SET_TAB_STATUS,
    tabId: UNIQUE_TAB_ID,
    tabStatus,
});

export const removeTabStatusAction = ({ tabId }) => ({
    type: REMOVE_TAB_STATUS,
    tabId,
});

// REDUCER

const setTabStatus = (state, action) => {
    const { tabId, tabStatus } = action;
    const settings = {
        [tabId]: { $set: tabStatus },
    };
    return update(state, settings);
};

const removeTabStatus = (state, action) => {
    const { tabId } = action;
    const settings = {
        $unset: [tabId],
    };
    return update(state, settings);
};

export const tabStatusReducers = {
    [SET_TAB_STATUS]: setTabStatus,
    [REMOVE_TAB_STATUS]: removeTabStatus,
};

export default createReducerWithMap(tabStatusReducers, {});
