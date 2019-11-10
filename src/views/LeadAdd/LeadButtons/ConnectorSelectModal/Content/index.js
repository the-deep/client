import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import Icon from '#rscg/Icon';
import {
    _cs,
    reverseRoute,
    listToMap,
    isTruthy,
    isDefined,
    unique,
} from '@togglecorp/fujs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Pager from '#rscv/Pager';
import Table from '#rscv/Table';
import FormattedDate from '#rscv/FormattedDate';
import Checkbox from '#rsci/Checkbox';
import modalize from '#rscg/Modalize';
import AccentButton from '#rsca/Button/AccentButton';
import Button from '#rsca/Button';
import EmmStatsModal from '#components/viewer/EmmStatsModal';
import { pathNames } from '#constants';
import { organizationTitleSelector } from '#entities/organization';
import { alterAndCombineResponseError } from '#rest';
import {
    RequestClient,
    methods,
} from '#request';

import _ts from '#ts';
import notify from '#notify';

import Filters from './Filters';
import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    connectorLeads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    connectorId: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number.isRequired,
    filters: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    activePage: PropTypes.number.isRequired,
    leadsCount: PropTypes.number,
    countPerPage: PropTypes.number,
    selectedLeads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    filtersData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    setConnectorLeads: PropTypes.func.isRequired,
    leadsUrlMap: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setConnectorLeadSelection: PropTypes.func.isRequired,
    setConnectorActivePage: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    onFiltersApply: PropTypes.func.isRequired,
    className: PropTypes.string,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const DEFAULT_MAX_LEADS_PER_REQUEST = 25;
const emptyList = [];

const defaultProps = {
    className: '',
    connectorLeads: [],
    selectedLeads: [],
    filtersData: {},
    filters: [],
    leadsCount: 0,
    countPerPage: DEFAULT_MAX_LEADS_PER_REQUEST,
};

const requestOptions = {
    connectorLeadsRequest: {
        url: ({ props: { connectorId } }) => `/v2/connectors/${connectorId}/leads/`,
        method: methods.POST,
        onMount: true,
        body: ({
            props: {
                projectId,
                filtersData,
                activePage,
                countPerPage = DEFAULT_MAX_LEADS_PER_REQUEST,
            },
        }) => ({
            project: projectId,
            offset: (activePage - 1) * countPerPage,
            limit: countPerPage,
            ...filtersData,
        }),
        onPropsChanged: [
            'activePage',
            'filtersData',
        ],
        onSuccess: ({
            response: {
                results = emptyList,
                count,
                countPerPage,
            } = {},
            props: {
                connectorId,
                selectedLeads = [],
                setConnectorLeads,
            },
        }) => {
            const selectedLeadsMap = listToMap(
                selectedLeads,
                l => l.key,
                l => l,
            );
            const leads = results.map((l) => {
                const isSelected = isTruthy(selectedLeadsMap[l.key]);

                return {
                    ...l,
                    isSelected,
                };
            });

            const uniqueLeads = unique(
                leads,
                lead => lead.key,
            );

            setConnectorLeads({
                leads: uniqueLeads,
                totalCount: count,
                connectorId,
                countPerPage,
            });
        },
        onFailure: ({ errors: { response } }) => {
            const message = alterAndCombineResponseError(response.errors);
            notify.send({
                title: _ts('addLeads', 'connectorSourcesTitle'),
                type: notify.type.ERROR,
                message,
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('addLeads', 'connectorSourcesTitle'),
                type: notify.type.ERROR,
                message: _ts('addLeads', 'connectorSourcesGetFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'connectorLeads',
        },
    },
};

@RequestClient(requestOptions)
export default class ConnectorContent extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static leadKeySelector = l => l.key;

    constructor(props) {
        super(props);

        this.state = { localFiltersData: props.filtersData };

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
                modifier: (row) => {
                    const {
                        emmEntities,
                        emmTriggers,
                        title,
                    } = row;

                    const showEmm = (isDefined(emmEntities) && emmEntities.length > 0)
                        || (isDefined(emmTriggers) && emmTriggers.length > 0);

                    return (
                        <div className={styles.titleContainer}>
                            <div className={styles.title}>
                                {title}
                            </div>
                            {showEmm &&
                                <ModalButton
                                    className={styles.emmButton}
                                    modal={
                                        <EmmStatsModal
                                            emmTriggers={emmTriggers}
                                            emmEntities={emmEntities}
                                        />
                                    }
                                >
                                    {_ts('leads', 'emmButtonLabel')}
                                </ModalButton>
                            }
                        </div>
                    );
                },
            },
            {
                key: 'source',
                label: _ts('addLeads.connectorsSelect', 'sourceTitle'),
                order: 3,
                modifier: ({
                    sourceDetail,
                    sourceRaw,
                }) => (sourceDetail ? organizationTitleSelector(sourceDetail) : sourceRaw),
            },
            {
                key: 'author',
                label: _ts('addLeads.connectorsSelect', 'authorTitle'),
                order: 4,
                modifier: ({
                    authorDetail,
                    authorRaw,
                }) => (authorDetail ? organizationTitleSelector(authorDetail) : authorRaw),
            },
            {
                key: 'publishedOn',
                label: _ts('addLeads.connectorsSelect', 'datePublishedLabel'),
                order: 5,
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

    handleRefreshButtonClick = () => {
        const {
            requests: {
                connectorLeadsRequest,
            },
            connectorId,
        } = this.props;

        if (connectorId) {
            connectorLeadsRequest.do();
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
            requests: {
                connectorLeadsRequest: { pending },
            },
            className,
            leadsCount,
            countPerPage,
            activePage,
            selectedLeads,
        } = this.props;

        const selectedLeadsCount = selectedLeads.length;
        const Header = this.renderHeader;

        return (
            <div className={_cs(styles.connectorContent, className)}>
                { pending && <LoadingAnimation /> }
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
                        maxItemsPerPage={countPerPage}
                        onPageClick={this.handlePageClick}
                        showItemsPerPageChange={false}
                    />
                </footer>
            </div>
        );
    }
}
