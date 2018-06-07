import {
    wsEndpoint,
    p,
} from '#config/rest';

export const urlForProjectOptions = `${wsEndpoint}/project-options/`;

export const createUrlForProjectList = params => (
    `${wsEndpoint}/projects/?${p(params)}`
);
