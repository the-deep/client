import update from '#rsu/immutable-update';
import {
    compareString,
    listToMap,
    mapToMap,
} from '#rsu/common';

import { UP__UNSET_USER_PROJECT } from '#redux/reducers/siloDomainData/users';
import { UG__UNSET_USERGROUP_PROJECT } from '#redux/reducers/siloDomainData/usergroups';
import {
    REMOVE_PROJECT_MEMBERSHIP as PP_REMOVE_PROJECT_MEMBERSHIP,
} from '#redux/reducers/siloDomainData/projects';

// TYPE

export const SET_USER_PROJECTS = 'domainData/SET_USER_PROJECTS';
export const SET_USER_PROJECT = 'domainData/SET_USER_PROJECT';
export const SET_USER_PROJECT_OPTIONS = 'domainData/SET_USER_PROJECT_OPTIONS';
export const SET_USERS_PROJECT_MEMBERSHIP = 'domainData/SET_USERS_PROJECT_MEMBERSHIP';
export const SET_USER_PROJECT_MEMBERSHIP = 'domainData/SET_USER_PROJECT_MEMBERSHIP';
export const UNSET_USER_PROJECT_MEMBERSHIP = 'domainData/UNSET_USER_PROJECT_MEMBERSHIP';
export const UNSET_USER_PROJECT = 'domainData/UNSET_USER_PROJECT';
export const SET_PROJECT_ROLES = 'domainData/SET_PROJECT_ROLES';

// ACTION-CREATOR

export const setUserProjectsAction = ({ userId, projects, extra }) => ({
    type: SET_USER_PROJECTS,
    userId,
    projects,
    extra, // used to set active project if there is none
});

export const setProjectAction = ({ project, userId }) => ({
    type: SET_USER_PROJECT,
    project,
    userId,
});

export const setProjectRolesAction = ({ projectRoles }) => ({
    type: SET_PROJECT_ROLES,
    projectRoles,
});

export const setProjectOptionsAction = ({ projectId, options }) => ({
    type: SET_USER_PROJECT_OPTIONS,
    projectId,
    options,
});

export const setUsersProjectMembershipAction = ({ projectMembership, projectId }) => ({
    type: SET_USERS_PROJECT_MEMBERSHIP,
    projectMembership,
    projectId,
});

export const setUserProjectMembershipAction = ({ memberDetails, projectId }) => ({
    type: SET_USER_PROJECT_MEMBERSHIP,
    memberDetails,
    projectId,
});

export const unsetUserProjectMembershipAction = ({ memberId, projectId }) => ({
    type: UNSET_USER_PROJECT_MEMBERSHIP,
    memberId,
    projectId,
});

export const unsetProjectAction = ({ userId, projectId }) => ({
    type: UNSET_USER_PROJECT,
    userId,
    projectId,
});

const emptyList = [];
const emptyObject = {};

// REDUCER

const setUserProject = (state, action) => {
    const { project } = action;
    const settings = {
        projects: {
            [project.id]: {
                $set: project,
            },
        },
    };
    return update(state, settings);
};

const setUserProjectOptions = (state, action) => {
    const { projectId, options } = action;

    const regions = [...options.regions].sort(
        (a, b) => compareString(a.value, b.value),
    );
    const userGroups = [...options.userGroups].sort(
        (a, b) => compareString(a.value, b.value),
    );

    const newOptions = {
        userGroups,
        regions,
    };

    const settings = {
        projectsOptions: {
            [projectId]: { $auto: {
                $set: newOptions,
            } },
        },
    };
    return update(state, settings);
};

const setUsersProjectMembership = (state, action) => {
    const { projectId, projectMembership } = action;

    const memberships = ((state.projects[projectId] || emptyObject).memberships || emptyList);
    const newMembers = projectMembership.filter(
        projectMember => (
            memberships.findIndex(member => (member.id === projectMember.id)) === -1
        ),
    );

    const settings = {
        projects: { $auto: {
            [projectId]: { $auto: {
                memberships: { $autoArray: {
                    $push: newMembers,
                } },
            } },
        } },
    };
    return update(state, settings);
};

const setUserProjectMembership = (state, action) => {
    const { projectId, memberDetails } = action;

    const memberships = ((state.projects[projectId] || emptyObject).memberships || emptyList);
    const updatedMemberShipIndex = memberships.findIndex(
        membership => (memberDetails.id === membership.id),
    );

    const settings = {
        projects: { $auto: {
            [projectId]: { $auto: {
                memberships: { $autoArray: {
                    [updatedMemberShipIndex]: { $auto: {
                        $merge: memberDetails,
                    } },
                } },
            } },
        } },
    };
    return update(state, settings);
};

const unsetUserProjectMembership = (state, action) => {
    const { memberId, projectId } = action;

    const memberships = ((state.projects[projectId] || emptyObject).memberships || emptyList);
    const membershipArrayIndex = memberships.findIndex(
        membership => (membership.id === memberId),
    );

    if (membershipArrayIndex !== -1) {
        const settings = {
            projects: { $auto: {
                [projectId]: { $auto: {
                    memberships: { $autoArray: {
                        $splice: [[membershipArrayIndex, 1]],
                    } },
                } },
            } },
        };
        return update(state, settings);
    }
    return state;
};

const unsetUserProject = (state, action) => {
    const { projectId } = action;
    const settings = {
        projects: { $auto: {
            $unset: [projectId],
        } },
    };
    return update(state, settings);
};

const unsetUserProjectForMembershipDelete = (state, action) => {
    const {
        projectId,
        removeProject,
    } = action;
    if (removeProject) {
        const settings = {
            projects: { $auto: {
                $unset: [projectId],
            } },
        };
        return update(state, settings);
    }
    return state;
};

const setUserProjects = (state, action) => {
    const { projects: projectList } = action;

    const projects = projectList.reduce(
        (acc, project) => (
            {
                ...acc,
                [project.id]: project,
            }
        ),
        { },
    );
    const settings = {
        projects: { $set: projects },
    };
    return update(state, settings);
};

const setProjectRoles = (state, action) => {
    const { projectRoles: roleList } = action;


    const projectRoles = roleList.reduce(
        (acc, role) => (
            {
                ...acc,
                [role.id]: mapToMap(
                    role,
                    undefined,
                    (obj, key) => {
                        // Convert every element with key matching *Permissions from array to dict
                        if (key.endsWith('Permissions') && Array.isArray(obj)) {
                            return listToMap(obj, elem => elem, () => true);
                        }
                        return obj;
                    },
                ),
            }
        ),
        { },
    );
    const settings = {
        projectRoles: { $set: projectRoles },
    };
    return update(state, settings);
};

const reducers = {
    [SET_USER_PROJECTS]: setUserProjects,
    [SET_PROJECT_ROLES]: setProjectRoles,
    [SET_USER_PROJECT]: setUserProject,
    [UNSET_USER_PROJECT]: unsetUserProject,
    [SET_USER_PROJECT_OPTIONS]: setUserProjectOptions,
    [SET_USERS_PROJECT_MEMBERSHIP]: setUsersProjectMembership,
    [SET_USER_PROJECT_MEMBERSHIP]: setUserProjectMembership,
    [UNSET_USER_PROJECT_MEMBERSHIP]: unsetUserProjectMembership,

    // From Silo
    [UP__UNSET_USER_PROJECT]: unsetUserProject,
    [UG__UNSET_USERGROUP_PROJECT]: unsetUserProject,
    [PP_REMOVE_PROJECT_MEMBERSHIP]: unsetUserProjectForMembershipDelete,
};
export default reducers;
