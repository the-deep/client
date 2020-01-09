import {
    wsEndpoint,
    POST,
    PUT,
    DELETE,
    p,
    commonHeaderForPost,
} from '#config/rest';
import { getVersionedUrl } from '#request';

export const urlForEntry = `${wsEndpoint}/entries/`;
export const urlForEntryCreate = `${wsEndpoint}/entries/`;

export const createUrlForFilteredEntries = params => (
    `${wsEndpoint}/entries/filter/?${p(params)}`
);

export const createUrlForEntryEdit = entryId => (
    `${wsEndpoint}/entries/${entryId}/`
);
export const createUrlForEntries = projectId => (
    `${wsEndpoint}/entries/?${p({ project: projectId })}`
);

export const createParamsForFilteredEntries = filters => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({ filters }),
});

export const createParamsForEntryCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForEntryEdit = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createUrlForEntriesOfLead = leadId => (
    `${wsEndpoint}/entries/processed/?${p({ lead: leadId })}`
);

export const createUrlForDeleteEntry = entryId => (
    `${wsEndpoint}/entries/${entryId}/`
);
export const createParamsForDeleteEntry = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createUrlForDeleteEntryGroup = entryGroupId => (
    `${wsEndpoint}/entry-groups/${entryGroupId}/`
);

export const createUrlEditEntryGet = leadId => (
    getVersionedUrl(wsEndpoint, `/v2/edit-entries-data/${leadId}/`)
);

export const createUrlForEntryGroupEdit = (leadId, entryGroupId) => (
    `${wsEndpoint}/leads/${leadId}entry-groups/${entryGroupId}/`
);

export const createUrlForEntryGroupCreate = leadId => (
    `${wsEndpoint}/leads/${leadId}/entry-groups/`
);

export const createParamsForEntryGroupEdit = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForEntryGroupCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});
