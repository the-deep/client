import update from '#rsu/immutable-update';

// TYPE

export const LG__SET_LGS = 'siloDomainData/LG__SET_LGS';
export const LG__SET_FILTER = 'siloDomainData/LG__SET_FILTER';
export const LG__UNSET_FILTER = 'siloDomainData/LG__UNSET_FILTER';
export const LG__SET_ACTIVE_PAGE = 'siloDomainData/LG__SET_ACTIVE_PAGE';
export const LG__SET_ACTIVE_SORT = 'siloDomainData/LG__SET_ACTIVE_SORT';

// ACTION-CREATOR

export const setLeadGroupsFilterAction = ({ filters }) => ({
    type: LG__SET_FILTER,
    filters,
});

export const unsetLeadGroupsFilterAction = () => ({
    type: LG__UNSET_FILTER,
});

export const setLeadGroupsActivePageAction = ({ activePage }) => ({
    type: LG__SET_ACTIVE_PAGE,
    activePage,
});

export const setLeadGroupsActiveSortAction = ({ activeSort }) => ({
    type: LG__SET_ACTIVE_SORT,
    activeSort,
});

export const setLeadGroupsAction = ({ projectId, leadGroups, totalLeadGroupsCount }) => ({
    type: LG__SET_LGS,
    projectId,
    leadGroups,
    totalLeadGroupsCount,
});

// REDUCER

const setLeadGroups = (state, action) => {
    const { leadGroups, totalLeadGroupsCount, projectId } = action;
    const settings = {
        leadGroupsView: {
            [projectId]: { $auto: {
                leadGroups: { $set: leadGroups },
                totalLeadGroupsCount: { $set: totalLeadGroupsCount },
            } },
        },
    };
    return update(state, settings);
};

const leadGroupsViewSetFilter = (state, action) => {
    const { filters } = action;
    const { activeProject } = state;
    const settings = {
        leadGroupsView: {
            [activeProject]: { $auto: {
                filter: { $set: filters },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

const leadGroupsViewUnsetFilter = (state) => {
    const { activeProject } = state;
    const settings = {
        leadGroupsView: {
            [activeProject]: { $auto: {
                filter: { $set: {} },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

const leadGroupsViewSetActivePage = (state, action) => {
    const { activePage } = action;
    const { activeProject } = state;
    const settings = {
        leadGroupsView: {
            [activeProject]: { $auto: {
                activePage: { $set: activePage },
            } },
        },
    };
    return update(state, settings);
};

const leadGroupsViewSetActiveSort = (state, action) => {
    const { activeSort } = action;
    const { activeProject } = state;
    const settings = {
        leadGroupsView: {
            [activeProject]: { $auto: {
                activeSort: { $set: activeSort },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [LG__SET_LGS]: setLeadGroups,
    [LG__SET_FILTER]: leadGroupsViewSetFilter,
    [LG__UNSET_FILTER]: leadGroupsViewUnsetFilter,
    [LG__SET_ACTIVE_PAGE]: leadGroupsViewSetActivePage,
    [LG__SET_ACTIVE_SORT]: leadGroupsViewSetActiveSort,
};

export default reducers;
