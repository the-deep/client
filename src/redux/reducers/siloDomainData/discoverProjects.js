import update from '#rs/utils/immutable-update';

// TYPE

export const DP__SET_PROJECT_LIST = 'siloDomainData/DP__SET_PROJECT_LIST';

// ACTION-CREATOR

export const setDiscoverProjectsProjectListAction = ({ projectList }) => ({
    type: DP__SET_PROJECT_LIST,
    projectList,
});

// REDUCER

const setProjects = (state, action) => {
    const { projectList } = action;
    const settings = {
        projectList: { $set: projectList },
    };
    return update(state, settings);
};


// REDUCER MAP

const reducers = {
    [DP__SET_PROJECT_LIST]: setProjects,
};

export default reducers;
