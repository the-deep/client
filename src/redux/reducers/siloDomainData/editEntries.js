import { analyzeErrors } from '@togglecorp/faram';
import {
    isFalsy,
    randomString,
    getDefinedElementAround,
    formatPdfText,
} from '@togglecorp/fujs';
import produce from 'immer';

import {
    applyDiff,
    entryAccessor,
    createEntry,
    createEntryGroup,
    entryGroupAccessor,
} from '#entities/editEntries';

import update from '#rsu/immutable-update';

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
export const EEB__UPDATE_ENTRIES_BULK = 'siloDomainData/EEB__UPDATE_ENTRIES_BULK';
export const EEB__CLEAR_ENTRIES = 'siloDomainData/EEB__CLEAR_ENTRIES';

export const EEB__SET_ENTRIES_COMMENTS_COUNT = 'siloDomainData/EEB__SET_ENTRIES_COMMENTS_COUNT';
export const EEB__SET_ENTRY_COMMENTS_COUNT = 'siloDomainData/EEB__SET_ENTRY_COMMENTS_COUNT';
export const EEB__SET_ENTRIES_CONTROL_STATUS = 'siloDomainData/EEB__SET_ENTRIES_CONTROL_STATUS';
export const EEB__SET_ENTRY_CONTROL_STATUS = 'siloDomainData/EEB__SET_ENTRY_CONTROL_STATUS';

export const EEB__SET_SELECTED_ENTRY_KEY = 'siloDomainData/EEB__SET_SELECTED_ENTRY_KEY';

export const EEB__SET_ENTRY_EXCERPT = 'siloDomainData/EEB__SET_ENTRY_EXCERPT';
export const EEB__RESET_ENTRY_EXCERPT = 'siloDomainData/EEB__RESET_ENTRY_EXCERPT';
export const EEB__SET_ENTRY_DATA = 'siloDomainData/EEB__SET_ENTRY_DATA';
export const EEB__SET_ENTRY_ERROR = 'siloDomainData/EEB__SET_ENTRY_ERROR';
export const EEB__ADD_ENTRY = 'siloDomainData/EEB__ADD_ENTRY';
export const EEB__REMOVE_ENTRY = 'siloDomainData/EEB__REMOVE_ENTRY';
export const EEB__MARK_AS_DELETED_ENTRY = 'siloDomainData/EEB__MARK_AS_DELETED_ENTRY';
export const EEB__APPLY_TO_ALL_ENTRIES = 'siloDomainData/EEB__APPLY_TO_ALL_ENTRIES';
export const EEB__APPLY_TO_ALL_ENTRIES_BELOW = 'siloDomainData/EEB__APPLY_TO_ALL_ENTRIES_BELOW';
export const EEB__FORMAT_ALL_ENTRIES = 'siloDomainData/EEB__FORMAT_ALL_ENTRIES';
export const EEB__SAVE_ENTRY = 'siloDomainData/EEB__SAVE_ENTRY';

export const EEB__SET_PENDING = 'siloDomainData/EEB__SET_PENDING';
export const EEB__RESET_UI_STATE = 'siloDomainData/EEB__RESET_UI_STATE';
export const EEB__SET_ENTRY_HIGHLIGHT_HIDDEN = 'siloDomainData/EEB__SET_ENTRY_HIGHLIGHT_HIDDEN';

export const editEntriesSetEntryHighlightHidden = ({ leadId, key, value }) => ({
    type: EEB__SET_ENTRY_HIGHLIGHT_HIDDEN,
    leadId,
    key,
    value,
});


// NOTE: these are added newly
const EEB__SET_ENTRY_GROUPS = 'siloDomainData/EEB__SET_ENTRY_GROUPS';
const EEB__CLEAR_ENTRY_GROUPS = 'siloDomainData/EEB__CLEAR_ENTRY_GROUPS';
const EEB__ADD_ENTRY_GROUP = 'siloDomainData/EEB__ADD_ENTRY_GROUP';
const EEB__REMOVE_ENTRY_GROUP = 'siloDomainData/EEB__REMOVE_ENTRY_GROUP';
const EEB__MARK_AS_DELETED_ENTRY_GROUP = 'siloDomainData/EEB__MARK_AS_DELETED_ENTRY_GROUP';
const EEB__SAVE_ENTRY_GROUP = 'siloDomainData/EEB__SAVE_ENTRY_GROUP';
const EEB__SET_ENTRY_GROUP_PENDING = 'siloDomainData/EEB__SET_ENTRY_GROUP_PENDING';
const EEB__RESET_ENTRY_GROUP_UI_STATE = 'siloDomainData/EEB__RESET_ENTRY_GROUP_UI_STATE';
const EEB__SET_LABELS = 'siloDomainData/EEB__SET_LABELS';
const EEB__SET_ENTRY_GROUP_SELECTION = 'siloDomainData/EEB__SET_ENTRY_GROUP_SELECTION';
const EEB__CLEAR_ENTRY_GROUP_SELECTION = 'siloDomainData/EEB__CLEAR_ENTRY_GROUP_SELECTION';
const EEB__SET_ENTRY_GROUP_DATA = 'siloDomainData/EEB__SET_ENTRY_GROUP_DATA';
export const EEB__SET_ENTRY_GROUP_ERROR = 'siloDomainData/EEB__SET_ENTRY_GROUP_ERROR';

