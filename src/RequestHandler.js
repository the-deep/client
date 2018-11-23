// TODO: Remove this once RequestHandler is added to react-rest-request library
import React from 'react';
import PropTypes from 'prop-types';
import { RequestClient } from '#request';

const noOp = () => {};

const propTypes = {
    changeParams: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    onRequestChange: PropTypes.func,
    request: PropTypes.shape({}).isRequired,
};

const defaultProps = {
    changeParams: undefined,
    onRequestChange: noOp,
};

const requests = {
    request: {
        onMount: true,
        onPropsChanged: ['url', 'params', 'query', 'body'],
        url: ({ props }) => props.url,
        params: ({ props }) => props.params,
        query: ({ props }) => props.query,
        body: ({ props }) => props.body,
        method: ({ props }) => props.body,
    },
};

@RequestClient(requests)
export default class RequestHandler extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        props.onRequestChange(props.request, props.changeParams);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.request !== nextProps.request) {
            nextProps.onRequestChange(nextProps.request, nextProps.changeParams);
        }
    }

    render() {
        return null;
    }
}
