import {
    wsEndpoint,
} from '../config/rest';

export const urlForLanguages = `${wsEndpoint}/languages/`;

export const createUrlForLanguage = languageCode => `${wsEndpoint}/languages/${languageCode}`;
