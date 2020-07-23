import {
    wsEndpoint,
    POST,
    PUT,
    PATCH,
    DELETE,
    commonHeaderForPost,
    p,
    getVersionedUrl,
} from '#config/rest';

// do no use this, use urlForLead instead
export const urlForLead = getVersionedUrl(wsEndpoint, '/v2/leads/');
export const createUrlForLead = leadId => getVersionedUrl(wsEndpoint, `/v2/leads/${leadId}/`);
export const createUrlForLeadDelete = leadId => getVersionedUrl(wsEndpoint, `/v2/leads/${leadId}/`);

export const urlForWebsiteFetch = `${wsEndpoint}/lead-website-fetch/`;

// GET [For cache response]
export const createUrlForWebsiteFetch = url => `${wsEndpoint}/lead-website-fetch/?${p({ url })}`;

export const createParamsForLeadCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});


export const createParamsForLeadEdit = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForLeadPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForLeadDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createUrlForLeadsOfProject = params => (
    getVersionedUrl(wsEndpoint, `/v2/leads/?${p(params)}`)
);

export const createUrlForLeadEdit = leadId => (
    getVersionedUrl(wsEndpoint, `/v2/leads/${leadId}/`)
);

export const createParamsForWebsiteFetch = url => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({ url }),
});

export const createUrlForSimplifiedLeadPreview = leadId => (
    `${wsEndpoint}/lead-previews/${leadId}/`
);

export const createUrlForLeadExtractionTrigger = leadId => (
    `${wsEndpoint}/lead-extraction-trigger/${leadId}/`
);

export const createParamsForWebInfo = ({ url }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({ url }),
});
