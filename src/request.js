import { compose } from 'redux';
import { connect } from 'react-redux';
import {
    createRequestCoordinator,
    createRequestClient,
    methods,
} from '@togglecorp/react-rest-request';

import { sanitizeResponse } from '#utils/common';
import {
    wsEndpoint,
    serverlessEndpoint,
    getVersionedUrl,
} from '#config/rest';
import schema from '#schema';
import { alterResponseErrorToFaramError } from '#rest';
import { tokenSelector } from '#redux';

export { methods, RequestHandler } from '@togglecorp/react-rest-request';

const mapStateToProps = state => ({
    myToken: tokenSelector(state),
});

const getFormData = (jsonData) => {
    const formData = new FormData();
    Object.keys(jsonData || {}).forEach(
        (key) => {
            const value = jsonData[key] || {};
            if (value.prop && value.prop.constructor === Array) {
                value.forEach(v => formData.append(key, v));
            } else {
                formData.append(key, value);
            }
        },
    );
    return formData;
};

const coordinatorOptions = {
    transformParams: (data, props) => {
        const {
            body,
            method,
            extras = {},
        } = data;

        const newBody = extras.hasFile
            ? getFormData(body)
            : JSON.stringify(body);

        const newHeaders = extras.hasFile
            ? {
                Accept: 'application/json',
            }
            : {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            };

        const params = {
            method: method || methods.GET,
            body: newBody,
            headers: newHeaders,
        };

        // NOTE: This is a hack to bypass auth for S3 requests
        // Need to fix this through use of new react-rest-request@2
        // FIXME: react-rest-request@2 has been used
        // need to fix this using extras
        const doNotAuth = body && body.$noAuth;

        const {
            myToken: { access },
        } = props;

        if (access && !doNotAuth) {
            params.headers.Authorization = `Bearer ${access}`;
        }

        return params;
    },

    transformProps: (props) => {
        const {
            myToken, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            ...otherProps
        } = props;
        return otherProps;
    },

    transformUrl: (url, request) => {
        const {
            extras = {},
        } = request;

        if (extras.type === 'serverless') {
            return `${serverlessEndpoint}${url}`;
        }

        if (/^https?:\/\//i.test(url)) {
            return url;
        }
        return getVersionedUrl(wsEndpoint, url);
    },

    transformResponse: (body, request) => {
        const {
            url,
            method,
            extras = {},
        } = request;

        // TODO: add null sanitization here

        if (extras.schemaName === undefined) {
            // NOTE: usually there is no response body for DELETE
            if (method !== methods.DELETE) {
                console.error(`Schema is not defined for ${url} ${method}`);
            }
        } else {
            try {
                schema.validate(body, extras.schemaName);
            } catch (e) {
                console.error(url, method, body, e.message);
                throw (e);
            }
        }
        return sanitizeResponse(body);
    },

    transformErrors: (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        // FIXME: Use strings for this
        const messageForNotification = (
            faramErrors
            && faramErrors.$internal
            && faramErrors.$internal.join(' ')
        ) || 'There was some error while performing this action. Please try again.';

        return {
            response,
            faramErrors,
            messageForNotification,
        };
    },
};

export const RequestCoordinator = compose(
    connect(mapStateToProps),
    createRequestCoordinator(coordinatorOptions),
);

export const RequestClient = createRequestClient;
