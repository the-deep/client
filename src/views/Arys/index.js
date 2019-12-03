import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { getFiltersForRequest } from '#entities/lead';
import {
    Redirect,
    Link,
} from 'react-router-dom';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';
import Page from '#rscv/Page';
import FormattedDate from '#rscv/FormattedDate';
import Pager from '#rscv/Pager';
import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';
import TableEmptyComponent from '#components/viewer/TableEmptyComponent';
import {
    _cs,
    reverseRoute,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import {
    activeProjectIdFromStateSelector,
    projectIdFromRouteSelector,

    totalArysCountForProjectSelector,
    aryPageActivePageSelector,
    aryPageActiveSortSelector,
    aryPageFilterSelector,

    setAryPageActivePageAction,
    setAryPageActiveSortAction,
} from '#redux';
import { pathNames } from '#constants/';
import notify from '#notify';
import _ts from '#ts';

import ActionButtons from './ActionButtons';
import FilterArysForm from './FilterArysForm';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    projectId: PropTypes.number.isRequired,
    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    setAryPageActiveSort: PropTypes.func.isRequired,
    setAryPageActivePage: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),

    projectId: projectIdFromRouteSelector(state),
    totalArysCount: totalArysCountForProjectSelector(state),
    activePage: aryPageActivePageSelector(state),
    activeSort: aryPageActiveSortSelector(state),
    filters: aryPageFilterSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAryPageActivePage: params => dispatch(setAryPageActivePageAction(params)),
    setAryPageActiveSort: params => dispatch(setAryPageActiveSortAction(params)),
});

const MAX_ARYS_PER_REQUEST = 24;

