import update from '#rsu/immutable-update';
import {
    listToMap,
    mapToMap,
} from '@togglecorp/fujs';

import {
    SET_PROJECT_DETAILS as PP__SET_PROJECT_DETAILS,
    UNSET_PROJECT as PP__UNSET_PROJECT,
    REMOVE_PROJECT_MEMBERSHIP as PP_REMOVE_PROJECT_MEMBERSHIP,
} from '#redux/reducers/siloDomainData/projects';

// TYPE

export const SET_USER_PROJECTS = 'domainData/SET_USER_PROJECTS';
export const SET_USER_PROJECT = 'domainData/SET_USER_PROJECT';
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

// REDUCER

const setUserProjectTitle = (state, action) => {
    const {
        project: { faramValues },
        projectId,
    } = action;
    // These are the projectMiniUrlFields
    const fields = [
        'id',
        'title',
        'versionId',
        'role',
        'assessmentTemplate',
        'analysisFramework',
        'categoryEditor',
        'regions',
        'memberStatus',
    ];
    const projectDetail = fields.reduce(
        (acc, field) => ({
            ...acc,
            [field]: { $set: faramValues[field] },
        }),
        {},
    );
    const settings = {
        projects: {
            [projectId]: projectDetail,
        },
    };
    return update(state, settings);
};

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
        shouldRemoveProject,
    } = action;
    return shouldRemoveProject ?
        unsetUserProject(state, { projectId })
        : state;
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
                            const permission = listToMap(
                                obj,
                                elem => elem,
                                () => true,
                            );
                            if (key === 'setupPermissions') {
                                permission.view = true;
                            }
                            // view and view_only_unprotected are same for client
                            permission.view = permission.view || permission.view_only_unprotected;
                            return permission;
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
    [SET_USER_PROJECT]: setUserProject,

    [SET_PROJECT_ROLES]: setProjectRoles,

    // From Silo
    [PP__SET_PROJECT_DETAILS]: setUserProjectTitle,
    [PP__UNSET_PROJECT]: unsetUserProject,
    [PP_REMOVE_PROJECT_MEMBERSHIP]: unsetUserProjectForMembershipDelete,
};
export default reducers;
