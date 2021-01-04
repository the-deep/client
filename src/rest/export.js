import {
    wsEndpoint,
    p,
} from '#config/rest';

export const urlForExports = `${wsEndpoint}/exports/`;
export const createUrlForExportsOfProject = projectId => (
    `${wsEndpoint}/exports/?${p({ project: projectId, is_preview: 0 })}`
);
