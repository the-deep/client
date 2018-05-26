import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const SM__SET_SELECTED_LANGUAGE = 'siloDomainData/SM__SET_SELECTED_LANGUAGE ';
export const SM__SET_SELECTED_LINK_COLLECTION_NAME = 'siloDomainData/SM__SET_SELECTED_LINK_COLLECTION_NAME';

export const SM__ADD_LINK_CHANGE = 'siloDomainData/SM__ADD_LINK_CHANGE ';
export const SM__EDIT_LINK_CHANGE = 'siloDomainData/SM__EDIT_LINK_CHANGE ';
export const SM__REMOVE_LINK_CHANGE = 'siloDomainData/SM__REMOVE_LINK_CHANGE ';

export const SM__ADD_STRING_CHANGE = 'siloDomainData/SM__ADD_STRING_CHANGE ';
export const SM__EDIT_STRING_CHANGE = 'siloDomainData/SM__EDIT_STRING_CHANGE ';
export const SM__REMOVE_STRING_CHANGE = 'siloDomainData/SM__REMOVE_STRING_CHANGE ';

// ACTION-CREATOR

export const stringMgmtSetSelectedLanguageAction = languageCode => ({
    type: SM__SET_SELECTED_LANGUAGE,
    languageCode,
});

export const stringMgmtSetSelectedLinkCollectionNameAction = linkCollectionName => ({
    type: SM__SET_SELECTED_LINK_COLLECTION_NAME,
    linkCollectionName,
});

export const stringMgmtAddLinkChangeAction = ({ change, languageName, linkCollectionName }) => ({
    type: SM__ADD_LINK_CHANGE,
    change,
    languageName,
    linkCollectionName,
});

export const stringMgmtEditLinkChangeAction = ({ change, languageName, linkCollectionName }) => ({
    type: SM__EDIT_LINK_CHANGE,
    change,
    languageName,
    linkCollectionName,
});

export const stringMgmtRemoveLinkChangeAction = ({ change, languageName, linkCollectionName }) => ({
    type: SM__REMOVE_LINK_CHANGE,
    change,
    languageName,
    linkCollectionName,
});

export const stringMgmtAddStringChangeAction = ({ change, languageName }) => ({
    type: SM__ADD_STRING_CHANGE,
    change,
    languageName,
});

export const stringMgmtEditStringChangeAction = ({ change, languageName }) => ({
    type: SM__EDIT_STRING_CHANGE,
    change,
    languageName,
});

export const stringMgmtRemoveStringChangeAction = ({ change, languageName }) => ({
    type: SM__REMOVE_STRING_CHANGE,
    change,
    languageName,
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

// LINK CHANGE

// TODO: fix for link as we did for string

const addLinkChange = (state, action) => {
    const {
        change,
        languageName,
        linkCollectionName,
    } = action;
    const settings = {
        stringManagementView: {
            languageChanges: {
                [languageName]: { $auto: {
                    links: { $auto: {
                        [linkCollectionName]: { $autoArray: {
                            $push: [change],
                        } },
                    } },
                } },
            },
        },
    };
    return update(state, settings);
};

const editLinkChange = (state, action) => {
    const { change, languageName, linkCollectionName } = action;
    const { stringManagementView: { languageChanges } } = state;

    let index = -1;
    if (
        languageChanges[languageName] &&
        languageChanges[languageName].links &&
        languageChanges[languageName].links[linkCollectionName]
    ) {
        index = languageChanges[languageName].links[linkCollectionName].findIndex(
            l => change.action === l.action && change.key === l.key,
        );
    }
    if (index === -1) {
        return state;
    }
    const settings = {
        stringManagementView: {
            languageChanges: {
                [languageName]: {
                    links: {
                        [linkCollectionName]: {
                            $splice: [[index, 1, change]],
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const removeLinkChange = (state, action) => {
    const { change, languageName, linkCollectionName } = action;
    const { stringManagementView: { languageChanges } } = state;

    let index = -1;
    if (
        languageChanges[languageName] &&
        languageChanges[languageName].links &&
        languageChanges[languageName].links[linkCollectionName]
    ) {
        index = languageChanges[languageName].links[linkCollectionName].findIndex(
            l => change.action === l.action && change.key === l.key,
        );
    }
    if (index === -1) {
        return state;
    }
    const settings = {
        stringManagementView: {
            languageChanges: {
                [languageName]: {
                    links: {
                        [linkCollectionName]: {
                            $splice: [[index, 1]],
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

// STRING CHANGE

const editStringChange = (state, action) => {
    const { change: originalChange, languageName } = action;
    const { stringManagementView: { languageChanges } } = state;

    let change = originalChange;
    let index = -1;
    if (
        languageChanges &&
        languageChanges[languageName] &&
        languageChanges[languageName].strings
    ) {
        index = languageChanges[languageName].strings.findIndex(
            l => change.id === l.id,
        );
        if (index !== -1) {
            const oldChange = languageChanges[languageName].strings[index];
            change = {
                ...originalChange,
                oldValue: oldChange.oldValue,
            };
        }
    }

    const settings = {
        stringManagementView: {
            languageChanges: { $auto: {
                [languageName]: { $auto: {
                    strings: { $autoArray: {
                        $if: [
                            index === -1,
                            { $push: [change] },
                            { $splice: [[index, 1, change]] },
                        ],
                    } },
                } },
            } },
        },
    };
    return update(state, settings);
};
const addStringChange = editStringChange;

const removeStringChange = (state, action) => {
    const { change, languageName } = action;
    const { stringManagementView: { languageChanges } } = state;

    let index = -1;
    if (
        languageChanges[languageName] &&
        languageChanges[languageName].strings
    ) {
        index = languageChanges[languageName].strings.findIndex(
            l => change.action === l.action && change.id === l.id,
        );
    }
    if (index === -1) {
        return state;
    }
    const settings = {
        stringManagementView: {
            languageChanges: {
                [languageName]: {
                    strings: {
                        $splice: [[index, 1]],
                    },
                },
            },
        },
    };
    return update(state, settings);
};

// TODO
// Resolve for action
// Delete
//  String does't exist
//  String has changed => change oldValue
//
//  Edit
//  String doesn't exist
//  String has changed => change oldValue
//
//  Add
//  String already exist => change it to edit


// REDUCER MAP
const reducers = {
    [SM__SET_SELECTED_LANGUAGE]: setSelectedLanguage,
    [SM__SET_SELECTED_LINK_COLLECTION_NAME]: setSelectedLinkCollectionName,


    [SM__ADD_LINK_CHANGE]: addLinkChange,
    [SM__EDIT_LINK_CHANGE]: editLinkChange,
    [SM__REMOVE_LINK_CHANGE]: removeLinkChange,
    [SM__ADD_STRING_CHANGE]: addStringChange,
    [SM__EDIT_STRING_CHANGE]: editStringChange,
    [SM__REMOVE_STRING_CHANGE]: removeStringChange,
};
export default reducers;