const requestOptions = {
    arysGetRequest: {
        url: '/assessments/',
        method: methods.GET,
        query: ({
            props: {
                activeProject,
                activeSort,
                filters,
                activePage,
            },
        }) => ({
            project: activeProject,
            ordering: activeSort,
            ...getFiltersForRequest(filters),
            offset: (activePage - 1) * MAX_ARYS_PER_REQUEST,
            limit: MAX_ARYS_PER_REQUEST,
        }),
        onPropsChanged: [
            'activeProject',
            'activeSort',
            'filters',
            'activePage',
        ],
        onMount: true,
        onSuccess: ({
            response: {
                results,
                count,
            },
            params: {
                onArysListGet,
            },
        }) => {
            onArysListGet({
                arys: results,
                arysCount: count,
            });
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: 'Assessment Registry', // FIXME: strings
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'arysGetResponse',
        },
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class Arys extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            requests: {
                arysGetRequest,
            },
        } = this.props;

        arysGetRequest.setDefaultParams({
            onArysListGet: this.handleArysGet,
        });

        this.headers = [
            {
                key: 'lead__title',
                label: _ts('assessments', 'titleLabel'),
                order: 1,
                sortable: true,
                modifier: row => row.leadTitle,
            },
            {
                key: 'created_at',
                label: _ts('assessments', 'createdAt'),
                order: 2,
                sortable: true,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'created_by',
                label: _ts('assessments', 'createdByFilterLabel'),
                order: 3,
                sortable: true,
                modifier: row => (
                    <Link
                        key={row.createdBy}
                        to={reverseRoute(pathNames.userProfile, { userId: row.createdBy })}
                    >
                        {row.createdByName}
                    </Link>
                ),
            },
            {
                key: 'actions',
                label: _ts('assessments', 'tableHeaderActions'),
                order: 4,
                sortable: false,
                modifier: row => (
                    <ActionButtons
                        row={row}
                        activeProject={this.props.activeProject}
                        onRemoveAry={this.handleRemoveAry}
                    />
                ),
            },
        ];

        this.state = {
            arys: [],
            redirectTo: undefined,
        };
    }

    // UI
    handleArysGet = ({ arys, arysCount }) => {
        this.setState({
            arys,
            arysCount,
        });
    };

    handleRemoveAry = (aryId) => {
        const {
            arys,
            arysCount,
        } = this.state;

        const aryIndex = arys.findIndex(ary => ary.id === aryId);
        if (aryIndex === -1) {
            return;
        }
        const newArys = [...arys];
        newArys.splice(aryIndex, 1);

        this.setState({
            arys: newArys,
            arysCount: arysCount - 1,
        });
    }

    handlePageClick = (page) => {
        this.props.setAryPageActivePage({ activePage: page });
    }

    // TABLE

    aryKeyExtractor = ary => (ary.id.toString())

    aryModifier = (ary, columnKey) => {
        const header = this.headers.find(d => d.key === columnKey);
        if (header.modifier) {
            return header.modifier(ary);
        }
        return ary[columnKey];
    }

    headerModifier = (headerData) => {
        const { activeSort } = this.props;

        let sortOrder = '';
        if (activeSort === headerData.key) {
            sortOrder = 'asc';
        } else if (activeSort === `-${headerData.key}`) {
            sortOrder = 'dsc';
        }
        return (
            <TableHeader
                label={headerData.label}
                sortOrder={sortOrder}
                sortable={headerData.sortable}
            />
        );
    }

    handleTableHeaderClick = (key) => {
        const headerData = this.headers.find(h => h.key === key);
        // prevent click on 'actions' column
        if (!headerData.sortable) {
            return;
        }

        let { activeSort = '' } = this.props;
        const isAsc = activeSort.charAt(0) !== '-';

        const isCurrentHeaderSorted = activeSort === key
            || (activeSort.substr(1) === key && !isAsc);

        if (isCurrentHeaderSorted) {
            activeSort = isAsc ? `-${key}` : key;
        } else {
            activeSort = headerData.defaultSortOrder === 'dsc' ? `-${key}` : key;
        }
        this.props.setAryPageActiveSort({ activeSort });
    }

    render() {
        const {
            redirectTo,
            arys,
            arysCount,
        } = this.state;

        const {
            className,
            filters,
            activePage,
            projectId,
            requests: {
                arysGetRequest: {
                    pending: loadingArys,
                },
            },
        } = this.props;

        if (redirectTo) {
            return (
                <Redirect
                    to={redirectTo}
                    push
                />
            );
        }

        // FIXME: Fix re-rendering
        const EmptyComponent = TableEmptyComponent({
            emptyText: (
                <React.Fragment>
                    <span>{ _ts('assessments', 'emptyMessage') }</span>
                    <Link
                        className={styles.emptyLinkMessage}
                        to={reverseRoute(pathNames.leads, { projectId })}
                    >
                        { _ts('assessments', 'emptyLinkMessage') }
                    </Link>
                </React.Fragment>
            ),
            filteredEmptyText: _ts('assessments', 'emptyWithFilterMessage'),
        });

        const isFilterEmpty = doesObjectHaveNoData(filters, ['']);

        return (
            <Page
                className={_cs(className, styles.arys)}
                headerClassName={styles.header}
                header={<FilterArysForm className={styles.filters} />}
                mainContentClassName={styles.mainContent}
                mainContent={
                    <div className={styles.tableContainer}>
                        <RawTable
                            data={arys}
                            dataModifier={this.aryModifier}
                            headerModifier={this.headerModifier}
                            headers={this.headers}
                            onHeaderClick={this.handleTableHeaderClick}
                            keySelector={this.aryKeyExtractor}
                            className={styles.arysTable}
                            emptyComponent={EmptyComponent}
                            isFiltered={!isFilterEmpty}
                            pending={loadingArys}
                        />
                    </div>
                }
                footerClassName={styles.footer}
                footer={
                    <React.Fragment>
                        <div />
                        <Pager
                            activePage={activePage}
                            className={styles.pager}
                            itemsCount={arysCount}
                            maxItemsPerPage={MAX_ARYS_PER_REQUEST}
                            onPageClick={this.handlePageClick}
                            showItemsPerPageChange={false}
                        />
                    </React.Fragment>
                }
            />
        );
    }
}