export const editEntriesSaveEntryAction = ({ leadId, entryKey, response, color }) => ({
    type: EEB__SAVE_ENTRY,
    leadId,
    entryKey,
    response,
    color,
});

export const editEntriesSetPendingAction = ({ leadId, entryKey, pending }) => ({
    type: EEB__SET_PENDING,
    leadId,
    entryKey,
    pending,
});

export const editEntriesApplyToAllEntriesAction = ({
    leadId, key, value, entryKey, modifiable,
}) => ({
    type: EEB__APPLY_TO_ALL_ENTRIES,
    leadId,
    key,
    value,
    entryKey,
    modifiable,
});

export const editEntriesApplyToAllEntriesBelowAction = ({
    leadId, key, value, entryKey, modifiable,
}) => ({
    type: EEB__APPLY_TO_ALL_ENTRIES_BELOW,
    leadId,
    key,
    value,
    entryKey,
    modifiable,
});

export const editEntriesFormatAllEntriesAction = ({ leadId, modifiable }) => ({
    type: EEB__FORMAT_ALL_ENTRIES,
    leadId,
    modifiable,
});

export const editEntriesAddEntryAction = ({
    leadId,
    entry,
    dropped,
    imageDetails,
}) => ({
    type: EEB__ADD_ENTRY,
    leadId,
    entry,
    dropped,
    imageDetails,
});

export const editEntriesRemoveEntryAction = ({ leadId, key }) => ({
    type: EEB__REMOVE_ENTRY,
    leadId,
    key,
});

export const editEntriesSetLeadAction = ({ lead }) => ({
    type: EEB__SET_LEAD,
    lead,
});

export const editEntriesSetEntriesAction = ({ leadId, entryActions }) => ({
    type: EEB__SET_ENTRIES,
    entryActions,
    leadId,
});

export const editEntriesSetEntriesCommentsCountAction = ({ entries, leadId }) => ({
    type: EEB__SET_ENTRIES_COMMENTS_COUNT,
    entries,
    leadId,
});

export const editEntriesSetEntriesControlStatusAction = ({
    updateVersionId,
    entries,
    leadId,
}) => ({
    type: EEB__SET_ENTRIES_CONTROL_STATUS,
    entries,
    leadId,
    updateVersionId,
});

export const editEntriesSetEntryControlStatusAction = ({ entry, leadId }) => ({
    type: EEB__SET_ENTRY_CONTROL_STATUS,
    entry,
    leadId,
});

export const editEntriesSetEntryCommentsCountAction = ({ entry, leadId }) => ({
    type: EEB__SET_ENTRY_COMMENTS_COUNT,
    entry,
    leadId,
});

