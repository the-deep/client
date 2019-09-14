import update from '#rsu/immutable-update';
import produce from 'immer';

// TYPE

export const E__SET_ENTRIES = 'siloDomainData/E__SET_ENTRIES';
export const E__SET_FILTER = 'siloDomainData/E__SET_FILTER';
export const E__UNSET_FILTER = 'siloDomainData/E__UNSET_FILTER';
export const E__SET_ACTIVE_PAGE = 'siloDomainData/E__SET_ACTIVE_PAGE';
export const E__SET_ENTRY_COMMENTS_COUNT = 'siloDomainData/E__SET_ENTRY_COMMENTS_COUNT';

// ACTION-CREATOR

export const setEntriesViewFilterAction = ({ filters }) => ({
    type: E__SET_FILTER,
    filters,
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

const entryViewSetFilter = (state, action) => {
    const { filters } = action;
    const { activeProject } = state;
    const settings = {
        entriesView: { $auto: {
            [activeProject]: { $auto: {
                filter: { $auto: { $merge: filters } },
                activePage: { $set: 1 },
            } },
        } },
    };
    return update(state, settings);
};

const entryViewUnsetFilter = (state) => {
    const { activeProject } = state;
    const settings = {
        entriesView: {
            [activeProject]: { $auto: {
                filter: { $set: {} },
                activePage: { $set: 1 },
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

// REDUCER MAP

const reducers = {
    [E__SET_FILTER]: entryViewSetFilter,
    [E__UNSET_FILTER]: entryViewUnsetFilter,
    [E__SET_ENTRIES]: setEntries,
    [E__SET_ENTRY_COMMENTS_COUNT]: setEntryCommentsCount,
    [E__SET_ACTIVE_PAGE]: entriesViewSetActivePage,
};
export default reducers;
