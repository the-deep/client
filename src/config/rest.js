import { prepareUrlParams } from '@togglecorp/react-rest-request';

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        const part = parts.pop();
        return part && part.split(';').shift();
    }
    return undefined;
}

export function getVersionedUrl(endpoint, url) {
    const oldVersionString = '/v1';
    const versionString = '/v2';
    if (!url.startsWith(versionString)) {
        return `${endpoint}${url}`;
    }
    const startIndex = 0;
    const endIndex = endpoint.search(oldVersionString);
    const newEndpoint = endpoint.slice(startIndex, endIndex);
    return `${newEndpoint}${url}`;
}

export const POST = 'POST';
export const GET = 'GET';
export const PUT = 'PUT';
export const DELETE = 'DELETE';
export const PATCH = 'PATCH';

// ENDPOINTS

const reactAppApiHttps = location.protocol === 'https:' // eslint-disable-line no-restricted-globals
    ? 'https'
    : process.env.REACT_APP_API_HTTPS;

export const wsEndpoint = !process.env.REACT_APP_API_END
    ? 'http://localhost:8000/api/v1'
    : `${reactAppApiHttps}://${process.env.REACT_APP_API_END}/api/v1`;

export const adminEndpoint = !process.env.REACT_APP_ADMIN_END
    ? 'http://localhost:8000/admin/'
    : `${reactAppApiHttps}://${process.env.REACT_APP_ADMIN_END}/admin/`;

export const serverlessEndpoint = (() => {
    if (process.env.REACT_APP_SERVERLESS_DOMAIN) {
        return process.env.REACT_APP_SERVERLESS_DOMAIN;
    }
    switch (process.env.REACT_APP_DEEP_ENVIRONMENT) {
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
    switch (process.env.REACT_APP_DEEP_ENVIRONMENT) {
        case 'nightly':
            return 'https://deepl-nightly.thedeep.io';
        case 'alpha':
            return 'https://deepl-alpha.thedeep.io';
        case 'beta':
            return 'https://deepl.thedeep.io';
        default:
            return process.env.REACT_APP_DEEPL_END || 'http://localhost:8001/';
    }
})();

// COMMON HEADERS - POST

const csrftoken = getCookie(`deep-${process.env.REACT_APP_DEEP_ENVIRONMENT}-csrftoken`);

export const commonHeaderForPostExternal = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken,
};

export const authorizationHeaderForPost = {
    'X-CSRFToken': csrftoken,
};

export const commonHeaderForPost = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken,
};

// COMMON HEADERS - GET

export const commonHeaderForGet = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken,
};

export const commonHeaderForGetExternal = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken,
};

// ALIAS

export const p = prepareUrlParams;
