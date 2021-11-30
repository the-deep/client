import {
    wsEndpoint,
    authorizationHeaderForPost,
} from '#config/rest';

export const urlForUpload = `${wsEndpoint}/files/`;
export const createUrlForGalleryFile = fileId => `${wsEndpoint}/files/${fileId}/`;

export const createParamsForFileUpload = (body = {}) => ({
    withCredentials: true,
    headers: authorizationHeaderForPost,
    body,
});
