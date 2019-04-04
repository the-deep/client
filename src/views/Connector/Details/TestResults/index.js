import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Table from '#rscv/Table';
import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import {
    connectorIdFromRouteSelector,
    connectorSourceSelector,
} from '#redux';
import _ts from '#ts';

import ConnectorTestRequest from '../../requests/ConnectorTestRequest';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    connectorSource: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    paramsForTest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onConnectorTestLoading: PropTypes.func.isRequired,
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
    static leadKeySelector = l => l.key;

    constructor(props) {
        super(props);

        this.state = {
            connectorTestLoading: true,
            testLeads: [],
        };

        this.tableHeader = [
            {
                key: 'title',
                label: _ts('connector', 'titleLabel'),
                order: 1,
            },
            {
                key: 'publishedOn',
                label: _ts('connector', 'datePublishedLabel'),
                order: 2,
                modifier: row => (
                    <FormattedDate
                        className={styles.publishedDate}
                        date={row.publishedOn}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'website',
                label: _ts('connector', 'websiteLabel'),
                order: 3,
            },
            {
                key: 'url',
                label: _ts('connector', 'urlLabel'),
                order: 4,
            },
            {
                key: 'source',
                label: _ts('connector', 'sourceLabel'),
                order: 5,
            },
        ];
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

    componentWillUnmount() {
        if (this.requestForConnectorTest) {
            this.requestForConnectorTest.stop();
        }
    }

    startConnectorTestRequest = (source, params) => {
        if (this.requestForConnectorTest) {
            this.requestForConnectorTest.stop();
        }
        const requestForConnectorTest = new ConnectorTestRequest({
            setState: v => this.setState(v),
            onConnectorTestLoading: this.props.onConnectorTestLoading,
        });
        this.requestForConnectorTest = requestForConnectorTest.create(source, params);
        this.requestForConnectorTest.start();
    }

    render() {
        const {
            connectorTestLoading,
            testLeads,
        } = this.state;
        const { className } = this.props;
        const { tableHeader } = this;

        return (
            <div className={`${className} ${styles.testResults}`} >
                {connectorTestLoading && <LoadingAnimation /> }
                <header className={styles.header} >
                    <h4>
                        {_ts('connector', 'testResultsHeading')}
                    </h4>
                </header>
                <div className={styles.tableContainer} >
                    <Table
                        data={testLeads}
                        className={styles.table}
                        headers={tableHeader}
                        keySelector={ConnectorTestResults.leadKeySelector}
                    />
                </div>
            </div>
        );
    }
}
