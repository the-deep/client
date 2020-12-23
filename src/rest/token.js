import {
    wsEndpoint,
    POST,
    commonHeaderForPost,
} from '#config/rest';

export const urlForTokenRefresh = `${wsEndpoint}/token/refresh/`;
export const createParamsForTokenRefresh = ({ refresh }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        refresh,
    }),
});