export const editEntriesUpdateEntriesBulkAction = ({ leadId, bulkData }) => ({
    type: EEB__UPDATE_ENTRIES_BULK,
    leadId,
    bulkData,
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

export const editEntriesResetExcerptAction = ({ leadId, key }) => ({
    type: EEB__RESET_ENTRY_EXCERPT,
    leadId,
    key,
});

export const editEntriesSetExcerptAction = ({
    leadId, key, excerptValue, excerptType, dropped,
}) => ({
    type: EEB__SET_ENTRY_EXCERPT,
    leadId,
    key,
    excerptType,
    excerptValue,
    dropped,
});

export const editEntriesSetEntryDataAction = ({ leadId, key, values, errors, info, color }) => ({
    type: EEB__SET_ENTRY_DATA,
    leadId,
    key,
    values,
    errors,
    info,
    color,
});

export const editEntriesSetEntryErrorsAction = ({ leadId, key, errors, isServerError }) => ({
    type: EEB__SET_ENTRY_ERROR,
    leadId,
    key,
    errors,
    isServerError,
});

export const editEntriesMarkAsDeletedEntryAction = ({ leadId, key, value }) => ({
    type: EEB__MARK_AS_DELETED_ENTRY,
    leadId,
    key,
    value,
});


export const editEntriesResetUiStateAction = leadId => ({
    type: EEB__RESET_UI_STATE,
    leadId,
});

export const editEntriesSetLabelsAction = ({ leadId, labels }) => ({
    type: EEB__SET_LABELS,
    leadId,
    labels,
});

export const editEntriesSetEntryGroupsAction = ({ leadId, entryGroupActions }) => ({
    type: EEB__SET_ENTRY_GROUPS,
    entryGroupActions,
    leadId,
});

export const editEntriesMarkAsDeletedEntryGroupAction = ({ leadId, key, value }) => ({
    type: EEB__MARK_AS_DELETED_ENTRY_GROUP,
    leadId,
    key,
    value,
});

export const editEntriesResetEntryGroupUiStateAction = leadId => ({
    type: EEB__RESET_ENTRY_GROUP_UI_STATE,
    leadId,
});

export const editEntriesEntryGroupsClearEntriesAction = ({ leadId }) => ({
    type: EEB__CLEAR_ENTRY_GROUPS,
    leadId,
});

export const editEntriesRemoveEntryGroupAction = ({ leadId, key }) => ({
    type: EEB__REMOVE_ENTRY_GROUP,
    leadId,
    key,
});

export const editEntriesAddEntryGroupAction = ({ entryGroup, leadId }) => ({
    type: EEB__ADD_ENTRY_GROUP,
    leadId,
    entryGroup,
});

export const editEntriesSetEntryGroupSelectionAction = ({ leadId, entryGroupKey, selection }) => ({
    type: EEB__SET_ENTRY_GROUP_SELECTION,
    leadId,
    entryGroupKey,
    selection,
});

export const editEntriesClearEntryGroupSelectionAction = ({ leadId, entryGroupKey, labelId }) => ({
    type: EEB__CLEAR_ENTRY_GROUP_SELECTION,
    leadId,
    entryGroupKey,
    labelId,
});

export const editEntriesSetEntryGroupPendingAction = ({ leadId, entryGroupKey, pending }) => ({
    type: EEB__SET_ENTRY_GROUP_PENDING,
    leadId,
    entryGroupKey,
    pending,
});

export const editEntriesSetEntryGroupDataAction = ({ leadId, entryGroupKey, data }) => ({
    type: EEB__SET_ENTRY_GROUP_DATA,
    leadId,
    entryGroupKey,
    data,
});

export const editEntriesSetEntryGroupErrorsAction = ({ leadId, key, errors, isServerError }) => ({
    type: EEB__SET_ENTRY_GROUP_ERROR,
    leadId,
    key,
    errors,
    isServerError,
});

export const editEntriesSaveEntryGroupAction = ({ leadId, entryGroupKey, response }) => ({
    type: EEB__SAVE_ENTRY_GROUP,
    leadId,
    entryGroupKey,
    response,
});

// ACTION-CREATOR
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

const setLabels = (state, action) => {
    const { labels, leadId } = action;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                labels: { $set: labels },
            } },
        } },
    };
    return update(state, settings);
};

