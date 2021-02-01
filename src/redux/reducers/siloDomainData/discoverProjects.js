import update from '#rsu/immutable-update';

// TYPE

export const DP__SET_PROJECT_LIST = 'siloDomainData/DP__SET_PROJECT_LIST';
export const DP__SET_PROJECT_JOIN = 'siloDomainData/DP__SET_PROJECT_JOIN';

export const DP__SET_FILTERS = 'siloDomainData/DP__SET_FILTERS';
export const DP__UNSET_FILTERS = 'siloDomainData/DP__UNSET_FILTERS';

export const DP__SET_ACTIVE_PAGE = 'siloDomainData/DP__SET_ACTIVE_PAGE';
export const DP__SET_ACTIVE_SORT = 'siloDomainData/DP__SET_ACTIVE_SORT';

export const DP__SET_PROJECT_OPTIONS = 'siloDomainData/DP__SET_PROJECT_OPTIONS';

// ACTION-CREATOR

export const setDiscoverProjectsProjectListAction = ({ projectList, totalProjectsCount }) => ({
    type: DP__SET_PROJECT_LIST,
    projectList,
    totalProjectsCount,
});

export const setDiscoverProjectsProjectJoinAction = ({ projectId, isJoining }) => ({
    type: DP__SET_PROJECT_JOIN,
    projectId,
    isJoining,
});

export const setDiscoverProjectsFilterAction = filters => ({
    type: DP__SET_FILTERS,
    filters,
});

export const unsetDiscoverProjectsFilterAction = () => ({
    type: DP__UNSET_FILTERS,
});


export const setDiscoverProjectsActivePageAction = activePage => ({
    type: DP__SET_ACTIVE_PAGE,
    activePage,
});

export const setDiscoverProjectsActiveSortAction = activeSort => ({
    type: DP__SET_ACTIVE_SORT,
    activeSort,
});

export const setDiscoverProjectsProjectOptionsAction = projectOptions => ({
    type: DP__SET_PROJECT_OPTIONS,
    projectOptions,
});

// REDUCER

const setProjects = (state, action) => {
    const { projectList, totalProjectsCount } = action;
    const settings = {
        discoverProjectsView: { $auto: {
            projectList: { $set: projectList },
            totalProjectsCount: { $set: totalProjectsCount },
        } },
    };
    return update(state, settings);
};

const setProjectJoin = (state, action) => {
    const { discoverProjectsView: { projectList = [] } } = state;
    const { projectId, isJoining } = action;

    const index = projectList.findIndex(project => project.id === projectId);
    const newMemberStatus = isJoining ? 'pending' : 'none';

    const settings = {
        discoverProjectsView: {
            projectList: {
                [index]: { memberStatus: { $set: newMemberStatus } },
            },
        },
    };
    return update(state, settings);
};

const setFilters = (state, action) => {
    const { filters } = action;

    const settings = {
        discoverProjectsView: {
            filters: { $set: filters },
            activePage: { $set: 1 },
        },
    };
    return update(state, settings);
};

const unsetFilters = (state) => {
    const settings = {
        discoverProjectsView: {
            filters: { $set: undefined },
            activePage: { $set: 1 },
        },
    };
    return update(state, settings);
};

const setActivePage = (state, action) => {
    const { activePage } = action;
    const settings = {
        discoverProjectsView: {
            activePage: { $set: activePage },
        },
    };
    return update(state, settings);
};

const setActiveSort = (state, action) => {
    const { activeSort } = action;
    const settings = {
        discoverProjectsView: {
            activeSort: { $set: activeSort },
            activePage: { $set: 1 },
        },
    };
    return update(state, settings);
};

const setProjectOptions = (state, action) => {
    const { projectOptions } = action;
    const settings = {
        discoverProjectsView: {
            projectOptions: { $set: projectOptions },
        },
    };
    return update(state, settings);
};


// REDUCER MAP

const reducers = {
    [DP__SET_PROJECT_LIST]: setProjects,
    [DP__SET_FILTERS]: setFilters,
    [DP__UNSET_FILTERS]: unsetFilters,
    [DP__SET_ACTIVE_PAGE]: setActivePage,
    [DP__SET_ACTIVE_SORT]: setActiveSort,
    [DP__SET_PROJECT_OPTIONS]: setProjectOptions,
    [DP__SET_PROJECT_JOIN]: setProjectJoin,
};

export default reducers;
