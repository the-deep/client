import {
    wsEndpoint,
    p,
} from '#config/rest';

export const urlForProjectOptions = `${wsEndpoint}/project-options/`;

export const createUrlForProjectStatList = params => (
    `${wsEndpoint}/projects-stat/?${p(params)}`
);
