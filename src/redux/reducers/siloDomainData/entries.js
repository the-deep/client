import update from '#rsu/immutable-update';
import produce from 'immer';

// TYPE

export const E__SET_ENTRIES = 'siloDomainData/E__SET_ENTRIES';
export const E__SET_FILTER = 'siloDomainData/E__SET_FILTER';
export const E__UPDATE_FILTER = 'siloDomainData/E__UPDATE_FILTER';
export const E__UNSET_FILTER = 'siloDomainData/E__UNSET_FILTER';
export const E__SET_ACTIVE_PAGE = 'siloDomainData/E__SET_ACTIVE_PAGE';
export const E__SET_ENTRY_COMMENTS_COUNT = 'siloDomainData/E__SET_ENTRY_COMMENTS_COUNT';
export const E__PATCH_ENTRY_VERIFICATION = 'siloDomainData/E__PATCH_ENTRY_VERIFICATION';
export const E__PATCH_ENTRY_APPROVAL = 'siloDomainData/E__PATCH_ENTRY_APPROVAL';
export const E__DELETE_ENTRY = 'siloDomainData/E__DELETE_ENTRY';
export const E__EDIT_ENTRY = 'siloDomainData/E__EDIT_ENTRY';
export const E__QC__SET_ACTIVE_PAGE = 'siloDomainData/E__QC__SET_ACTIVE_PAGE';
export const E__QC__SET_ENTRIES_COUNT = 'siloDomainData/E__QC__SET_ENTRIES_COUNT';
export const E__QC__SET_SELECTED_MATRIX_KEY = 'siloDomainData/E__QC__SET_SELECTED_MATRIX_KEY';

// ACTION-CREATOR

export const setEntriesViewFilterAction = ({ filters }) => ({
    type: E__SET_FILTER,
    filters,
});

export const updateEntriesViewFilterAction = ({ filterKey, newValue }) => ({
    type: E__UPDATE_FILTER,
    filterKey,
    newValue,
});

export const entriesSetEntryCommentsCountAction = ({ entry, projectId, leadId }) => ({
    type: E__SET_ENTRY_COMMENTS_COUNT,
    entry,
    projectId,
    leadId,
});

export const unsetEntriesViewFilterAction = () => ({
    type: E__UNSET_FILTER,
});

export const setEntriesViewActivePageAction = ({ activePage }) => ({
    type: E__SET_ACTIVE_PAGE,
    activePage,
});

export const setEntriesAction = ({ projectId, entries, totalEntriesCount }) => ({
    type: E__SET_ENTRIES,
    projectId,
    entries,
    totalEntriesCount,
});

export const patchEntryVerificationAction = ({ versionId, entryId, leadId, status }) => ({
    type: E__PATCH_ENTRY_VERIFICATION,
    entryId,
    leadId,
    status,
    versionId,
});

export const patchEntryApprovalAction = ({
    versionId,
    entryId,
    leadId,
    status,
    approvedCount,
}) => ({
    type: E__PATCH_ENTRY_APPROVAL,
    entryId,
    leadId,
    status,
    approvedCount,
    versionId,
});

export const deleteEntryAction = ({ entryId, leadId }) => ({
    type: E__DELETE_ENTRY,
    entryId,
    leadId,
});

export const editEntryAction = ({ entry, entryId, leadId }) => ({
    type: E__EDIT_ENTRY,
    entry,
    entryId,
    leadId,
});

export const setQualityControlViewActivePageAction = ({ activePage }) => ({
    type: E__QC__SET_ACTIVE_PAGE,
    activePage,
});

export const setQualityControlViewEntriesCountAction = ({ count }) => ({
    type: E__QC__SET_ENTRIES_COUNT,
    count,
});

export const setQualityControlViewSelectedMatrixKeyAction = ({ tocFilters }) => ({
    type: E__QC__SET_SELECTED_MATRIX_KEY,
    tocFilters,
});

// REDUCER

const setEntries = (state, action) => {
    const {
        entries,
        projectId,
        totalEntriesCount,
    } = action;

    const settings = {
        entriesView: {
            [projectId]: { $auto: {
                entries: { $set: entries },
                totalEntriesCount: { $set: totalEntriesCount },
            } },
        },
    };
    return update(state, settings);
};

