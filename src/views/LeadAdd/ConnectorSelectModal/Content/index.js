import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import Icon from '#rscg/Icon';
import { reverseRoute } from '@togglecorp/fujs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Pager from '#rscv/Pager';
import Table from '#rscv/Table';
import FormattedDate from '#rscv/FormattedDate';
import Checkbox from '#rsci/Checkbox';
import AccentButton from '#rsca/Button/AccentButton';
import { pathNames } from '#constants';
import _ts from '#ts';

import ConnectorLeadsGetRequest from '../../requests/ConnectorLeadsGetRequest';
import Filters from './Filters';
import styles from './styles.scss';

const propTypes = {
    connectorLeads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    connectorId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    filters: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    activePage: PropTypes.number.isRequired,
    leadsCount: PropTypes.number,
    countPerPage: PropTypes.number,
    selectedLeads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    filtersData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setConnectorLeads: PropTypes.func.isRequired,
    leadsUrlMap: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setConnectorLeadSelection: PropTypes.func.isRequired,
    setConnectorActivePage: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    onFiltersApply: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    connectorLeads: [],
    selectedLeads: [],
    filtersData: {},
    filters: [],
    leadsCount: 0,
    countPerPage: 0,
};

const DEFAULT_MAX_LEADS_PER_REQUEST = 25;

export default class ConnectorContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static leadKeySelector = l => l.key;

    constructor(props) {
        super(props);

        this.state = {
            connectorLeadsLoading: true,
            localFiltersData: props.filtersData,
        };

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
            filtersData,
            countPerPage,
        } = this.props;

        if (connectorId) {
            this.startConnectorLeadsGetRequest(
                connectorId,
                projectId,
                activePage,
                filtersData,
                countPerPage,
            );
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            activePage: newActivePage,
            connectorId,
            projectId,
            filtersData: newFiltersData,
            countPerPage,
        } = nextProps;

        const {
            activePage: oldActivePage,
            filtersData: oldFiltersData,
        } = this.props;

        if (newActivePage !== oldActivePage || newFiltersData !== oldFiltersData) {
            this.startConnectorLeadsGetRequest(
                connectorId,
                projectId,
                newActivePage,
                newFiltersData,
                countPerPage,
            );
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectorLeads) {
            this.requestForConnectorLeads.stop();
        }
    }

    startConnectorLeadsGetRequest = (
        connectorId,
        projectId,
        activePage,
        localFiltersData,
        countPerPage,
    ) => {
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
            countPerPage || DEFAULT_MAX_LEADS_PER_REQUEST,
            localFiltersData,
        );
        this.requestForConnectorLeads.start();
    }

    handleRefreshButtonClick = () => {
        const {
            connectorId,
            activePage,
            projectId,
            filtersData,
        } = this.props;

        if (connectorId) {
            this.startConnectorLeadsGetRequest(
                connectorId,
                projectId,
                activePage,
                filtersData,
            );
        }
    }

    handlePageClick = (activePage) => {
        const {
            connectorId,
            setConnectorActivePage,
        } = this.props;

        setConnectorActivePage({ connectorId, activePage });
    }

    handleFiltersChange = (newValue) => {
        this.setState({ localFiltersData: newValue });
    }

    handleFiltersApply = (value) => {
        const {
            connectorId,
            onFiltersApply,
        } = this.props;

        onFiltersApply(value, connectorId);
    }

    renderHeader = () => {
        const {
            connectorId,
            filters,
        } = this.props;
        const { localFiltersData } = this.state;

        return (
            <header className={styles.header}>
                <div className={styles.leftContainer}>
                    {filters.length > 0 ? (
                        <Filters
                            filters={filters}
                            value={localFiltersData}
                            onChange={this.handleFiltersChange}
                            onApply={this.handleFiltersApply}
                        />
                    ) : (
                        <span>
                            {_ts('addLeads.connectorsSelect', 'noFiltersMessage')}
                        </span>
                    )}
                </div>
                <div className={styles.rightContainer}>
                    <Link
                        className={styles.settingsLink}
                        target="_blank"
                        to={reverseRoute(pathNames.connectors, { connectorId })}
                    >
                        <Icon name="settings" />
                    </Link>
                    <AccentButton
                        iconName="refresh"
                        onClick={this.handleRefreshButtonClick}
                        className={styles.button}
                        transparent
                    />
                </div>
            </header>
        );
    }

    render() {
        const {
            connectorLeads = [],
            className,
            leadsCount,
            countPerPage,
            activePage,
            selectedLeads,
        } = this.props;

        const { connectorLeadsLoading } = this.state;

        const classNames = `${styles.connectorContent} ${className}`;
        const selectedLeadsCount = selectedLeads.length;
        const Header = this.renderHeader;

        return (
            <div className={classNames} >
                { connectorLeadsLoading && <LoadingAnimation /> }
                <Header />
                <div className={styles.tableContainer} >
                    <Table
                        className={styles.table}
                        data={connectorLeads}
                        headers={this.connectorLeadsHeader}
                        keySelector={ConnectorContent.leadKeySelector}
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
                        maxItemsPerPage={countPerPage || DEFAULT_MAX_LEADS_PER_REQUEST}
                        onPageClick={this.handlePageClick}
                        showItemsPerPageChange={false}
                    />
                </footer>
            </div>
        );
    }
}
