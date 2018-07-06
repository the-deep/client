import {
    commonHeaderForPost,
    wsEndpoint,
    POST,
    p,
} from '#config/rest';

export const createUrlForNotificationsGet = params => (
    `${wsEndpoint}/users/me/notifications/?${p(params)}`
);

export const createUrlForProjectJoinResponse = (projectId, requestId, response) => (
    `${wsEndpoint}/projects/${projectId}/requests/${requestId}/${response}/`
);

export const createParamsForProjectJoinResponse = body => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(body),
});
