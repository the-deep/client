import update from '#rsu/immutable-update';
import { listToMap } from '@togglecorp/fujs';

export const SET_PROJECT_DETAILS = 'siloDomainData/SET_PROJECT_DETAILS';
export const SET_PROJECT_DASHBOARD_DETAILS = 'siloDomainData/SET_PROJECT_DASHBOARD_DETAILS';
export const CHANGE_PROJECT_DETAILS = 'siloDomainData/CHANGE_PROJECT_DETAILS';
export const SET_ERROR_PROJECT_DETAILS = 'siloDomainData/SET_ERROR_PROJECT_DETAILS';
export const SET_PROJECT_MEMBERSHIPS = 'siloDomainData/SET_PROJECT_MEMBERSHIPS';
export const ADD_PROJECT_MEMBERSHIP = 'siloDomainData/ADD_PROJECT_MEMBERSHIP';
export const SET_PROJECT_USERGROUPS = 'siloDomainData/SET_PROJECT_USERGROUPS';
export const ADD_PROJECT_USERGROUP = 'siloDomainData/ADD_PROJECT_USERGROUP';

export const UNSET_PROJECT = 'siloDomainData/UNSET_PROJECT';
export const REMOVE_PROJECT_MEMBERSHIP = 'siloDomainData/REMOVE_PROJECT_MEMBERSHIP';
export const REMOVE_PROJECT_USERGROUP = 'siloDomainData/REMOVE_PROJECT_USERGROUP';
export const MODIFY_PROJECT_MEMBERSHIP = 'siloDomainData/MODIFY_PROJECT_MEMBERSHIP';
export const MODIFY_PROJECT_USERGROUP = 'siloDomainData/MODIFY_PROJECT_USERGROUP';

const emptyObject = {};

// REDUCER

export const setProjectDetailsAction = ({ project, projectId }) => ({
    type: SET_PROJECT_DETAILS,
    project,
    projectId,
});

export const setProjectDashboardDetailsAction = ({ project, projectId }) => ({
    type: SET_PROJECT_DASHBOARD_DETAILS,
    project,
    projectId,
});

export const setProjectMembershipsAction = ({ memberships, projectId }) => ({
    type: SET_PROJECT_MEMBERSHIPS,
    memberships,
    projectId,
});

export const addProjectMembershipAction = ({ projectId, membership }) => ({
    type: ADD_PROJECT_MEMBERSHIP,
    projectId,
    membership,
});

export const addProjectUsergroupAction = ({ projectId, usergroup }) => ({
    type: ADD_PROJECT_USERGROUP,
    projectId,
    usergroup,
});

export const setProjectUsergroupsAction = ({ usergroups, projectId }) => ({
    type: SET_PROJECT_USERGROUPS,
    usergroups,
    projectId,
});

export const removeProjectMembershipAction = ({
    projectId,
    membershipId,
    shouldRemoveProject,
    newActiveProjectId,
}) => ({
    type: REMOVE_PROJECT_MEMBERSHIP,
    projectId,
    membershipId,
    shouldRemoveProject,
    newActiveProjectId,
});

export const removeProjectUserGroupAction = ({ projectId, usergroupId }) => ({
    type: REMOVE_PROJECT_USERGROUP,
    projectId,
    usergroupId,
});

export const modifyProjectUserGroupAction = ({ projectId, usergroupId, newRole }) => ({
    type: MODIFY_PROJECT_USERGROUP,
    projectId,
    usergroupId,
    newRole,
});

export const modifyProjectMembershipAction = ({
    projectId,
    membership,
}) => ({
    type: MODIFY_PROJECT_MEMBERSHIP,
    projectId,
    membership,
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

export const unsetProjectDetailsAction = ({ projectId, newActiveProjectId }) => ({
    type: UNSET_PROJECT,
    projectId,
    newActiveProjectId,
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
        userGroups: usergroupList,
        memberships: membershipList,
    } = faramValues;

    const memberships = listToMap(membershipList, m => m.id) || emptyObject;
    const usergroups = listToMap(usergroupList, m => m.id) || emptyObject;

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
                    } },
                    faramErrors: { $set: {} },
                    pristine: { $set: true },
                } },
                serverData: { $auto: {
                    projectId: { $set: projectId },
                    versionId: { $set: versionId },
                    role: { $set: role },
                } },
                memberships: {
                    $set: memberships,
                },
                usergroups: {
                    $set: usergroups,
                },
            } },
        } },
    };
    return update(state, settings);
};