const setEntriesCommentsCount = (state, action) => {
    const {
        leadId,
        entries: entriesFromServer,
    } = action;

    const {
        editEntries: {
            [leadId]: {
                entries = [],
            } = {},
        } = {},
    } = state;

    const newState = produce(state, (safeState) => {
        if (!safeState.editEntries) {
            // eslint-disable-next-line no-param-reassign
            safeState.editEntries = {};
        }
        if (!safeState.editEntries[leadId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.editEntries[leadId] = {};
        }
        if (!safeState.editEntries[leadId].entries) {
            // eslint-disable-next-line no-param-reassign
            safeState.editEntries[leadId].entries = [];
        }
        entriesFromServer.forEach((es) => {
            const index = entries.findIndex(e => es.id === entryAccessor.serverId(e));

            if (index > -1) {
                const safeEntry = safeState.editEntries[leadId].entries[index];
                // eslint-disable-next-line no-param-reassign
                safeEntry.serverData.unresolvedCommentCount = es.unresolvedCommentCount;

                // eslint-disable-next-line no-param-reassign
                safeEntry.serverData.resolvedCommentCount = es.resolvedCommentCount;
            }
        });
    });

    return newState;
};

const setEntryCommentsCount = (state, action) => {
    const {
        leadId,
        entry,
    } = action;

    const {
        editEntries: {
            [leadId]: {
                entries = [],
            } = {},
        } = {},
    } = state;

    const newState = produce(state, (safeState) => {
        if (!safeState.editEntries) {
            // eslint-disable-next-line no-param-reassign
            safeState.editEntries = {};
        }
        if (!safeState.editEntries[leadId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.editEntries[leadId] = {};
        }
        if (!safeState.editEntries[leadId].entries) {
            // eslint-disable-next-line no-param-reassign
            safeState.editEntries[leadId].entries = [];
        }
        const index = entries.findIndex(e => entry.entryId === entryAccessor.serverId(e));
        if (index > -1) {
            // eslint-disable-next-line no-param-reassign
            safeState.editEntries[leadId].entries[index]
                .serverData.unresolvedCommentCount = entry.unresolvedCommentCount;

            // eslint-disable-next-line no-param-reassign
            safeState.editEntries[leadId].entries[index]
                .serverData.resolvedCommentCount = entry.resolvedCommentCount;
        }
    });

    return newState;
};

const setEntriesControlStatus = (state, action) => {
    const {
        leadId,
        entries: entriesFromServer,
        updateVersionId = false,
    } = action;

    const entries = state?.editEntries[leadId]?.entries ?? [];

    const newState = produce(state, (safeState) => {
        if (!safeState.editEntries) {
            // eslint-disable-next-line no-param-reassign
            safeState.editEntries = {};
        }
        if (!safeState.editEntries[leadId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.editEntries[leadId] = {};
        }
        if (!safeState.editEntries[leadId].entries) {
            // eslint-disable-next-line no-param-reassign
            safeState.editEntries[leadId].entries = [];
        }
        entriesFromServer.forEach((es) => {
            const index = entries.findIndex(e => es.id === entryAccessor.serverId(e));

            if (index > -1) {
                const safeEntry = safeState.editEntries[leadId].entries[index];
                // eslint-disable-next-line no-param-reassign
                safeEntry.serverData.controlled = es.controlled;

                if (updateVersionId) {
                    // eslint-disable-next-line no-param-reassign
                    safeEntry.serverData.versionId = es.versionId;
                }
            }
        });
    });

    return newState;
};

const setEntryControlStatus = (state, action) => {
    const {
        leadId,
        entry,
    } = action;

    const newAction = {
        leadId,
        entries: [entry],
        updateVersionId: true,
    };

    return setEntriesControlStatus(state, newAction);
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

const updateEntriesBulk = (state, action) => {
    const { leadId, bulkData } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    if (entries.length === 0 || Object.keys(bulkData).length === 0) {
        return state;
    }

    const entriesSettings = Object.keys(bulkData).reduce(
        (acc, key) => {
            const { localData = {}, data = {} } = bulkData[key];

            const entryIndex = entries.findIndex(
                entry => entryAccessor.key(entry) === key,
            );

            acc[entryIndex] = { $auto: {
                localData: { $auto: {
                    $merge: localData,
                } },
                data: { $auto: {
                    $merge: data,
                } },
            } };

            return acc;
        },
        {},
    );

    const settings = {
        editEntries: {
            [leadId]: {
                entries: entriesSettings,
            },
        },
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
    const { leadId, key, excerptType, excerptValue, dropped } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const excerpt = excerptType === 'excerpt' ? excerptValue : undefined;
    const image = excerptType === 'image' ? excerptValue : undefined;
    const tabularField = excerptType === 'dataSeries' ? excerptValue : undefined;

    const entryIndex = entries.findIndex(entry => entryAccessor.key(entry) === key);
    const entry = entries[entryIndex];

    const droppedExcerpt = excerptType === 'excerpt' && dropped
        ? excerptValue
        : entry.data.droppedExcerpt;

    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: {
                            entryType: { $set: excerptType },
                            excerpt: { $set: excerpt },
                            droppedExcerpt: { $set: droppedExcerpt },
                            image: { $set: image },
                            tabularField: { $set: tabularField },
                        },
                        localData: {
                            isPristine: { $set: false },
                            hasServerError: { $set: false },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const resetEntryExcerpt = (state, action) => {
    const { leadId, key } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const entryIndex = entries.findIndex(entry => entryAccessor.key(entry) === key);
    const entry = entries[entryIndex];
    const { droppedExcerpt } = entryAccessor.data(entry);

    // NOTE: currently this only works for text type excerpt

    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: {
                            excerpt: { $set: droppedExcerpt },
                        },
                        localData: {
                            isPristine: { $set: false },
                            hasServerError: { $set: false },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const addEntry = (state, action) => {
    const {
        entry,
        leadId,
        dropped,
        imageDetails,
    } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const {
        excerptType,
        excerptValue,
        color,
        ...otherEntry
    } = entry;

    // Add order to entries during creation
    const maxEntryOrder = entries.reduce(
        (acc, e) => {
            const val = entryAccessor.data(e) || {};
            const entryOrder = val.order;
            if (isFalsy(entryOrder)) {
                return acc;
            }
            return Math.max(acc, entryOrder);
        },
        0,
    );

    // Create data for new entry
    const newData = {
        ...otherEntry,
        entryType: excerptType,
        excerpt: excerptType === 'excerpt' ? excerptValue : undefined,
        droppedExcerpt: excerptType === 'excerpt' && dropped ? excerptValue : undefined,
        imageRaw: (excerptType === 'image' && !dropped) ? excerptValue : undefined,
        leadImage: (excerptType === 'image' && dropped) ? excerptValue : undefined,
        tabularField: excerptType === 'dataSeries' ? excerptValue : undefined,
        lead: leadId,
        order: maxEntryOrder + 1,
        imageDetails,
    };

    // Get random key for new entry
    const localId = randomString(16);

    const newEntry = createEntry({
        key: localId,
        data: newData,
        color,
    });

    const settings = {
        editEntries: {
            [leadId]: { $auto: {
                selectedEntryKey: { $set: localId },
                entries: { $autoArray: {
                    $push: [newEntry],
                } },
            } },
        },
    };
    return update(state, settings);
};

const setEntryHighlightHidden = (state, action) => {
    const { leadId, key, value } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const entryIndex = entries.findIndex(
        entry => entryAccessor.key(entry) === key,
    );

    let newState = state;

    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: {
                            highlightHidden: {
                                $set: value,
                            },
                        },
                        localData: {
                            isPristine: { $set: false },
                        },
                    },
                },
            },
        },
    };
    newState = update(newState, settings);

    return newState;
};

const setEntryData = (state, action) => {
    const { leadId, key, values, errors, color /* , info */ } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const entryIndex = entries.findIndex(
        entry => entryAccessor.key(entry) === key,
    );

    let newState = state;

    /*
    // NOTE: I don't think this has been used anywhere
    if (info.action === 'changeExcerpt') {
        const excerpt = info.type === 'excerpt' ? info.value : undefined;
        const image = info.type === 'image' ? info.value : undefined;
        const tabularField = info.type === 'dataSeries' ? info.value : undefined;

        const settings = {
            editEntries: {
                [leadId]: {
                    entries: {
                        [entryIndex]: {
                            data: {
                                entryType: { $set: info.type },
                                excerpt: { $set: excerpt },
                                image: { $set: image },
                                tabularField: { $set: tabularField },
                            },
                            localData: {
                                isPristine: { $set: false },
                                hasServerError: { $set: false },
                            },
                        },
                    },
                },
            },
        };

        newState = update(newState, settings);
    }
    */

    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: {
                            attributes: {
                                $set: values,
                            },
                        },
                        localData: {
                            isPristine: { $set: false },
                            error: { $set: errors },
                            hasError: { $set: analyzeErrors(errors) },
                            hasServerError: { $set: false },
                            color: { $set: color },
                        },
                    },
                },
            },
        },
    };
    newState = update(newState, settings);

    return newState;
};

