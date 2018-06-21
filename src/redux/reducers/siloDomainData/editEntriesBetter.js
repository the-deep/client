import update from '#rs/utils/immutable-update';
import { applyDiff, entryAccessor } from '#entities/editEntriesBetter';

const getNewSelectedEntryKey = (entries, selectedEntryKey) => {
    if (entries.length <= 0) {
        return undefined;
    }
    if (selectedEntryKey === undefined) {
        return entryAccessor.key(entries[0]);
    }
    const selectedEntry = entries.find(
        entry => entryAccessor.key(entry) === selectedEntryKey,
    );
    if (!selectedEntry) {
        return entryAccessor.key(entries[0]);
    }
    return selectedEntryKey;
};


// REDUX

export const EEB__SET_LEAD = 'siloDomainData/EEB__SET_LEAD';
export const EEB__SET_ENTRIES = 'siloDomainData/EEB__SET_ENTRIES';
export const EEB__CLEAR_ENTRIES = 'siloDomainData/EEB__CLEAR_ENTRIES';
export const EEB__SET_SELECTED_ENTRY_KEY = 'siloDomainData/EEB__SET_SELECTED_ENTRY_KEY';
export const EEB__SET_ENTRY_EXCERPT = 'siloDomainData/EEB__SET_ENTRY_EXCERPT';
export const EEB__SET_ENTRY_DATA = 'siloDomainData/EEB__SET_ENTRY_DATA';
export const EEB__SET_ENTRY_ERROR = 'siloDomainData/EEB__SET_ENTRY_ERROR';

export const editEntriesSetLeadAction = ({ lead }) => ({
    type: EEB__SET_LEAD,
    lead,
});

export const editEntriesSetEntriesAction = ({ leadId, entryActions }) => ({
    type: EEB__SET_ENTRIES,
    entryActions,
    leadId,
});

export const editEntriesClearEntriesAction = ({ leadId }) => ({
    type: EEB__CLEAR_ENTRIES,
    leadId,
});

export const editEntriesSetSelectedEntryKeyAction = ({ leadId, key }) => ({
    type: EEB__SET_SELECTED_ENTRY_KEY,
    leadId,
    key,
});

export const editEntriesSetExcerptAction = ({ leadId, key, excerptValue, excerptType }) => ({
    type: EEB__SET_ENTRY_EXCERPT,
    leadId,
    key,
    excerptType,
    excerptValue,
});

export const editEntriesSetEntryDataAction = ({ leadId, key, values, errors, info }) => ({
    type: EEB__SET_ENTRY_DATA,
    leadId,
    key,
    values,
    errors,
    info,
});

export const editEntriesSetEntryErrorsAction = ({ leadId, key, errors }) => ({
    type: EEB__SET_ENTRY_ERROR,
    leadId,
    key,
    errors,
});

const setLead = (state, action) => {
    const { lead } = action;
    const leadId = lead.id;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                lead: { $set: lead },
            } },
        } },
    };
    return update(state, settings);
};

const setEntries = (state, action) => {
    const { leadId, entryActions } = action;
    const {
        editEntries: {
            [leadId]: {
                entries = [],
                selectedEntryKey,
            } = {},
        } = {},
    } = state;

    const newEntries = applyDiff(entries, entryActions);
    const newSelectedEntryKey = getNewSelectedEntryKey(newEntries, selectedEntryKey);

    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entries: { $set: newEntries },
                selectedEntryKey: { $set: newSelectedEntryKey },
            } },
        } },
    };
    return update(state, settings);
};

const clearEntries = (state, action) => {
    const { leadId } = action;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entries: { $set: [] },
            } },
        } },
    };
    return update(state, settings);
};

const setSelectedEntryKey = (state, action) => {
    const { leadId, key } = action;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                selectedEntryKey: { $set: key },
            } },
        } },
    };
    return update(state, settings);
};

const setEntryExcerpt = (state, action) => {
    const { leadId, key, excerptType, excerptValue } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    // TODO: check if key is undefined, create new entry if undefined

    const entryIndex = entries.findIndex(entry => entryAccessor.key(entry) === key);
    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: {
                            entryType: { $set: excerptType },
                            excerpt: { $set: excerptType === 'excerpt' ? excerptValue : undefined },
                            image: { $set: excerptType === 'image' ? excerptValue : undefined },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const setEntryData = (state, action) => {
    const { leadId, key, values, errors, info } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const entryIndex = entries.findIndex(
        entry => entryAccessor.key(entry) === key,
    );

    let newFaramValues = values;

    const errorSettings = { $auto: {
        localData: {
            isPristine: { $set: false },
            error: { $set: errors },
            // TODO: hasError must be calculated
        },
    } };
    newFaramValues = update(newFaramValues, errorSettings);

    switch (info.action) {
        case 'newEntry':
            console.warn('Should create new entry');
            break;
        case 'editEntry': {
            const excerptSettings = {
                data: {
                    entryType: { $set: info.entryType },
                    excerpt: { $set: info.excerpt },
                    image: { $set: info.image },
                },
            };
            newFaramValues = update(newFaramValues, excerptSettings);
            break;
        } case undefined:
            break;
        default:
            console.error('Unrecognized action');
    }

    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    [entryIndex]: { $set: newFaramValues },
                },
            },
        },
    };

    return update(state, settings);
};

const setEntryError = (state, action) => {
    const { leadId, key, errors } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const entryIndex = entries.findIndex(
        entry => entryAccessor.key(entry) === key,
    );

    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        localData: {
                            error: { $set: errors },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const reducers = {
    [EEB__SET_LEAD]: setLead,
    [EEB__SET_ENTRIES]: setEntries,
    [EEB__CLEAR_ENTRIES]: clearEntries,
    [EEB__SET_SELECTED_ENTRY_KEY]: setSelectedEntryKey,
    [EEB__SET_ENTRY_EXCERPT]: setEntryExcerpt,
    [EEB__SET_ENTRY_DATA]: setEntryData,
    [EEB__SET_ENTRY_ERROR]: setEntryError,
};
export default reducers;
