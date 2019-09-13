import {
    wsEndpoint,
    POST,
    PATCH,
    p,
    commonHeaderForPost,
} from '#config/rest';

const connectorsMiniFields = ['id', 'title', 'version_id', 'source', 'role', 'filters'];

export const urlForConnectors = `${wsEndpoint}/connectors/?${p({ fields: connectorsMiniFields })}`;
export const createUrlForConnector = connectorId => `${wsEndpoint}/connectors/${connectorId}/`;
export const createUrlForConnectorleads = connectorId => (
    `${wsEndpoint}/connectors/${connectorId}/leads/`
);
export const createUrlForConnectorsOfProject = projectId => `${urlForConnectors}&projects=${projectId}`;

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
