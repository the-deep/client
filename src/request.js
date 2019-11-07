import { compose } from 'redux';
import { connect } from 'react-redux';
import {
    createRequestCoordinator,
    createRequestClient,
    methods,
} from '@togglecorp/react-rest-request';

import { sanitizeResponse } from '#utils/common';
import { wsEndpoint } from '#config/rest';
import schema from '#schema';
import { alterResponseErrorToFaramError } from '#rest';
import { tokenSelector } from '#redux';
import notify from '#notify';

export { methods, RequestHandler } from '@togglecorp/react-rest-request';

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

export const notifyOnFailure = title => ({
    error: {
        messageForNotification,
    } = {},
}) => {
    notify.send({
        title,
        type: notify.type.ERROR,
        message: messageForNotification,
        duration: notify.duration.MEDIUM,
    });
};

const mapStateToProps = state => ({
    myToken: tokenSelector(state),
});

const coordinatorOptions = {
    transformParams: (data, props) => {
        const {
            body,
            method,
        } = data;

        const params = {
            method: method || methods.GET,
            body: JSON.stringify(body),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
        };

        // NOTE: This is a hack to bypass auth for S3 requests
        // Need to fix this through use of new react-rest-request@2
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
            myToken, // eslint-disable-line no-unused-vars
            ...otherProps
        } = props;
        return otherProps;
    },

    transformUrl: (url) => {
        if (/^https?:\/\//i.test(url)) {
            return url;
        }
        return getVersionedUrl(wsEndpoint, url);
    },

    transformResponse: (body, request) => {
        const {
            url,
            method,
            extras,
        } = request;

        // TODO: add null sanitization here

        if (!extras || extras.schemaName === undefined) {
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
