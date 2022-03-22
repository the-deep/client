import {
    apiEndpoint,
    serverlessEndpoint as serverlessEndpointFromEnv,
    pdfCacheEndpoint as pdfCacheEndpointFromEnv,
    apiHttps,
} from '#base/configs/env';

export const reactAppApiHttps = location.protocol === 'https:' // eslint-disable-line no-restricted-globals
    ? 'https'
    : apiHttps;

export const wsEndpoint = !apiEndpoint
    ? 'http://localhost:8000/api/v1'
    : `${reactAppApiHttps}://${apiEndpoint}/api/v1`;

export const adminEndpoint = !apiEndpoint
    ? 'http://localhost:8000/admin/'
    : `${reactAppApiHttps}://${apiEndpoint}/admin/`;

export const serverlessEndpoint = serverlessEndpointFromEnv;
export const pdfCacheEndpoint = pdfCacheEndpointFromEnv;
