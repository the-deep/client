import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const SM__SET_SELECTED_LANGUAGE = 'siloDomainData/SM__SET_SELECTED_LANGUAGE ';
export const SM__SET_SELECTED_LINK_COLLECTION_NAME = 'siloDomainData/SM__SET_SELECTED_LINK_COLLECTION_NAME';

// ACTION-CREATOR

export const stringMgmtSetSelectedLanguageAction = languageCode => ({
    type: SM__SET_SELECTED_LANGUAGE,
    languageCode,
});

export const stringMgmtSetSelectedLinkCollectionNameAction = linkCollectionName => ({
    type: SM__SET_SELECTED_LINK_COLLECTION_NAME,
    linkCollectionName,
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

const setSelectedLinkCollectionName = (state, action) => {
    const { linkCollectionName } = action;
    const settings = {
        stringManagementView: {
            selectedLinkCollectionName: { $set: linkCollectionName },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [SM__SET_SELECTED_LANGUAGE]: setSelectedLanguage,
    [SM__SET_SELECTED_LINK_COLLECTION_NAME]: setSelectedLinkCollectionName,
};
export default reducers;
