import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import {
    isNotDefined,
    caseInsensitiveSubmatch,
    compareStringSearch,
} from '@togglecorp/fujs';

import Page from '#rscv/Page';
import Modal from '#rscv/Modal';
import Message from '#rscv/Message';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import SearchInput from '#rsci/SearchInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import ListView from '#rscv/List/ListView';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import {
    connectorsListSelector,
    connectorIdFromRouteSelector,
    connectorSourcesSelector,

    setConnectorSourcesAction,
    setUserConnectorsAction,
} from '#redux';

import notify from '#notify';
import _ts from '#ts';

import AddConnectorForm from './AddForm';
import ConnectorDetails from './Details';
import ConnectorListItem from './ConnectorItem';

import styles from './styles.scss';

const propTypes = {
    connectorId: PropTypes.number,
    // eslint-disable-next-line react/no-unused-prop-types
    setUserConnectors: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setConnectorSources: PropTypes.func.isRequired,
    connectorsList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    connectorSources: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    connectorSourcesGet: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    connectorId: undefined,
};

const mapStateToProps = state => ({
    connectorsList: connectorsListSelector(state),
    connectorId: connectorIdFromRouteSelector(state),
    connectorSources: connectorSourcesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserConnectors: params => dispatch(setUserConnectorsAction(params)),
    setConnectorSources: params => dispatch(setConnectorSourcesAction(params)),
});

const emptyList = [];