const setEntryCommentsCount = (state, action) => {
    const {
        entry,
        leadId,
        projectId,
    } = action;

    const {
        entriesView: {
            [projectId]: {
                entries: leadGroupedEntries = [],
            } = {},
        } = {},
    } = state;

    const newState = produce(state, (safeState) => {
        if (!safeState.entriesView) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView = {};
        }
        if (!safeState.entriesView[projectId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId] = {};
        }
        if (!safeState.entriesView[projectId].entries) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId].entries = [];
        }

        const safeLeads = safeState.entriesView[projectId].entries;
        const leadIndex = leadGroupedEntries.findIndex(l => leadId === l.id);

        if (leadIndex > -1) {
            if (!safeLeads[leadIndex].entries) {
                // eslint-disable-next-line no-param-reassign
                safeLeads[leadIndex].entries = [];
            }

            const entryIndex = safeLeads[leadIndex].entries.findIndex(e => entry.entryId === e.id);
            const safeEntries = safeLeads[leadIndex].entries;

            if (entryIndex > -1) {
                // eslint-disable-next-line no-param-reassign
                safeEntries[entryIndex].resolvedCommentCount = entry.resolvedCommentCount;

                // eslint-disable-next-line no-param-reassign
                safeEntries[entryIndex].unresolvedCommentCount = entry.unresolvedCommentCount;
            }
        }
    });

    return newState;
};

const patchEntryVerification = (state, action) => {
    const {
        leadId,
        entryId,
        status,
        versionId,
    } = action;

    const { activeProject: projectId } = state;
    const {
        entriesView: {
            [projectId]: {
                entries: leadGroupedEntries = [],
            } = {},
        } = {},
    } = state;

    const newState = produce(state, (safeState) => {
        if (!safeState.entriesView) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView = {};
        }
        if (!safeState.entriesView[projectId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId] = {};
        }
        if (!safeState.entriesView[projectId].entries) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId].entries = [];
        }
        const safeLeads = safeState.entriesView[projectId].entries;
        const leadIndex = leadGroupedEntries.findIndex(l => leadId === l.id);
        if (leadIndex > -1) {
            if (!safeLeads[leadIndex].entries) {
                // eslint-disable-next-line no-param-reassign
                safeLeads[leadIndex].entries = [];
            }

            const entryIndex = safeLeads[leadIndex].entries.findIndex(e => entryId === e.id);
            const safeEntries = safeLeads[leadIndex].entries;

            if (entryIndex > -1) {
                // eslint-disable-next-line no-param-reassign
                safeEntries[entryIndex].verified = status;

                // eslint-disable-next-line no-param-reassign
                safeEntries[entryIndex].versionId = versionId;
            }
        }
    });

    return newState;
};

const patchEntryApproval = (state, action) => {
    const {
        leadId,
        entryId,
        status,
        versionId,
        approvedCount,
    } = action;

    const { activeProject: projectId } = state;
    const {
        entriesView: {
            [projectId]: {
                entries: leadGroupedEntries = [],
            } = {},
        } = {},
    } = state;

    const newState = produce(state, (safeState) => {
        if (!safeState.entriesView) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView = {};
        }
        if (!safeState.entriesView[projectId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId] = {};
        }
        if (!safeState.entriesView[projectId].entries) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId].entries = [];
        }
        const safeLeads = safeState.entriesView[projectId].entries;
        const leadIndex = leadGroupedEntries.findIndex(l => leadId === l.id);
        if (leadIndex > -1) {
            if (!safeLeads[leadIndex].entries) {
                // eslint-disable-next-line no-param-reassign
                safeLeads[leadIndex].entries = [];
            }

            const entryIndex = safeLeads[leadIndex].entries.findIndex(e => entryId === e.id);
            const safeEntries = safeLeads[leadIndex].entries;

            if (entryIndex > -1) {
                // eslint-disable-next-line no-param-reassign
                safeEntries[entryIndex].isApprovedByCurrentUser = status;
                safeEntries[entryIndex].approvedByCount = approvedCount;

                // eslint-disable-next-line no-param-reassign
                safeEntries[entryIndex].versionId = versionId;
            }
        }
    });

    return newState;
};

const deleteEntry = (state, action) => {
    const {
        entryId,
        leadId,
    } = action;

    const { activeProject: projectId } = state;
    const {
        entriesView: {
            [projectId]: {
                entries: leadGroupedEntries = [],
            } = {},
        } = {},
    } = state;

    const newState = produce(state, (safeState) => {
        if (!safeState.entriesView) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView = {
            };
        }
        if (!safeState.entriesView[projectId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId] = {
                totalEntriesCount: 0,
            };
        }
        if (!safeState.entriesView[projectId].entries) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId].entries = [];
        }
        const safeLeads = safeState.entriesView[projectId].entries;
        const leadIndex = leadGroupedEntries.findIndex(l => leadId === l.id);
        if (leadIndex > -1) {
            if (!safeLeads[leadIndex].entries) {
                // eslint-disable-next-line no-param-reassign
                safeLeads[leadIndex].entries = [];
            }

            const entryIndex = safeLeads[leadIndex].entries.findIndex(e => entryId === e.id);
            const safeEntries = safeLeads[leadIndex].entries;

            if (entryIndex > -1) {
                // eslint-disable-next-line no-param-reassign
                safeState.entriesView[projectId].totalEntriesCount -= 1;
                safeEntries.splice(entryIndex, 1);
            }
        }
    });

    return newState;
};