const setEntryError = (state, action) => {
    const { leadId, key, errors, isServerError } = action;
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
                            $if: [
                                isServerError,
                                {
                                    hasServerError: { $set: true },
                                },
                                {
                                    error: { $set: errors },
                                    hasError: { $set: analyzeErrors(errors) },
                                    hasServerError: { $set: false },
                                },
                            ],
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const removeEntry = (state, action) => {
    const { leadId, key } = action;
    // NOTE: no need to get new selectedEntryKey
    // a new selectedEntryKey is calculated on mark as delete
    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    $filter: entry => entryAccessor.key(entry) !== key,
                },
            },
        },
    };
    return update(state, settings);
};

const removeEntryGroup = (state, action) => {
    const { leadId, key } = action;
    const settings = {
        editEntries: {
            [leadId]: {
                entryGroups: {
                    $filter: entryGroup => entryGroupAccessor.key(entryGroup) !== key,
                },
            },
        },
    };
    return update(state, settings);
};

const markAsDeletedEntry = (state, action) => {
    const { leadId, key, value } = action;
    const {
        editEntries: { [leadId]: { entries = [], selectedEntryKey } = {} } = {},
    } = state;

    const entryIndex = entries.findIndex(
        entry => entryAccessor.key(entry) === key,
    );

    let newSelectedEntryKey = selectedEntryKey;
    if (value) {
        const filteredEntries = entries.map(
            e => (
                entryAccessor.isMarkedAsDeleted(e) || entryAccessor.key(e) === selectedEntryKey
                    ? undefined
                    : e
            ),
        );
        if (filteredEntries[entryIndex] === undefined) {
            const newSelectedEntry = getDefinedElementAround(filteredEntries, entryIndex);
            newSelectedEntryKey = newSelectedEntry
                ? entryAccessor.key(newSelectedEntry)
                : undefined;
        }
    } else {
        newSelectedEntryKey = key;
    }

    const settings = {
        editEntries: {
            [leadId]: {
                selectedEntryKey: { $set: newSelectedEntryKey },
                entries: {
                    [entryIndex]: {
                        localData: {
                            isPristine: { $set: false },
                            isMarkedAsDeleted: { $set: value },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const applyToAllEntries = mode => (state, action) => {
    // attribute key and value
    const { leadId, key, value, entryKey, modifiable } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const settings = {
        editEntries: {
            [leadId]: {
                entries: {},
            },
        },
    };

    // NOTE: setting entry to undefined instead of using filter to preserve index
    let iterableEntries;
    if (mode === 'all-below') {
        const entryIndex = entries.findIndex(entry => entryAccessor.key(entry) === entryKey);
        console.warn(entryIndex);
        // set all entries before current entry to undefined
        iterableEntries = entries.map((entry, i) => (i < entryIndex ? undefined : entry));
    } else if (mode === 'all') {
        iterableEntries = entries;
    }
    const stringifiedValue = JSON.stringify(value);
    iterableEntries = iterableEntries.map((entry) => {
        if (
            entry === undefined ||
            // set current entry to undefined
            key === entryAccessor.key(entry) ||
            // deep compare data and set same elements to undefined
            JSON.stringify(entryAccessor.dataAttribute(entry, key)) === stringifiedValue
        ) {
            return undefined;
        }
        return entry;
    });

    iterableEntries.forEach((entry, i) => {
        if (entry === undefined) {
            return;
        } else if (!modifiable && !!entryAccessor.serverId(entry)) {
            return;
        }

        settings.editEntries[leadId].entries[i] = {
            data: {
                attributes: { $auto: {
                    [key]: { $auto: {
                        data: { $set: value },
                    } },
                } },
            },
            localData: {
                isPristine: { $set: false },
                error: { $auto: {
                    attributes: { $auto: {
                        [key]: { $auto: {
                            data: { $set: undefined },
                        } },
                    } },
                } },
                hasServerError: { $set: false },
            },
        };
    });
    const newState = update(state, settings);

    // TODO: this may have been rendered useless
    // re-calculate errors
    const newSettings = {
        editEntries: {
            [leadId]: {
                entries: {},
            },
        },
    };

    const {
        editEntries: { [leadId]: { entries: newEntries = [] } = {} } = {},
    } = newState;

    newEntries.forEach((entry, i) => {
        const { localData: { error } = {} } = entry || {};
        settings.editEntries[leadId].entries[i] = {
            localData: {
                hasError: { $set: analyzeErrors(error) },
            },
        };
    });

    return update(newState, newSettings);
};

const setPending = (state, action) => {
    const { leadId, entryKey, pending } = action;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entryRests: { $auto: {
                    [entryKey]: { $set: pending },
                } },
            } },
        } },
    };
    return update(state, settings);
};

const saveEntry = (state, action) => {
    const { leadId, entryKey, response, color } = action;

    // NOTE: create new entry from remote entry
    const remoteEntry = response;
    const {
        id: remoteServerId,
        versionId: remoteVersionId,
    } = remoteEntry;

    const newEntry = createEntry({
        key: entryKey,
        serverId: remoteServerId,
        versionId: remoteVersionId,
        data: remoteEntry,
        isPristine: true,
        hasError: false,
        color,
    });

    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;
    const entryIndex = entries.findIndex(
        entry => entryAccessor.key(entry) === entryKey,
    );

    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entries: { $auto: {
                    [entryIndex]: { $set: newEntry },
                } },
            } },
        } },
    };

    return update(state, settings);
};