const requests = {
    connectorsGet: {
        url: '/connectors/',
        method: requestMethods.GET,
        onMount: true,
        query: {
            role: ['admin'],
            fields: [
                'id',
                'title',
                'version_id',
                'source',
                'role',
                'filters',
                'status',
            ],
        },
        onSuccess: ({ response, props: { setUserConnectors } }) => {
            const connectors = response.results || emptyList;
            const formattedConnectors = {};

            connectors
                .filter(c => c.status === 'working')
                .forEach((c) => {
                    formattedConnectors[c.id] = {
                        id: c.id,
                        versionId: c.versionId,
                        source: c.source,
                        title: c.title,
                    };
                });
            setUserConnectors({ connectors: formattedConnectors });
        },
        onFailure: ({ response }) => {
            const message = response.$internal.join(' ');
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
                message: _ts('connector', 'connectorGetFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
        schemaName: 'connectors',
    },
    connectorSourcesGet: {
        url: '/connector-sources/',
        method: requestMethods.GET,
        onMount: true,
        onSuccess: ({
            response,
            props: { setConnectorSources },
        }) => {
            const connectorSources = response.results.filter(s => s.status === 'working');
            setConnectorSources({ connectorSources });
        },
        onFailure: ({ response }) => {
            notify.send({
                title: _ts('connector', 'connectorSourcesTitle'),
                type: notify.type.ERROR,
                message: response.error,
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('connector', 'connectorSourcesTitle'),
                type: notify.type.ERROR,
                message: _ts('connector', 'connectorSourcesGetFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
        schemaName: 'connectorSources',
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class Connector extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static connectorKeySelector = c => c.id;

    static connectorSourceSelector = c => c.source;

    constructor(props) {
        super(props);

        this.state = {
            searchInputValue: '',
            showAddConnectorModal: false,
        };
    }

    getListAfterSearch = memoize((connectorsList, searchInputValue) => (
        connectorsList
            .filter(c => caseInsensitiveSubmatch(c.title, searchInputValue))
            .sort((a, b) => compareStringSearch(a.title, b.title, searchInputValue))
    ))

    handleSearchInputChange = (searchInputValue) => {
        this.setState({ searchInputValue });
    };

    handleAddConnectorClick = () => {
        this.setState({ showAddConnectorModal: true });
    }

    handleAddConnectorModalClose = () => {
        this.setState({ showAddConnectorModal: false });
    }

    connectorRendererParams = (key, data) => ({
        currentConnectorId: this.props.connectorId,
        connectorId: key,
        title: data.title,
    })

    connectorGroupRendererParams = (groupKey) => {
        const { connectorSources } = this.props;

        return {
            children: connectorSources[groupKey] ? connectorSources[groupKey].title : groupKey,
        };
    }

    renderHeader = () => {
        const { searchInputValue } = this.state;

        const AddModal = this.renderAddModal;

        return (
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {_ts('connector', 'headerConnectors')}
                </h3>
                <PrimaryButton
                    onClick={this.handleAddConnectorClick}
                    iconName="add"
                >
                    {_ts('connector', 'addConnectorButtonLabel')}
                </PrimaryButton>
                <SearchInput
                    onChange={this.handleSearchInputChange}
                    placeholder={_ts('connector', 'searchConnectorPlaceholder')}
                    className={styles.searchInput}
                    value={searchInputValue}
                    showLabel={false}
                    showHintAndError={false}
                />
                <AddModal />
            </header>
        );
    }

    renderAddModal = () => {
        const { showAddConnectorModal } = this.state;

        if (!showAddConnectorModal) {
            return null;
        }

        return (
            <Modal>
                <ModalHeader
                    title={_ts('connector', 'addConnectorModalTitle')}
                    rightComponent={
                        <PrimaryButton
                            onClick={this.handleAddConnectorModalClose}
                            transparent
                            iconName="close"
                        />
                    }
                />
                <ModalBody>
                    <AddConnectorForm
                        onModalClose={this.handleAddConnectorModalClose}
                    />
                </ModalBody>
            </Modal>
        );
    }

    renderDetails = () => {
        const {
            connectorId,
            connectorsList,
            connectorSourcesGet: {
                pending: connectorSourcesPending,
            },
            connectorSources,
        } = this.props;

        if (connectorSourcesPending) {
            return (
                <LoadingAnimation className={styles.noConnector} />
            );
        }

        if (connectorsList.length === 0) {
            return (
                <Message className={styles.noConnector}>
                    {_ts('connector', 'noConnectorsLabel')}
                </Message>
            );
        }

        if (!connectorId) {
            return (
                <Message className={styles.noConnector}>
                    {_ts('connector', 'noConnectorSelectedTitle')}
                </Message>
            );
        }

        const selectedConnector = connectorsList.find(c => c.id === connectorId);

        if (isNotDefined(selectedConnector)) {
            return (
                <Message className={styles.noConnector}>
                    {_ts('connector', 'errorFetchingSelectedConnector')}
                </Message>
            );
        }

        if (isNotDefined(connectorSources[selectedConnector.source])) {
            return (
                <Message className={styles.noConnector}>
                    {_ts('connector', 'errorFetchingConnectorSources')}
                </Message>
            );
        }

        return (
            <ConnectorDetails
                // clears local state when connectorId is changed
                key={connectorId}
                className={styles.connectorDetails}
                connectorId={connectorId}
            />
        );
    }

    render() {
        const { connectorsList } = this.props;
        const { searchInputValue } = this.state;

        const displayConnectorsList = this.getListAfterSearch(connectorsList, searchInputValue);

        const Header = this.renderHeader;
        const Details = this.renderDetails;

        return (
            <Page
                className={styles.connectors}
                sidebarClassName={styles.sidebar}
                sidebar={
                    <React.Fragment>
                        <Header />
                        <ListView
                            className={styles.connectorsList}
                            data={displayConnectorsList}
                            keySelector={Connector.connectorKeySelector}
                            groupRendererClassName={styles.group}
                            groupKeySelector={Connector.connectorSourceSelector}
                            groupRendererParams={this.connectorGroupRendererParams}
                            rendererParams={this.connectorRendererParams}
                            renderer={ConnectorListItem}
                        />
                    </React.Fragment>
                }
                mainContentClassName={styles.mainContent}
                mainContent={<Details />}
            />
        );
    }
}
