import update from '#rsu/immutable-update';
import { compareString } from '#rsu/common';
import { UP__UNSET_USER_PROJECT } from '#redux/reducers/siloDomainData/users';
import { UG__UNSET_USERGROUP_PROJECT } from '#redux/reducers/siloDomainData/usergroups';

// TYPE

export const SET_USER_PROJECTS = 'domainData/SET_USER_PROJECTS';
export const SET_USER_PROJECT = 'domainData/SET_USER_PROJECT';
export const SET_USER_PROJECT_OPTIONS = 'domainData/SET_USER_PROJECT_OPTIONS';
export const SET_USERS_PROJECT_MEMBERSHIP = 'domainData/SET_USERS_PROJECT_MEMBERSHIP';
export const SET_USER_PROJECT_MEMBERSHIP = 'domainData/SET_USER_PROJECT_MEMBERSHIP';
export const UNSET_USER_PROJECT_MEMBERSHIP = 'domainData/UNSET_USER_PROJECT_MEMBERSHIP';
export const UNSET_USER_PROJECT = 'domainData/UNSET_USER_PROJECT';

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
        projects: {
            [projectId]: { $auto: {
                memberships: { $autoArray: {
                    $push: newMembers,
                } },
            } },
        },
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
        projects: {
            [projectId]: { $auto: {
                memberships: { $autoArray: {
                    [updatedMemberShipIndex]: { $auto: {
                        $merge: memberDetails,
                    } },
                } },
            } },
        },
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
            projects: {
                [projectId]: { $auto: {
                    memberships: { $autoArray: {
                        $splice: [[membershipArrayIndex, 1]],
                    } },
                } },
            },
        };
        return update(state, settings);
    }
    return state;
};

const unsetUserProject = (state, action) => {
    const { projectId } = action;
    const settings = {
        projects: {
            $unset: [projectId],
        },
    };
    return update(state, settings);
};

const setUserProjects = (state, action) => {
    const { projects } = action;

    const projectSettings = projects.reduce(
        (acc, project) => (
            {
                ...acc,
                [project.id]: project,
            }
        ),
        { },
    );
    const settings = {
        projects: {
            $set: projectSettings,
        },
    };
    return update(state, settings);
};

const reducers = {
    [SET_USER_PROJECTS]: setUserProjects,
    [SET_USER_PROJECT]: setUserProject,
    [UNSET_USER_PROJECT]: unsetUserProject,
    [SET_USER_PROJECT_OPTIONS]: setUserProjectOptions,
    [SET_USERS_PROJECT_MEMBERSHIP]: setUsersProjectMembership,
    [SET_USER_PROJECT_MEMBERSHIP]: setUserProjectMembership,
    [UNSET_USER_PROJECT_MEMBERSHIP]: unsetUserProjectMembership,

    // From Silo
    [UP__UNSET_USER_PROJECT]: unsetUserProject,
    [UG__UNSET_USERGROUP_PROJECT]: unsetUserProject,
};
export default reducers;