const editEntriesResetUiState = (state, { leadId }) => {
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                $unset: ['entryRests'],
            } },
        } },
    };
    return update(state, settings);
};

const formatAllEntries = (state, { leadId, modifiable }) => {
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;
    const settings = {
        editEntries: {
            [leadId]: {
                entries: {},
            },
        },
    };
    entries.forEach((entry, i) => {
        if (entry.data.entryType !== 'excerpt') {
            return;
        } else if (!modifiable && !!entryAccessor.serverId(entry)) {
            return;
        }

        const newExcerpt = formatPdfText(entry.data.excerpt);
        if (entry.data.excerpt === newExcerpt) {
            return;
        }
        settings.editEntries[leadId].entries[i] = {
            data: {
                excerpt: {
                    $set: newExcerpt,
                },
            },
            localData: {
                isPristine: { $set: false },
                hasServerError: { $set: false },
            },
        };
    });
    return update(state, settings);
};

const setEntryGroups = (state, action) => {
    const { leadId, entryGroupActions } = action;
    const {
        editEntries: {
            [leadId]: {
                entryGroups = [],
            },
        },
    } = state;
    const newEntryGroups = applyDiff(entryGroups, entryGroupActions, entryGroupAccessor);
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entryGroups: { $set: newEntryGroups },
            } },
        } },
    };
    return update(state, settings);
};