const editEntry = (state, action) => {
    const {
        entry,
        entryId,
        leadId,
    } = action;

    const { activeProject: projectId } = state;
    const {
        entriesView: {
            [projectId]: {
                entries: leadGroupedEntries = [],
            } = {},
        } = {},
    } = state;

    const newState = produce(state, (safeState) => {
        if (!safeState.entriesView) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView = {
            };
        }
        if (!safeState.entriesView[projectId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId] = {
                totalEntriesCount: 0,
            };
        }
        if (!safeState.entriesView[projectId].entries) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId].entries = [];
        }
        const safeLeads = safeState.entriesView[projectId].entries;
        const leadIndex = leadGroupedEntries.findIndex(l => leadId === l.id);
        if (leadIndex > -1) {
            if (!safeLeads[leadIndex].entries) {
                // eslint-disable-next-line no-param-reassign
                safeLeads[leadIndex].entries = [];
            }

            const entryIndex = safeLeads[leadIndex].entries.findIndex(e => entryId === e.id);
            const safeEntries = safeLeads[leadIndex].entries;

            if (entryIndex > -1) {
                // eslint-disable-next-line no-param-reassign
                safeEntries[entryIndex] = {
                    ...entry,
                    lead: safeEntries[entryIndex].lead,
                };
            }
        }
    });

    return newState;
};

const entryViewSetFilter = (state, action) => {
    const { filters } = action;
    const { activeProject } = state;
    const settings = {
        entriesView: { $auto: {
            [activeProject]: { $auto: {
                filter: { $auto: { $merge: filters } },
                activePage: { $set: 1 },
                qcViewActivePage: { $set: 1 },
            } },
        } },
    };
    return update(state, settings);
};

const entryViewUpdateFilter = (state, action) => {
    const { filterKey, newValue } = action;
    const { activeProject: projectId } = state;

    const newState = produce(state, (safeState) => {
        if (!safeState.entriesView) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView = {};
        }
        if (!safeState.entriesView[projectId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId] = {};
        }
        if (!safeState.entriesView[projectId].filter) {
            // eslint-disable-next-line no-param-reassign
            safeState.entriesView[projectId].filter = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState.entriesView[projectId].filter = {
            ...safeState.entriesView[projectId].filter,
            [filterKey]: newValue,
        };
        // eslint-disable-next-line no-param-reassign
        safeState.entriesView[projectId].activePage = 1;
        // eslint-disable-next-line no-param-reassign
        safeState.entriesView[projectId].qcViewActivePage = 1;
    });
    return newState;
};

const entryViewUnsetFilter = (state) => {
    const { activeProject } = state;
    const settings = {
        entriesView: {
            [activeProject]: { $auto: {
                filter: { $set: {} },
                activePage: { $set: 1 },
                qcViewActivePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

const entriesViewSetActivePage = (state, action) => {
    const { activePage } = action;
    const { activeProject } = state;
    const settings = {
        entriesView: {
            [activeProject]: { $auto: {
                activePage: { $set: activePage },
            } },
        },
    };
    return update(state, settings);
};

const qualityControlViewSetActivePage = (state, action) => {
    const { activePage } = action;
    const { activeProject } = state;
    const settings = {
        entriesView: {
            [activeProject]: { $auto: {
                qcViewActivePage: { $set: activePage },
            } },
        },
    };
    return update(state, settings);
};

const qualityControlViewSetEntriesCount = (state, action) => {
    const { count } = action;
    const { activeProject } = state;
    const settings = {
        entriesView: {
            [activeProject]: { $auto: {
                qcViewEntriesCount: { $set: count },
            } },
        },
    };
    return update(state, settings);
};

const qualityControlViewSetMatrixKey = (state, action) => {
    const { tocFilters } = action;
    const { activeProject } = state;
    const settings = {
        entriesView: {
            [activeProject]: { $auto: {
                qcViewActivePage: { $set: 1 },
                tocFilters: { $set: tocFilters },
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [E__SET_FILTER]: entryViewSetFilter,
    [E__UPDATE_FILTER]: entryViewUpdateFilter,
    [E__UNSET_FILTER]: entryViewUnsetFilter,
    [E__SET_ENTRIES]: setEntries,
    [E__SET_ENTRY_COMMENTS_COUNT]: setEntryCommentsCount,
    [E__SET_ACTIVE_PAGE]: entriesViewSetActivePage,
    [E__PATCH_ENTRY_VERIFICATION]: patchEntryVerification,
    [E__PATCH_ENTRY_APPROVAL]: patchEntryApproval,
    [E__DELETE_ENTRY]: deleteEntry,
    [E__EDIT_ENTRY]: editEntry,
    [E__QC__SET_ACTIVE_PAGE]: qualityControlViewSetActivePage,
    [E__QC__SET_ENTRIES_COUNT]: qualityControlViewSetEntriesCount,
    [E__QC__SET_SELECTED_MATRIX_KEY]: qualityControlViewSetMatrixKey,
};
export default reducers;
