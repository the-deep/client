import {
    deepEnvironment,
    apiEndpoint,
    deeplEndpoint as deeplEndPointFromEnv,
    serverlessEndpoint as serverlessEndpointFromEnv,
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

export const serverlessEndpoint = (() => {
    if (serverlessEndpointFromEnv) {
        return serverlessEndpointFromEnv;
    }
    switch (deepEnvironment) {
        case 'nightly':
            return 'https://services-nightly.thedeep.io';
        case 'alpha':
            return 'https://services-alpha.thedeep.io';
        case 'beta':
            return 'https://services.thedeep.io';
        default:
            return 'https://services-local.thedeep.io';
    }
})();

export const deeplEndPoint = (() => {
    switch (deepEnvironment) {
        case 'nightly':
            return 'https://deepl-nightly.thedeep.io';
        case 'alpha':
            return 'https://deepl-alpha.thedeep.io';
        case 'beta':
            return 'https://deepl.thedeep.io';
        default:
            return deeplEndPointFromEnv || 'http://localhost:8001/';
    }
})();
