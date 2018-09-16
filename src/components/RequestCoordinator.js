import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import hoistNonReactStatics from 'hoist-non-react-statics';

import RestRequest from '#request/RestRequest';
import { tokenSelector } from '#redux';


const emptyObject = {};

const noOp = () => {};

const resolve = (variable, ...args) => (
    typeof variable === 'function' ? variable(...args) : variable
);

const propTypes = {
    token: PropTypes.shape({ access: PropTypes.string }).isRequired,
};

const mapStateWithProps = state => ({
    token: tokenSelector(state),
});

export const RestApiPropType = PropTypes.shape({
    request: PropTypes.func.isRequired,
    get: PropTypes.func.isRequired,
    post: PropTypes.func.isRequired,
});

export default ({ initalRequest }) => (WrappedComponent) => {
    @connect(mapStateWithProps)
    class View extends React.PureComponent {
        static propTypes = propTypes;

        constructor(props) {
            super(props);

            this.state = {};
            this.restApi = {
                request: this.request,
                get: this.get,
                post: this.post,
            };

            this.requests = {};
            this.requestPending = {};
            this.requestData = {};

            this.mounted = false;
        }

        componentDidMount() {
            this.forEachRequest(request => request.start());
            this.mounted = true;

            if (initalRequest) {
                const { key, method, requestData } = initalRequest;
                this.restApi[method](key, resolve(requestData, this.props));
            }
        }

        componentWillReceiveProps(nextProps) {
            if (initalRequest) {
                const { key, method, requestData, dependencies = [] } = initalRequest;
                if (dependencies.find(d => this.props[d] !== nextProps[d])) {
                    this.restApi[method](key, resolve(requestData, nextProps));
                }
            }
        }

        componentWillUnmount() {
            this.mounted = false;
            this.forEachRequest(request => request.stop());
        }

        forEachRequest = (callback) => {
            Object.keys(this.requests).forEach((key) => {
                Object.keys(this.requests[key]).forEach((id) => {
                    callback(this.requests[key][id]);
                });
            });
        }

        transformParams = (params) => {
            const { access } = this.props.token;
            if (!access) {
                return params;
            }

            // Inject Authorization
            return {
                ...params,
                headers: {
                    ...(params.headers || {}),
                    Authorization: `Bearer ${access}`,
                },
            };
        };

        get = (key, { query, url, ...args }) =>
            this.request(key, {
                ...args,
                url: () => {
                    const urlValue = resolve(url);
                    const queryValue = resolve(query);
                    if (!queryValue) {
                        return urlValue;
                    }

                    const queryString = RestRequest.prepareUrlParams(queryValue);
                    return `${urlValue}?${queryString}`;
                },
                params: {
                    method: RestRequest.GET,
                    headers: RestRequest.jsonHeaders,
                },
            })

        post = (key, { body = {}, method, ...args }) =>
            this.request(key, {
                ...args,
                params: {
                    method: resolve(method) || RestRequest.POST,
                    body: JSON.stringify(resolve(body)),
                    headers: RestRequest.jsonHeaders,
                },
            })

        request = (key, requestData) => {
            const {
                url: urlVar,
                id: idVar,
                params: paramsVar = {},
                onSuccess = noOp,
                onFailure = noOp,
            } = requestData;

            const url = resolve(urlVar);
            const id = resolve(idVar) || key;
            const params = this.transformParams(resolve(paramsVar));

            const uniqueKey = !idVar ? key : `${key}-${id}`;
            this.requestData[uniqueKey] = {
                key,
                id,
                url,
                params,
                onSuccess,
                onFailure,
            };

            if (!this.requests[key]) {
                this.requests[key] = {};
            }

            if (!this.requestPending[key]) {
                this.requestPending[key] = {};
            }

            if (this.requests[key][id]) {
                this.requests[key][id].stop();
            }

            const newRequest = new RestRequest({
                key: uniqueKey,
                url,
                params,
                onPreLoad: this.handlePreLoad,
                onPostLoad: this.handlePostLoad,
                onAbort: this.handleAbort,
                onSuccess: this.handleSuccess,
                onFailure: this.handleFailure,
                onFatal: this.handleFatal,
            });

            this.requests[key][id] = newRequest;

            this.setState({
                [`${uniqueKey}-error`]: undefined,
                [uniqueKey]: undefined,
            }, () => {
                if (this.mounted) {
                    newRequest.start();
                }
            });
        }

        refreshPending = (key) => {
            const isPending = Object.keys(this.requestPending[key]).some(
                id => this.requestPending[key][id],
            );
            const pendingKey = `${key}-pending`;
            if (this.state[pendingKey] !== isPending) {
                this.setState({ [pendingKey]: isPending });
            }
        }

        handlePreLoad = (uniqueKey) => {
            const { key, id } = this.requestData[uniqueKey];
            this.requestPending[key][id] = true;
            this.refreshPending(key);
        }

        handlePostLoad = (uniqueKey) => {
            const { key, id } = this.requestData[uniqueKey];
            this.requestPending[key][id] = false;
            this.refreshPending(key);
        }

        handleAbort = (uniqueKey) => {
            const { key, id } = this.requestData[uniqueKey];
            this.requestPending[key][id] = false;
            this.refreshPending(key);
        }

        handleSuccess = (uniqueKey, body, status) => {
            const { onSuccess } = this.requestData[uniqueKey];
            onSuccess(body, status);

            this.setState({
                [uniqueKey]: body,
            });
        }

        handleFailure = (uniqueKey, body, status) => {
            const { onFailure } = this.requestData[uniqueKey];
            onFailure(body, status);

            this.setState({
                [`${uniqueKey}-error`]: body,
            });
        }

        handleFatal = (uniqueKey, error) => {
            this.setState({
                [`${uniqueKey}-error`]: error,
            });
        }

        renderInnerComponent = (pending, pendingAction) => {
            if (pending && pendingAction === 'hide') {
                return null;
            }

            const {
                token, // eslint-disable-line no-unused-vars
                ...otherProps
            } = this.props;

            return (
                <WrappedComponent
                    key="child"
                    restApi={this.restApi}
                    {...this.state}
                    {...otherProps}
                />
            );
        }

        render() {
            const { key, pendingAction, loadingComponent: Loading } = initalRequest || emptyObject;
            const pending = key && this.state[`${key}-pending`];

            return [
                (pending && Loading) && (
                    <Loading key="loading" />
                ),
                this.renderInnerComponent(pending, pendingAction),
            ];
        }
    }

    return hoistNonReactStatics(
        View,
        WrappedComponent,
    );
};
