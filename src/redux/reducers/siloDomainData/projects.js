import update from '#rsu/immutable-update';

export const SET_PROJECT_DETAILS = 'siloDomainData/SET_PROJECT_DETAILS';
export const CHANGE_PROJECT_DETAILS = 'siloDomainData/CHANGE_PROJECT_DETAILS';
export const SET_ERROR_PROJECT_DETAILS = 'siloDomainData/SET_ERROR_PROJECT_DETAILS';
export const SET_PROJECT_MEMBERSHIPS = 'siloDomainData/SET_PROJECT_MEMBERSHIPS';
export const ADD_PROJECT_MEMBERSHIP = 'siloDomainData/ADD_PROJECT_MEMBERSHIP';
export const SET_PROJECT_USERGROUPS = 'siloDomainData/SET_PROJECT_USERGROUPS';

// REDUCER

export const setProjectDetailsAction = ({ project, projectId }) => ({
    type: SET_PROJECT_DETAILS,
    project,
    projectId,
});

export const setProjectMembershipsAction = ({ memberships, projectId }) => ({
    type: SET_PROJECT_MEMBERSHIPS,
    memberships,
    projectId,
});

export const setProjectUsergroupsAction = ({ userGroups, projectId }) => ({
    type: SET_PROJECT_USERGROUPS,
    userGroups,
    projectId,
});


export const changeProjectDetailsAction =
    ({ faramValues, faramErrors, projectId }) => ({
        type: CHANGE_PROJECT_DETAILS,
        faramValues,
        faramErrors,
        projectId,
    });


export const setErrorProjectDetailsAction =
    ({ faramErrors, projectId }) => ({
        type: SET_ERROR_PROJECT_DETAILS,
        faramErrors,
        projectId,
    });

export const setProjectDetails = (state, action) => {
    const {
        project,
        projectId,
    } = action;

    const {
        faramValues,
    } = project;

    const {
        title,
        description,
        startDate,
        endDate,
        role,
        versionId,
        regions,
        memberships,
        userGroups,
    } = faramValues;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                localData: { $auto: {
                    faramValues: { $set: {
                        title,
                        description,
                        startDate,
                        endDate,
                        regions,
                        memberships,
                        userGroups,
                    } },
                    faramErrors: { $set: {} },
                    pristine: { $set: true },
                } },
                serverData: { $auto: {
                    versionId: { $set: versionId },
                    role: { $set: role },
                } },
            } },
        } },
    };
    return update(state, settings);
};

export const changeProjectDetails = (state, action) => {
    const {
        faramValues,
        projectId,
    } = action;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                localData: { $auto: {
                    faramValues: { $set: faramValues },
                    pristine: { $set: false },
                } },
            } },
        } },
    };

    return update(state, settings);
};

export const setProjectMemberships = (state, action) => {
    const {
        projectId,
        memberships,
    } = action;
    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                memberships: {
                    $set: memberships,
                },
            } },
        } },
    };
    return update(state, settings);
};

export const addProjectMembership = (state, action) => {
    const {
        projectId,
        membership,
    } = action;
    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                memberships: { $autoArray: {
                    $push: [membership],
                } },
            } },
        } },
    };
    return update(state, settings);
};

export const setProjectUsergroups = (state, action) => {
    const {
        projectId,
        userGroups,
    } = action;
    console.warn(action);
    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                userGroups: {
                    $set: userGroups,
                },
            } },
        } },
    };
    return update(state, settings);
};

export const setErrorProjectDetails = (state, action) => {
    const {
        faramErrors,
        projectId,
    } = action;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                localData: { $auto: {
                    faramErrors: { $set: faramErrors },
                    pristine: { $set: false },
                } },
            } },
        } },
    };
    return update(state, settings);
};

const reducers = {
    [SET_PROJECT_DETAILS]: setProjectDetails,
    [CHANGE_PROJECT_DETAILS]: changeProjectDetails,
    [SET_ERROR_PROJECT_DETAILS]: setErrorProjectDetails,
    [SET_PROJECT_MEMBERSHIPS]: setProjectMemberships,
    [ADD_PROJECT_MEMBERSHIP]: addProjectMembership,
    [SET_PROJECT_USERGROUPS]: setProjectUsergroups,
};

export default reducers;
