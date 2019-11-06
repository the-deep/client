import {
    wsEndpoint,
    POST,
    PATCH,
    commonHeaderForPost,
} from '#config/rest';

export const createUrlForConnector = connectorId => `${wsEndpoint}/connectors/${connectorId}/`;
export const createUrlForConnectorleads = connectorId => (
    `${wsEndpoint}/connectors/${connectorId}/leads/`
);
export const createParamsForConnectorLeads = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForConnectorPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});
