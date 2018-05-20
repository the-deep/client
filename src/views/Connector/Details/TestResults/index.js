import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';

import {
    connectorsListSelector,
    connectorIdFromRouteSelector,
    connectorDetailsSelector,
} from '../../../../redux';

const propTypes = {
    className: PropTypes.string,
    connectorId: PropTypes.number,
    connectorDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    connectorDetails: {},
    connectorId: undefined,
};

const mapStateToProps = state => ({
    connectorDetails: connectorDetailsSelector(state),
    connectorsList: connectorsListSelector(state),
    connectorId: connectorIdFromRouteSelector(state),
});

@connect(mapStateToProps)
export default class ConnectorTestResults extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            className,
            connectorId,
            connectorDetails,
        } = props;

        this.state = {
            connectorDataLoading: true,
            requestFailure: false,
        };
    }

    render() {
        return (
            <div>Testing testing 1, 2, 3</div>
        );
    }
}
