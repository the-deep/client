import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import {
    connectorIdFromRouteSelector,
    connectorSourceSelector,
} from '#redux';

import ConnectorTestRequest from '../../requests/ConnectorTestRequest';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    connectorSource: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    paramsForTest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    connectorSource: {},
    paramsForTest: {},
};

const mapStateToProps = state => ({
    connectorId: connectorIdFromRouteSelector(state),
    connectorSource: connectorSourceSelector(state),
});

@connect(mapStateToProps)
export default class ConnectorTestResults extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { connectorTestLoading: true };
    }

    componentWillMount() {
        const {
            paramsForTest,
            connectorSource,
        } = this.props;
        this.startConnectorTestRequest(connectorSource.key, paramsForTest);
    }

    componentWillReceiveProps(nextProps) {
        const {
            paramsForTest: newParams,
            connectorSource,
        } = nextProps;
        const { paramsForTest: oldParams } = this.props;

        if (newParams !== oldParams) {
            this.startConnectorTestRequest(connectorSource.key, newParams);
        }
    }

    startConnectorTestRequest = (source, params) => {
        if (this.requestForConnectorTest) {
            this.requestForConnectorTest.stop();
        }
        const requestForConnectorTest = new ConnectorTestRequest({
            setState: v => this.setState(v),
            handleModalClose: this.handleModalClose,
        });
        this.requestForConnectorTest = requestForConnectorTest.create(source, params);
        this.requestForConnectorTest.start();
    }

    render() {
        const { connectorTestLoading } = this.state;
        const { className } = this.props;

        return (
            <div
                className={`${className} ${styles.testResults}`}
            >
                {connectorTestLoading &&
                    <LoadingAnimation large />
                }
            </div>
        );
    }
}
