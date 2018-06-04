import update from '#rs/utils/immutable-update';

// TYPE

export const DP__SET_PROJECT_LIST = 'siloDomainData/DP__SET_PROJECT_LIST';
export const DP__DELETE_PROJECT = 'siloDomainData/DP__DELETE_PROJECT';

export const DP__SET_FILTERS = 'siloDomainData/DP__SET_FILTERS';
export const DP__UNSET_FILTERS = 'siloDomainData/DP__UNSET_FILTERS';

// ACTION-CREATOR

export const setDiscoverProjectsProjectListAction = ({ projectList }) => ({
    type: DP__SET_PROJECT_LIST,
    projectList,
});

export const deleteDiscoverProjectsProjectAction = ({ projectId }) => ({
    type: DP__DELETE_PROJECT,
    projectId,
});

export const setDiscoverProjectsFilterAction = filters => ({
    type: DP__SET_FILTERS,
    filters,
});

export const unsetDiscoverProjectsFilterAction = () => ({
    type: DP__UNSET_FILTERS,
});

// REDUCER

const setProjects = (state, action) => {
    const { projectList } = action;
    const settings = {
        discoverProjectsView: { $auto: {
            projectList: { $set: projectList },
        } },
    };
    return update(state, settings);
};

const deleteProject = (state, action) => {
    const { projectId } = action;
    const { discoverProjectsView } = state;
    const { projectList } = discoverProjectsView;

    const projectIndex = projectList.findIndex(d => d.id === projectId);

    const settings = {
        discoverProjectsView: {
            projectList: { $splice: [[projectIndex, 1]] },
        },
    };
    return update(state, settings);
};

const setFilters = (state, action) => {
    const { filters } = action;

    const settings = {
        discoverProjectsView: {
            filters: { $set: filters },
        },
    };
    return update(state, settings);
};

const unsetFilters = (state) => {
    const settings = {
        discoverProjectsView: {
            filters: { $set: undefined },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [DP__SET_PROJECT_LIST]: setProjects,
    [DP__DELETE_PROJECT]: deleteProject,
    [DP__SET_FILTERS]: setFilters,
    [DP__UNSET_FILTERS]: unsetFilters,
};

export default reducers;
