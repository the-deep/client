import {
    wsEndpoint,
    p,
} from '#config/rest';

export const dummy = 'dummy';

export const createUrlForNotificationsGet = params => (
    `${wsEndpoint}/users/me/notifications/?${p(params)}`
);
