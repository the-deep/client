export const reactAppApiHttps = location.protocol === 'https:' // eslint-disable-line no-restricted-globals
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
