import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const SM__SET_SELECTED_LANGUAGE = 'siloDomainData/SM__SET_SELECTED_LANGUAGE ';

// ACTION-CREATOR

export const stringMgmtSetSelectedLanguageAction = languageCode => ({
    type: SM__SET_SELECTED_LANGUAGE,
    languageCode,
});

// REDUCER

const setSelectedLanguage = (state, action) => {
    const { languageCode } = action;
    const settings = {
        stringManagementView: {
            selectedLanguage: { $set: languageCode },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [SM__SET_SELECTED_LANGUAGE]: setSelectedLanguage,
};
export default reducers;
