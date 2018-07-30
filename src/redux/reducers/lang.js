import createReducerWithMap from '#utils/createReducerWithMap';

import { listToMap } from '#rsu/common';
import update from '#rsu/immutable-update';

import initialLangState from '../initial-state/lang';
import { LOGOUT_ACTION } from '../reducers/auth';

export const SET_SELECTED_LANGUAGE_ACTION = 'lang/SET_SELECTED_LANGUAGE';
export const SET_FALLBACK_LANGUAGE_ACTION = 'lang/SET_FALLBACK_LANGUAGE';
export const SET_LANGUAGES_ACTION = 'lang/SET_LANGUAGES_ACTION';
export const SET_LANGUAGE_ACTION = 'lang/SET_LANGUAGE_ACTION';

export const setSelectedLanguageAction = languageCode => ({
    type: SET_SELECTED_LANGUAGE_ACTION,
    languageCode,
});
export const setFallbackLanguageAction = languageCode => ({
    type: SET_FALLBACK_LANGUAGE_ACTION,
    languageCode,
});
export const setAvailableLanguagesAction = languages => ({
    type: SET_LANGUAGES_ACTION,
    languages,
});

export const setLanguageAction = language => ({
    type: SET_LANGUAGE_ACTION,
    language,
});

const logout = () => initialLangState;

const setSelectedLanguage = (state, action) => {
    const { languageCode } = action;
    const settings = {
        selectedLanguage: { $set: languageCode },
    };
    return update(state, settings);
};

const setFallbackLanguage = (state, action) => {
    const { languageCode } = action;
    const settings = {
        fallbackLanguage: { $set: languageCode },
    };
    return update(state, settings);
};
const setAvailableLanguages = (state, action) => {
    const { languages } = action;
    const settings = {
        availableLanguages: { $set: languages },
    };
    return update(state, settings);
};

const transformServerLanguage = lang => ({
    ...lang,
    strings: listToMap(lang.strings, str => str.id, str => str.value),
    links: Object.keys(lang.links).reduce(
        (acc, linkCollectionName) => {
            acc[linkCollectionName] = listToMap(
                lang.links[linkCollectionName],
                lnk => lnk.key,
                lnk => lnk.string,
            );
            return acc;
        },
        {},
    ),
});

const setLanguage = (state, action) => {
    const { language } = action;
    const settings = {
        languages: {
            [language.code]: {
                $set: transformServerLanguage(language),
            },
        },
    };
    return update(state, settings);
};

export const langReducers = {
    [LOGOUT_ACTION]: logout,
    [SET_SELECTED_LANGUAGE_ACTION]: setSelectedLanguage,
    [SET_FALLBACK_LANGUAGE_ACTION]: setFallbackLanguage,
    [SET_LANGUAGES_ACTION]: setAvailableLanguages,
    [SET_LANGUAGE_ACTION]: setLanguage,
};

const langReducer = createReducerWithMap(langReducers, initialLangState);
export default langReducer;
