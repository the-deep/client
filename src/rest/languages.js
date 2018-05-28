import {
    PUT,
    commonHeaderForPost,
    wsEndpoint,
} from '#config/rest';

export const urlForLanguages = `${wsEndpoint}/languages/`;

export const createUrlForLanguage = languageCode => `${wsEndpoint}/languages/${languageCode}/`;

export const createParamsForLanguagePut = ({ links, strings }) => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        links,
        strings,
    }),
});