const markAsDeletedEntryGroup = (state, action) => {
    const { leadId, key, value } = action;
    const {
        editEntries: { [leadId]: { entryGroups = [] } = {} } = {},
    } = state;

    const entryGroupIndex = entryGroups.findIndex(
        entryGroup => entryGroupAccessor.key(entryGroup) === key,
    );

    const settings = {
        editEntries: {
            [leadId]: {
                entryGroups: {
                    [entryGroupIndex]: {
                        localData: {
                            isPristine: { $set: false },
                            isMarkedAsDeleted: { $set: value },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const resetEntryGroupUiState = (state, { leadId }) => {
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                $unset: ['entryGroupRests'],
            } },
        } },
    };
    return update(state, settings);
};

const clearEntryGroups = (state, action) => {
    const { leadId } = action;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entryGroups: { $set: [] },
            } },
        } },
    };
    return update(state, settings);
};

const addEntryGroup = (state, action) => {
    const { entryGroup, leadId } = action;
    const {
        editEntries: { [leadId]: { entryGroups = [] } = {} } = {},
    } = state;

    // Add order to entries during creation
    const maxEntryOrder = entryGroups.reduce(
        (acc, e) => {
            const val = entryGroupAccessor.data(e) || {};
            const entryOrder = val.order;
            if (isFalsy(entryOrder)) {
                return acc;
            }
            return Math.max(acc, entryOrder);
        },
        0,
    );

    // Create data for new entry
    const newData = {
        ...entryGroup,
        order: maxEntryOrder + 1,
    };

    // Get random key for new entry
    const localId = randomString(16);

    const newEntryGroup = createEntryGroup({
        key: localId,
        data: newData,
    });

    const settings = {
        editEntries: {
            [leadId]: { $auto: {
                entryGroups: { $autoArray: {
                    $push: [newEntryGroup],
                } },
            } },
        },
    };
    return update(state, settings);
};

