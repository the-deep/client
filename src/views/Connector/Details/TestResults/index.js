import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import {
    _cs,
    isValidUrl,
} from '@togglecorp/fujs';

import Table from '#rscv/Table';
import Modal from '#rscv/Modal';
import Button from '#rsca/Button';
import ListView from '#rscv/List/ListView';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import { organizationTitleSelector } from '#entities/organization';
import FormattedDate from '#rscv/FormattedDate';
import {
    connectorIdFromRouteSelector,
    connectorSourceSelector,
} from '#redux';
import { alterAndCombineResponseError } from '#rest';
import {
    RequestClient,
    methods,
} from '#request';
import EmmTrigger from '#components/viewer/EmmTrigger';
import EmmEntity from '#components/viewer/EmmEntity';

import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

const EmptyComponent = () => '';

const TableEmptyComponent = () => _ts('connector', 'emptyTestResults');

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types, react/no-unused-prop-types
    connectorSource: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types, react/no-unused-prop-types
    paramsForTest: PropTypes.object,
    closeModal: PropTypes.func,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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

const requestOptions = {
    leadsGet: {
        url: ({ props: { connectorSource } }) => `/v2/connector-sources/${connectorSource.key}/leads/`,
        query: {
            limit: 10,
        },
        body: ({ props: { paramsForTest } }) => paramsForTest,
        method: methods.POST,
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
        extras: {
            schemaName: 'connectorLeads',
        },
    },
};

const emmTriggerRendererParams = (key, data) => ({
    keyword: data.emmKeyword,
    riskFactor: data.emmRiskFactor,
    count: data.count,
});

const emmEntitiesRendererParams = (key, data) => ({
    name: data.name,
});

const emmTriggerKeySelector = t => t.emmKeyword;
const emmEntitiesKeySelector = t => t.name;

@connect(mapStateToProps)
@RequestClient(requestOptions)
export default class ConnectorTestResults extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static leadKeySelector = l => l.key;

    constructor(props) {
        super(props);
        const { connectorSource } = this.props;

        let tableHeader = [
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
                modifier: row => (
                    isValidUrl(row.website) ? (
                        <a
                            title={row.website}
                            href={row.website}
                            className={styles.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {row.website}
                        </a>
                    ) : (
                        <div
                            className={styles.link}
                            title={row.website}
                        >
                            {row.website}
                        </div>
                    )
                ),
            },
            {
                key: 'url',
                label: _ts('connector', 'urlLabel'),
                order: 4,
                modifier: row => (
                    isValidUrl(row.url) ? (
                        <a
                            title={row.url}
                            href={row.url}
                            className={styles.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {row.url}
                        </a>
                    ) : (
                        <div
                            className={styles.link}
                            title={row.url}
                        >
                            {row.url}
                        </div>
                    )
                ),
            },
            {
                key: 'source',
                label: _ts('connector', 'sourceLabel'),
                order: 5,
                modifier: ({
                    sourceDetail,
                    sourceRaw,
                }) => (sourceDetail ? organizationTitleSelector(sourceDetail) : sourceRaw),
            },
            {
                key: 'author',
                label: _ts('connector', 'authorLabel'),
                order: 6,
                modifier: ({
                    authorsDetail,
                    authorRaw,
                }) => (
                    (authorsDetail && authorsDetail.length > 0)
                        ? authorsDetail.map(organizationTitleSelector).join(', ')
                        : authorRaw
                ),
            },
        ];
        if (connectorSource.key === 'emm') {
            tableHeader = [
                ...tableHeader,
                {
                    key: 'emmTriggers',
                    label: _ts('connector', 'emmTriggerTitle'),
                    order: 7,
                    modifier: row => (
                        <ListView
                            className={styles.emmTriggers}
                            renderer={EmmTrigger}
                            data={row.emmTriggers}
                            keySelector={emmTriggerKeySelector}
                            rendererParams={emmTriggerRendererParams}
                            emptyComponent={EmptyComponent}
                        />
                    ),
                },
                {
                    key: 'emmEntities',
                    label: _ts('connector', 'emmEntitiesTitle'),
                    order: 8,
                    modifier: row => (
                        <ListView
                            className={styles.emmEntity}
                            renderer={EmmEntity}
                            data={row.emmEntities}
                            keySelector={emmEntitiesKeySelector}
                            rendererParams={emmEntitiesRendererParams}
                            emptyComponent={EmptyComponent}
                        />
                    ),
                },
            ];
        }

        this.tableHeader = tableHeader;
    }

    getFilteredLeads = memoize(leads => leads.filter(r => r.key));

    render() {
        const {
            className,
            title,
            requests: {
                leadsGet: {
                    pending,
                    response: {
                        results: leads = [],
                    } = {},
                },
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
                        emptyComponent={TableEmptyComponent}
                    />
                </ModalBody>
            </Modal>
        );
    }
}
