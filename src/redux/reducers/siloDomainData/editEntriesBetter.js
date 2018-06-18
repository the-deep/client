import update from '#rs/utils/immutable-update';
import {
    calcNewEntries,
} from '#entities/entry';

// TYPE

export const EEB__SET_ACTIVE_ENTRY = 'siloDomainData/EEB__SET_ACTIVE_ENTRY';
export const EEB__ENTRY_CHANGE = 'siloDomainData/EEB__ENTRY_CHANGE';
export const EEB__ENTRY_DIFF = 'siloDomainData/EEB__ENTRY_DIFF';
export const EEB_REMOVE_ALL_ENTRIES = 'siloDomainData/EEB_REMOVE_ALL_ENTRIES';

// CREATOR

export const changeEntryAction = ({ leadId, entryId, data, values, colors, uiState }) => ({
    type: EEB__ENTRY_CHANGE,
    leadId,
    entryId,
    data,
    values,
    colors,
    uiState,
});

export const diffEntriesAction = ({ leadId, diffs }) => ({
    type: EEB__ENTRY_DIFF,
    leadId,
    diffs,
});

export const setActiveEntryAction = ({ leadId, entryId }) => ({
    type: EEB__SET_ACTIVE_ENTRY,
    leadId,
    entryId,
});

// HELPER

const getIdFromEntry = e => e.data.id;

const getEntriesByLeadId = (editEntry, leadId) => (
    editEntry[leadId].entries
);
const getSelectedEntryIdByLeadId = (editEntry, leadId) => (
    editEntry[leadId].selectedEntryId
);
const getEntryIndexByEntryId = (editEntry, leadId, entryId) => {
    const entries = getEntriesByLeadId(editEntry, leadId);
    return entries.findIndex(e => getIdFromEntry(e) === entryId);
};
const getEntryByEntryId = (editEntry, leadId, entryId) => {
    const entries = getEntriesByLeadId(editEntry, leadId);
    return entries.find(e => getIdFromEntry(e) === entryId);
};

// REDUCER

const editEntryChangeEntry = (state, action) => {
    const { editEntryBetter } = state;
    const {
        leadId,
        entryId,

        data = {},
        values = {},
        colors = {},
        uiState = {},
    } = action;

    const entryIndex = getEntryIndexByEntryId(editEntryBetter, leadId, entryId);

    const settings = {
        editEntryBetter: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: { $merge: data },
                        widget: {
                            values: { $merge: values },
                            colors: { $auto: { $merge: colors } },
                        },
                        uiState: { $merge: uiState },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const editEntryDiffEntries = (state, action) => {
    const { editEntryBetter } = state;
    const {
        leadId,
        diffs,
    } = action;

    const localEntries = getEntriesByLeadId(editEntryBetter, leadId);
    // Create new entires by applying diff on local entries
    const newEntries = calcNewEntries(localEntries, diffs);

    // If last selected was deleted in newEntries,
    // then set the first item as selected
    const selectedEntryId = getSelectedEntryIdByLeadId(editEntryBetter, leadId);
    const selectedEntry = newEntries.find(entry => getIdFromEntry(entry) === selectedEntryId);

    let newSelectedEntryId = selectedEntryId;
    // If selectedEntry is not found, set new selection to first of newEntries
    if (!selectedEntry) {
        newSelectedEntryId = newEntries.length > 0 ? getIdFromEntry(newEntries[0]) : undefined;
    }

    const settings = {
        editEntryBetter: {
            [leadId]: {
                entries: { $set: newEntries },
                selectedEntryId: { $set: newSelectedEntryId },
            },
        },
    };
    return update(state, settings);
};

const editEntrySetActiveEntry = (state, action) => {
    // const { editEntryBetter } = state;
    const { leadId, entryId } = action;

    /*
    const entry = getEntryByEntryId(editEntryBetter, leadId, entryId);
    if (entry.markedForDelete) {
        return state;
    }
    */

    const settings = {
        editEntryBetter: {
            [leadId]: {
                selectedEntryId: {
                    $set: entryId,
                },
            },
        },
    };
    return update(state, settings);
};

const editEntryRemoveAllEntries = (state, action) => {
    const { leadId } = action;

    const settings = {
        editEntryBetter: {
            [leadId]: {
                selectedEntryId: { $set: undefined },
                entries: {
                    $set: [],
                },
            },
        },
    };
    return update(state, settings);
};


// REDUCER MAP

const reducers = {
    [EEB__SET_ACTIVE_ENTRY]: editEntrySetActiveEntry,
    [EEB__ENTRY_CHANGE]: editEntryChangeEntry,
    [EEB__ENTRY_DIFF]: editEntryDiffEntries,
    [EEB_REMOVE_ALL_ENTRIES]: editEntryRemoveAllEntries,
};
export default reducers;
