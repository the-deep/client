import update from '#rsu/immutable-update';
import createReducerWithMap from '#utils/createReducerWithMap';
import { uniqueTabId } from '#config/store';


// TYPE

export const SET_TAB_STATUS = 'tabStatus/SET_TAB_STATUS';
export const SET_TAB_TIME = 'tabStatus/SET_TAB_TIME';
export const REMOVE_TAB_STATUS = 'tabStatus/REMOVE_TAB_STATUS';
export const REMOVE_SELF_TAB_STATUS = 'tabStatus/REMOVE_SELF_TAB_STATUS';


// ACTION-CREATOR

export const setTabStatusAction = ({ url, path }) => ({
    type: SET_TAB_STATUS,
    tabId: uniqueTabId,
    url,
    path,
});

export const setTabTimeAction = () => ({
    type: SET_TAB_TIME,
    tabId: uniqueTabId,
    retransmit: true,
});

export const removeSelfTabStatusAction = () => ({
    type: REMOVE_SELF_TAB_STATUS,
    tabId: uniqueTabId,
});

export const removeTabStatusAction = ({ tabIds }) => ({
    type: REMOVE_TAB_STATUS,
    tabIds,
});

// REDUCER

const setTabStatus = (state, action) => {
    const { tabId, url, path } = action;
    const settings = {
        [tabId]: {
            $set: {
                url,
                path,
                fresh: true,
            },
        },
    };
    return update(state, settings);
};

const setTabTime = (state, { tabId, senderId, resenderId }) => {
    // NOTE: setTabTime can be called before setTabStatus sometimes
    const settings = {
        [resenderId || senderId || tabId]: { $auto: {
            fresh: { $set: true },
        } },
    };
    return update(state, settings);
};

const removeTabStatus = (state, action) => {
    const { tabIds } = action;
    const settings = {
        $bulk: tabIds.map(tabId => ({ $unset: [tabId] })),
    };
    const newState = update(state, settings);

    // mark all as unfresh
    const tabIdsToAlter = Object.keys(newState);
    const newSettings = {
        $bulk: tabIdsToAlter.map(tabId => ({ [tabId]: { fresh: { $set: false } } })),
    };
    return update(newState, newSettings);
};

const removeSelfTabStatus = (state, action) => {
    const { tabId } = action;
    const settings = {
        $unset: [tabId],
    };
    return update(state, settings);
};

export const tabStatusReducers = {
    [SET_TAB_STATUS]: setTabStatus,
    [REMOVE_TAB_STATUS]: removeTabStatus,
    [SET_TAB_TIME]: setTabTime,
    [REMOVE_SELF_TAB_STATUS]: removeSelfTabStatus,
};

export default createReducerWithMap(tabStatusReducers, {});
