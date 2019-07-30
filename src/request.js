import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import {
    createRequestCoordinator,
    createRequestClient,
    RestRequest,
} from '@togglecorp/react-rest-request';

import update from '#rsu/immutable-update';

import { wsEndpoint } from '#config/rest';
import schema from '#schema';
import { alterResponseErrorToFaramError } from '#rest';
import { tokenSelector } from '#redux';
import notify from '#notify';

const mapStateToProps = state => ({
    token: tokenSelector(state),
});

const CustomRequestCoordinator = createRequestCoordinator({
    transformParams: (params, props) => {
        const { access } = props.token;
        if (!access) {
            return params;
        }

        const settings = {
            headers: { $auto: {
                Authorization: { $set: `Bearer ${access}` },
            } },
        };

        return update(params, settings);
    },
    transformProps: (props) => {
        const {
            token, // eslint-disable-line no-unused-vars
            ...otherProps
        } = props;
        return otherProps;
    },

    transformUrl: (url) => {
        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        return `${wsEndpoint}${url}`;
    },

    transformResponse: (body, request) => {
        const {
            url,
            method,
            schemaName,
        } = request;
        if (schemaName === undefined) {
            // NOTE: usually there is no response body for DELETE
            if (method !== 'DELETE') {
                console.error(`Schema is not defined for ${url} ${method}`);
            }
        } else {
            try {
                schema.validate(body, schemaName);
            } catch (e) {
                console.error(url, method, body, e.message);
                throw (e);
            }
        }
        return body;
    },

    /*
     * FIXME: Use this one
    transformErrors: ({ errors, ...otherProps }) => ({
        ...otherProps,
        body: alterResponseErrorToFaramError(errors),
    }),
    */
    transformErrors: (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        return {
            response,
            faramErrors,
        };
    },
});

export const RequestCoordinator = compose(
    connect(mapStateToProps),
    CustomRequestCoordinator,
);

export const RequestClient = createRequestClient();
RequestClient.propType = PropTypes.shape({
    do: PropTypes.func,
    pending: PropTypes.bool,
    response: PropTypes.object,
    error: PropTypes.object,
});

// TODO: Fix handling of errors both in frontend and backend
export const notifyOnFailure = title => ({
    error: {
        body,
    } = {},
}) => {
    const message = body.$internal.join(' ');

    notify.send({
        title,
        type: notify.type.ERROR,
        message,
        duration: notify.duration.MEDIUM,
    });
};

export const requestMethods = RestRequest.methods;
