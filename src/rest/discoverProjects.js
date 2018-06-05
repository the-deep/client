import {
    wsEndpoint,
    p,
} from '#config/rest';

// eslint-disable-next-line import/prefer-default-export
export const createUrlForProjectList = params => (
    `${wsEndpoint}/projects/?${p(params)}`
);
