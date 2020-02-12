import {
    wsEndpoint,
    POST,
    PUT,
    PATCH,
    DELETE,
    commonHeaderForPost,
    p,
} from '#config/rest';

export const createUrlForProject = projectId => `${wsEndpoint}/projects/${projectId}/`;
export const createUrlForProjectOptions = params =>
    `${wsEndpoint}/project-options/?${p(params)}`;
export const createUrlForProjectRegions = (projectId, fields) =>
    `${wsEndpoint}/projects/${projectId}/regions/?${p({ fields })}`;

export const urlForProjectUserGroup = `${wsEndpoint}/project-usergroups/`;
export const createUrlForProjectUserGroupGet = project => `${wsEndpoint}/project-usergroups/?${p({ project })}`;
export const createUrlForProjectUserGroupDelete = userGroupRelationId => `${wsEndpoint}/project-usergroups/${userGroupRelationId}`;
export const createUrlForProjectAryTemplate = projectId => `${wsEndpoint}/projects/${projectId}/assessment-template/`;

export const urlForProjectRoles = `${wsEndpoint}/project-roles/`;

export const createUrlForProjectsOfUser = userId => (
    `${wsEndpoint}/projects/member-of/?${p({ user: userId })}`
);

export const createUrlForUserGroupProjects = (id, fields) => (
    `${wsEndpoint}/projects/?${p({ user_groups: id, fields })}`
);

const projectMiniUrlFields = [
    'id',
    'title',
    'version_id',
    'role',
    'assessment_template',
    'analysis_framework',
    'category_editor',
    'regions',
    'member_status',
    'is_visualization_enabled',
    'is_private',
];
export const urlForProjects = `${wsEndpoint}/projects/member-of/?${p({ fields: projectMiniUrlFields })}`;
export const urlForProjectCreate = `${wsEndpoint}/projects/`;
export const urlForProjectMembership = `${wsEndpoint}/project-memberships/`;
export const createUrlForProjectMembership = project => `${wsEndpoint}/project-memberships/?${p({ project })}`;
export const createUrlForUserProjectMembership = membershipId =>
    `${wsEndpoint}/project-memberships/${membershipId}/`;

export const createParamsForProjectPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForProjectPut = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForUserProjectMembershipPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForProjectCreate = ({
    title,
    userGroups,
    isPrivate,
}) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        title,
        userGroups,
        isPrivate,
    }),
});

export const createParamsForProjectMembershipListCreate = ({ memberList }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        list: memberList,
    }),
});

export const createParamsForProjectMembershipCreate = member => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(member),
});

export const createParamsForProjectDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createParamsForUserProjectMembershipDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createParamsForProjectUserGroupCreate = projectUserGroup => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(projectUserGroup),
});
