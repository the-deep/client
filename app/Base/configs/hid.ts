import {
    hidClientId,
    hidRedirectUrl,
    hidAuthUrl,
} from './env';

const responseType = 'token';
const scope = 'profile';
const state = '12345';
// NOTE: HID doesn't seem to decode the params, so don't use `p` for now
// eslint-disable-next-line import/prefer-default-export
export const hidUrl = `${hidAuthUrl}/oauth/authorize?response_type=${responseType}&client_id=${hidClientId}&scope=${scope}&state=${state}&redirect_uri=${hidRedirectUrl}`;