const setEntryGroupSelection = (state, action) => {
    const { leadId, entryGroupKey, selection } = action;

    const {
        editEntries: { [leadId]: { entryGroups = [] } = {} } = {},
    } = state;

    const entryGroupIndex = entryGroups.findIndex(
        g => entryGroupAccessor.key(g) === entryGroupKey,
    );

    const settings = {
        editEntries: {
            [leadId]: {
                entryGroups: {
                    [entryGroupIndex]: {
                        localData: {
                            isPristine: { $set: false },
                            error: { $set: undefined },
                            hasError: { $set: false },
                            hasServerError: { $set: false },
                        },
                        data: {
                            selections: {
                                $replaceOrPush: [
                                    s => s.labelId === selection.labelId,
                                    (oldSelection) => {
                                        if (!oldSelection) {
                                            return selection;
                                        }
                                        return {
                                            ...oldSelection,
                                            ...selection,
                                        };
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const setEntryGroupData = (state, action) => {
    const { leadId, entryGroupKey, data } = action;

    const {
        editEntries: { [leadId]: { entryGroups = [] } = {} } = {},
    } = state;

    const entryGroupIndex = entryGroups.findIndex(
        g => entryGroupAccessor.key(g) === entryGroupKey,
    );

    const settings = {
        editEntries: {
            [leadId]: {
                entryGroups: {
                    [entryGroupIndex]: {
                        localData: {
                            isPristine: { $set: false },
                            error: { $set: undefined },
                            hasError: { $set: false },
                            hasServerError: { $set: false },
                        },
                        data: {
                            title: { $set: data.title },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const clearEntryGroupSelection = (state, action) => {
    const { leadId, entryGroupKey, labelId } = action;

    const {
        editEntries: { [leadId]: { entryGroups = [] } = {} } = {},
    } = state;

    const entryGroupIndex = entryGroups.findIndex(
        g => entryGroupAccessor.key(g) === entryGroupKey,
    );

    const settings = {
        editEntries: {
            [leadId]: {
                entryGroups: {
                    [entryGroupIndex]: {
                        localData: {
                            isPristine: { $set: false },
                            error: { $set: undefined },
                            hasError: { $set: false },
                            hasServerError: { $set: false },
                        },
                        data: {
                            selections: {
                                $filter: s => s.labelId !== labelId,
                            },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const setEntryGroupPending = (state, action) => {
    const { leadId, entryGroupKey, pending } = action;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entryGroupRests: { $auto: {
                    [entryGroupKey]: { $set: pending },
                } },
            } },
        } },
    };
    return update(state, settings);
};

const setEntryGroupError = (state, action) => {
    const { leadId, key, errors, isServerError } = action;
    const {
        editEntries: { [leadId]: { entryGroups = [] } = {} } = {},
    } = state;

    const entryGroupIndex = entryGroups.findIndex(
        entryGroup => entryGroupAccessor.key(entryGroup) === key,
    );

    const settings = {
        editEntries: {
            [leadId]: {
                entryGroups: {
                    [entryGroupIndex]: {
                        localData: {
                            $if: [
                                isServerError,
                                {
                                    hasServerError: { $set: true },
                                },
                                {
                                    error: { $set: errors },
                                    hasError: { $set: analyzeErrors(errors) },
                                    hasServerError: { $set: false },
                                },
                            ],
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};


const saveEntryGroup = (state, action) => {
    const { leadId, entryGroupKey, response, color } = action;

    // NOTE: create new entryGroup from remote entryGroup
    const remoteEntryGroup = response;
    const {
        id: remoteServerId,
        versionId: remoteVersionId,
    } = remoteEntryGroup;

    const newEntryGroup = createEntryGroup({
        key: entryGroupKey,
        serverId: remoteServerId,
        versionId: remoteVersionId,
        data: remoteEntryGroup,
        isPristine: true,
        hasError: false,
        color,
    });

    const {
        editEntries: { [leadId]: { entryGroups = [] } = {} } = {},
    } = state;

    const entryGroupIndex = entryGroups.findIndex(
        entryGroup => entryGroupAccessor.key(entryGroup) === entryGroupKey,
    );

    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entryGroups: { $auto: {
                    [entryGroupIndex]: { $set: newEntryGroup },
                } },
            } },
        } },
    };

    return update(state, settings);
};

const reducers = {
    [EEB__SET_LEAD]: setLead,
    [EEB__SET_ENTRIES]: setEntries,
    [EEB__SET_ENTRIES_COMMENTS_COUNT]: setEntriesCommentsCount,
    [EEB__SET_ENTRIES_CONTROL_STATUS]: setEntriesControlStatus,
    [EEB__SET_ENTRY_COMMENTS_COUNT]: setEntryCommentsCount,
    [EEB__SET_ENTRY_CONTROL_STATUS]: setEntryControlStatus,
    [EEB__UPDATE_ENTRIES_BULK]: updateEntriesBulk,
    [EEB__CLEAR_ENTRIES]: clearEntries,
    [EEB__SET_SELECTED_ENTRY_KEY]: setSelectedEntryKey,
    [EEB__SET_ENTRY_EXCERPT]: setEntryExcerpt,
    [EEB__RESET_ENTRY_EXCERPT]: resetEntryExcerpt,
    [EEB__SET_ENTRY_HIGHLIGHT_HIDDEN]: setEntryHighlightHidden,
    [EEB__SET_ENTRY_DATA]: setEntryData,
    [EEB__SET_ENTRY_ERROR]: setEntryError,
    [EEB__ADD_ENTRY]: addEntry,
    [EEB__REMOVE_ENTRY]: removeEntry,
    [EEB__MARK_AS_DELETED_ENTRY]: markAsDeletedEntry,
    [EEB__APPLY_TO_ALL_ENTRIES]: applyToAllEntries('all'),
    [EEB__APPLY_TO_ALL_ENTRIES_BELOW]: applyToAllEntries('all-below'),
    [EEB__SET_PENDING]: setPending,
    [EEB__SAVE_ENTRY]: saveEntry,
    [EEB__RESET_UI_STATE]: editEntriesResetUiState,
    [EEB__FORMAT_ALL_ENTRIES]: formatAllEntries,

    [EEB__SET_ENTRY_GROUPS]: setEntryGroups,
    [EEB__CLEAR_ENTRY_GROUPS]: clearEntryGroups,
    [EEB__ADD_ENTRY_GROUP]: addEntryGroup,
    [EEB__REMOVE_ENTRY_GROUP]: removeEntryGroup,
    [EEB__MARK_AS_DELETED_ENTRY_GROUP]: markAsDeletedEntryGroup,
    [EEB__SAVE_ENTRY_GROUP]: saveEntryGroup,
    [EEB__SET_ENTRY_GROUP_PENDING]: setEntryGroupPending,
    [EEB__RESET_ENTRY_GROUP_UI_STATE]: resetEntryGroupUiState,
    [EEB__SET_LABELS]: setLabels,
    [EEB__SET_ENTRY_GROUP_SELECTION]: setEntryGroupSelection,
    [EEB__CLEAR_ENTRY_GROUP_SELECTION]: clearEntryGroupSelection,
    [EEB__SET_ENTRY_GROUP_DATA]: setEntryGroupData,
    [EEB__SET_ENTRY_GROUP_ERROR]: setEntryGroupError,
};

export default reducers;
