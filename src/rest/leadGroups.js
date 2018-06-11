import {
    wsEndpoint,
    POST,
    DELETE,
    commonHeaderForPost,
    p,
} from '#config/rest';

// Lead Groups
const leadGroupsMiniFields = ['id', 'title', 'project', 'version_id'];
export const urlForLeadGroups = `${wsEndpoint}/lead-groups`;
export const createUrlForLeadGroup = leadGroupId => `${urlForLeadGroups}/${leadGroupId}/`;
export const urlForLeadGroupsForLeadAdd = `${wsEndpoint}/lead-groups/?${p({ fields: leadGroupsMiniFields })}`;
export const createUrlForLeadGroupsOfProject = params => `${urlForLeadGroups}?${p(params)}`;

export const createUrlForLeadGroupDelete = createUrlForLeadGroup;

export const createParamsForLeadGroupCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForLeadGroupDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});
