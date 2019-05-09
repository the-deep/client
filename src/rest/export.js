import {
    wsEndpoint,
    POST,
    commonHeaderForPost,
    p,
} from '#config/rest';


export const urlForExportTrigger = `${wsEndpoint}/export-trigger/`;
export const urlForExports = `${wsEndpoint}/exports/`;
export const createUrlForExportsOfProject = projectId => (
    `${wsEndpoint}/exports/?${p({ project: projectId, is_preview: 0 })}`
);

export const createUrlForExport = exportId => `${urlForExports}${exportId}/`;
export const createUrlForExportStatus = projectId => `${wsEndpoint}/projects/${projectId}/export-status/`;

export const createParamsForExportTrigger = filters => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({ filters }),
});