export const setProjectDashboardDetails = (state, action) => {
    const {
        project,
        projectId,
    } = action;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                dashboard: { $set: project },
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
        memberships: membershipList,
    } = action;
    const memberships = listToMap(membershipList, m => m.id) || emptyObject;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                memberships: { $set: memberships },
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
                memberships: { $auto: {
                    [membership.id]: { $set: membership },
                } },
            } },
        } },
    };
    return update(state, settings);
};

export const setProjectUsergroups = (state, action) => {
    const {
        projectId,
        usergroups: usergroupList,
    } = action;
    const usergroups = listToMap(usergroupList, u => u.id) || emptyObject;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                usergroups: { $auto: {
                    $set: usergroups,
                } },
            } },
        } },
    };
    return update(state, settings);
};

export const addProjectUsergroup = (state, action) => {
    const {
        projectId,
        usergroup,
    } = action;
    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                usergroups: { $auto: {
                    [usergroup.id]: { $set: usergroup },
                } },
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

export const unsetProject = (state, action) => {
    const {
        projectId,
        newActiveProjectId,
    } = action;
    const settings = {
        projectsView: { $auto: {
            $unset: [projectId],
        } },
        activeProject: {
            $set: newActiveProjectId,
        },
    };
    return update(state, settings);
};

export const removeProjectMembership = (state, action) => {
    const {
        projectId,
        membershipId,
        shouldRemoveProject,
        newActiveProjectId,
    } = action;

    if (shouldRemoveProject) {
        return unsetProject(state, { projectId, newActiveProjectId });
    }

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                memberships: { $unset: [membershipId] },
            } },
        } },
    };
    return update(state, settings);
};

export const modifyProjectMembership = (state, action) => {
    const {
        projectId,
        membership,
    } = action;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                memberships: { $auto: {
                    [membership.id]: { $set: membership },
                } },
            } },
        } },
    };
    return update(state, settings);
};

export const removeProjectUsergroup = (state, action) => {
    const {
        projectId,
        usergroupId,
    } = action;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                usergroups: { $unset: [usergroupId] },
            } },
        } },
    };
    return update(state, settings);
};

export const modifyProjectUserGroup = (state, action) => {
    const {
        projectId,
        usergroupId,
        newRole,
    } = action;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                usergroups: { $auto: {
                    [usergroupId]: { $auto: {
                        role: { $set: newRole },
                    } },
                } },
            } },
        } },
    };
    return update(state, settings);
};

const reducers = {
    [SET_PROJECT_DETAILS]: setProjectDetails,
    [SET_PROJECT_DASHBOARD_DETAILS]: setProjectDashboardDetails,
    [CHANGE_PROJECT_DETAILS]: changeProjectDetails,
    [SET_ERROR_PROJECT_DETAILS]: setErrorProjectDetails,
    [SET_PROJECT_MEMBERSHIPS]: setProjectMemberships,
    [ADD_PROJECT_MEMBERSHIP]: addProjectMembership,
    [SET_PROJECT_USERGROUPS]: setProjectUsergroups,
    [ADD_PROJECT_USERGROUP]: addProjectUsergroup,

    [UNSET_PROJECT]: unsetProject,
    [REMOVE_PROJECT_MEMBERSHIP]: removeProjectMembership,
    [REMOVE_PROJECT_USERGROUP]: removeProjectUsergroup,
    [MODIFY_PROJECT_MEMBERSHIP]: modifyProjectMembership,
    [MODIFY_PROJECT_USERGROUP]: modifyProjectUserGroup,
};

export default reducers;
