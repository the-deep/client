import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import Table from '#rscv/Table';
import Modal from '#rscv/Modal';
import Button from '#rsca/Button';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import FormattedDate from '#rscv/FormattedDate';
import {
    connectorIdFromRouteSelector,
    connectorSourceSelector,
} from '#redux';
import { alterAndCombineResponseError } from '#rest';
import {
    RequestClient,
    requestMethods,
} from '#request';

import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    leadsGet: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/forbid-prop-types, react/no-unused-prop-types
    connectorSource: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types, react/no-unused-prop-types
    paramsForTest: PropTypes.object,
    closeModal: PropTypes.func,
};

const defaultProps = {
    closeModal: () => {},
    className: '',
    title: '',
    connectorSource: {},
    paramsForTest: {},
};

const mapStateToProps = state => ({
    connectorId: connectorIdFromRouteSelector(state),
    connectorSource: connectorSourceSelector(state),
});

const requests = {
    leadsGet: {
        url: ({ props: { connectorSource } }) => `/connector-sources/${connectorSource.key}/leads/`,
        query: {
            limit: 10,
        },
        body: ({ props: { paramsForTest } }) => paramsForTest,
        method: requestMethods.POST,
        onMount: true,
        onFailure: ({ response }) => {
            const message = alterAndCombineResponseError(response.errors).join(' ');
            notify.send({
                title: _ts('connector', 'connectorTitle'),
                type: notify.type.ERROR,
                message,
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('connector', 'connectorTitle'),
                type: notify.type.ERROR,
                message: _ts('connector', 'connectorTestFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
        schemaName: 'connectorLeads',
    },
};

@connect(mapStateToProps)
@RequestClient(requests)
export default class ConnectorTestResults extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static leadKeySelector = l => l.key;

    constructor(props) {
        super(props);

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

    getFilteredLeads = memoize(leads => leads.filter(r => r.key));

    render() {
        const {
            className,
            title,
            leadsGet: {
                pending,
                response: {
                    results: leads = [],
                } = {},
            },
            closeModal,
        } = this.props;

        const testLeads = this.getFilteredLeads(leads);

        return (
            <Modal
                className={_cs(className, styles.testResults)}
                closeOnEscape
                onClose={closeModal}
            >
                <ModalHeader
                    className={styles.header}
                    title={_ts('connector', 'testResultsHeading', { title })}
                    rightComponent={
                        <Button
                            iconName="close"
                            transparent
                            onClick={closeModal}
                        />
                    }
                />
                <ModalBody className={styles.modalBody}>
                    <Table
                        data={testLeads}
                        className={styles.table}
                        headers={this.tableHeader}
                        keySelector={ConnectorTestResults.leadKeySelector}
                        pending={pending}
                    />
                </ModalBody>
            </Modal>
        );
    }
}
