import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { reverseRoute } from '#rs/utils/common';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import Pager from '#rs/components/View/Pager';
import Table from '#rs/components/View/Table';
import FormattedDate from '#rs/components/View/FormattedDate';
import Checkbox from '#rs/components/Input/Checkbox';
import AccentButton from '#rs/components/Action/Button/AccentButton';
import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import ConnectorLeadsGetRequest from '../../requests/ConnectorLeadsGetRequest';
import styles from './styles.scss';

const propTypes = {
    connectorLeads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    connectorId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    activePage: PropTypes.number.isRequired,
    leadsCount: PropTypes.number,
    selectedLeads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    setConnectorLeads: PropTypes.func.isRequired,
    leadsUrlMap: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setConnectorLeadSelection: PropTypes.func.isRequired,
    setConnectorActivePage: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    connectorLeads: [],
    selectedLeads: [],
    leadsCount: 0,
};

const MAX_LEADS_PER_REQUEST = 25;

export default class ConnectorContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static leadKeySelector = l => l.key;

    constructor(props) {
        super(props);

        this.state = { connectorLeadsLoading: true };

        this.connectorLeadsHeader = [
            {
                key: 'selected',
                order: 1,
                labelModifier: () => {
                    const {
                        connectorLeads,
                        leadsUrlMap,
                    } = this.props;

                    const newLeads = connectorLeads.filter(d => (
                        !(d.existing || leadsUrlMap[d.url])
                    ));
                    const selectedNewLeads = newLeads.filter(d => d.isSelected);

                    const selectAllSelected = (
                        selectedNewLeads.length !== 0
                        && newLeads.length === selectedNewLeads.length
                    );

                    return (
                        <Checkbox
                            key="selectAll"
                            label=""
                            className={styles.selectAllCheckbox}
                            value={selectAllSelected}
                            onChange={() => this.props.onSelectAllClick({
                                connectorId: this.props.connectorId,
                                isSelected: !selectAllSelected,
                            })}
                        />
                    );
                },
                sortable: false,
                modifier: (row) => {
                    const { leadsUrlMap } = this.props;

                    if (leadsUrlMap[row.url] || row.existing) {
                        return (
                            <Checkbox
                                title={_ts('addLeads.connectorsSelect', 'leadAlreadyAdded')}
                                key="checkbox"
                                label=""
                                className={styles.checkbox}
                                value
                                disabled
                                onChange={() => {}}
                            />
                        );
                    }

                    return (
                        <Checkbox
                            key="checkbox"
                            label=""
                            className={styles.checkbox}
                            value={row.isSelected}
                            onChange={() => this.props.setConnectorLeadSelection({
                                key: row.key,
                                isSelected: !row.isSelected,
                                connectorId: this.props.connectorId,
                            })}
                        />
                    );
                },
            },
            {
                key: 'title',
                label: _ts('addLeads.connectorsSelect', 'titleLabel'),
                order: 2,
            },
            {
                key: 'publishedOn',
                label: _ts('addLeads.connectorsSelect', 'datePublishedLabel'),
                order: 3,
                modifier: row => (
                    <FormattedDate
                        className={styles.publishedDate}
                        date={row.publishedOn}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
        ];
    }

    componentWillMount() {
        const {
            connectorId,
            projectId,
            activePage,
        } = this.props;
        if (connectorId) {
            this.startConnectorLeadsGetRequest(connectorId, projectId, activePage);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            activePage: newActivePage,
            connectorId,
            projectId,
        } = nextProps;
        const { activePage: oldActivePage } = this.props;

        if (newActivePage !== oldActivePage) {
            this.startConnectorLeadsGetRequest(connectorId, projectId, newActivePage);
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectorLeads) {
            this.requestForConnectorLeads.stop();
        }
    }

    startConnectorLeadsGetRequest = (connectorId, projectId, activePage) => {
        if (this.requestForConnectorLeads) {
            this.requestForConnectorLeads.stop();
        }
        const requestForConnectorLeads = new ConnectorLeadsGetRequest({
            setState: v => this.setState(v),
            setConnectorLeads: this.props.setConnectorLeads,
            selectedLeads: this.props.selectedLeads,
        });
        this.requestForConnectorLeads = requestForConnectorLeads.create(
            connectorId,
            projectId,
            activePage,
            MAX_LEADS_PER_REQUEST,
        );
        this.requestForConnectorLeads.start();
    }

    handleRefreshButtonClick = () => {
        const {
            connectorId,
            activePage,
            projectId,
        } = this.props;
        if (connectorId) {
            this.startConnectorLeadsGetRequest(connectorId, projectId, activePage);
        }
    }

    handlePageClick = (activePage) => {
        const {
            connectorId,
            setConnectorActivePage,
        } = this.props;

        setConnectorActivePage({ connectorId, activePage });
    }

    render() {
        const {
            connectorLeads = [],
            className,
            connectorId,
            leadsCount,
            activePage,
            selectedLeads,
        } = this.props;

        const {
            connectorLeadsLoading,
        } = this.state;

        const classNames = `${styles.connectorContent} ${className}`;
        const selectedLeadsCount = selectedLeads.length;

        return (
            <div className={classNames} >
                { connectorLeadsLoading && <LoadingAnimation large /> }
                <header className={styles.header} >
                    <div className={styles.rightContainer}>
                        <Link
                            className={styles.settingsLink}
                            target="_blank"
                            to={reverseRoute(pathNames.connectors, { connectorId })}
                        >
                            <span className={iconNames.settings} />
                        </Link>
                        <AccentButton
                            iconName={iconNames.refresh}
                            onClick={this.handleRefreshButtonClick}
                            className={styles.button}
                            transparent
                        />
                    </div>
                </header>
                <div className={styles.tableContainer} >
                    <Table
                        className={styles.table}
                        data={connectorLeads}
                        headers={this.connectorLeadsHeader}
                        keyExtractor={ConnectorContent.leadKeySelector}
                    />
                </div>
                <footer className={styles.footer} >
                    <span>
                        {_ts('addLeads.connectorsSelect', 'selectedNumberText', {
                            count: selectedLeadsCount,
                        })}
                    </span>
                    <Pager
                        activePage={activePage}
                        itemsCount={leadsCount}
                        maxItemsPerPage={MAX_LEADS_PER_REQUEST}
                        onPageClick={this.handlePageClick}
                        showItemsPerPageChange={false}
                    />
                </footer>
            </div>
        );
    }
}
