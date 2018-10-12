import update from '#rsu/immutable-update';
import createReducerWithMap from '#utils/createReducerWithMap';
import initialAppState from '../initial-state/app';
import { LOGOUT_ACTION } from '../reducers/auth';

// TYPE

export const SET_WAITING_FOR_PROJECT_ACTION = 'app/SET_WAITING_FOR_PROJECT';
export const SET_WAITING_FOR_PROJECT_ROLE_ACTION = 'app/SET_WAITING_FOR_PROJECT_ROLE';
export const SET_WAITING_FOR_PREFERENCES_ACTION = 'app/SET_WAITING_FOR_PREFERENCES';
export const SET_WAITING_FOR_LANGUAGE_ACTION = 'app/SET_WAITING_FOR_LANGUAGE';
export const SET_WAITING_FOR_AVAILABLE_LANGUAGES_ACTION = 'app/SET_WAITING_FOR_AVAILABLE_LANGUAGES';

// ACTION-CREATOR

export const setWaitingForProjectAction = value => ({
    type: SET_WAITING_FOR_PROJECT_ACTION,
    value,
});

export const setWaitingForProjectRolesAction = value => ({
    type: SET_WAITING_FOR_PROJECT_ROLE_ACTION,
    value,
});

export const setWaitingForPreferencesAction = value => ({
    type: SET_WAITING_FOR_PREFERENCES_ACTION,
    value,
});

export const setWaitingForLanguageAction = value => ({
    type: SET_WAITING_FOR_LANGUAGE_ACTION,
    value,
});

export const setWaitingForAvailableLanguagesAction = value => ({
    type: SET_WAITING_FOR_AVAILABLE_LANGUAGES_ACTION,
    value,
});

// REDUCER

const logout = () => initialAppState;

const setWaitingForProject = (state, action) => {
    const { value } = action;
    const settings = {
        waitingForProject: { $set: value },
    };
    return update(state, settings);
};

const setWaitingForProjectRoles = (state, action) => {
    const { value } = action;
    const settings = {
        waitingForProjectRoles: { $set: value },
    };
    return update(state, settings);
};

const setWaitingForPreferences = (state, action) => {
    const { value } = action;
    const settings = {
        waitingForPreferences: { $set: value },
    };
    return update(state, settings);
};

const setWaitingForLanguage = (state, action) => {
    const { value } = action;
    const settings = {
        waitingForLanguage: { $set: value },
    };
    return update(state, settings);
};

const setWaitingForAvailableLanguages = (state, action) => {
    const { value } = action;
    const settings = {
        waitingForAvailableLanguages: { $set: value },
    };
    return update(state, settings);
};


export const appReducers = {
    [SET_WAITING_FOR_PROJECT_ACTION]: setWaitingForProject,
    [SET_WAITING_FOR_PROJECT_ROLE_ACTION]: setWaitingForProjectRoles,
    [SET_WAITING_FOR_PREFERENCES_ACTION]: setWaitingForPreferences,
    [SET_WAITING_FOR_LANGUAGE_ACTION]: setWaitingForLanguage,
    [SET_WAITING_FOR_AVAILABLE_LANGUAGES_ACTION]: setWaitingForAvailableLanguages,
    [LOGOUT_ACTION]: logout,
};

const appReducer = createReducerWithMap(appReducers, initialAppState);
export default appReducer;
