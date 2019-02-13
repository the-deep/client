import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Link,
} from 'react-router-dom';

import Page from '#rscv/Page';
import Message from '#rscv/Message';
import FormattedDate from '#rscv/FormattedDate';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Pager from '#rscv/Pager';
import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';
import {
    reverseRoute,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import {
    activeProjectIdFromStateSelector,
    projectIdFromRouteSelector,

    arysForProjectSelector,
    totalArysCountForProjectSelector,
    aryPageActivePageSelector,
    aryPageActiveSortSelector,
    aryPageFilterSelector,

    setArysAction,
    setAryPageActivePageAction,
    setAryPageActiveSortAction,
} from '#redux';
import { pathNames } from '#constants/';
import _ts from '#ts';

import noSearch from '#resources/img/no-search.png';
import noFilter from '#resources/img/no-filter.png';
import ActionButtons from './ActionButtons';
import FilterArysForm from './FilterArysForm';
import ArysGetRequest from './requests/ArysGetRequest';
import AryDeleteRequest from './requests/AryDeleteRequest';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    arys: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    projectId: PropTypes.number.isRequired,
    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    setArys: PropTypes.func.isRequired,
    totalArysCount: PropTypes.number,
    setAryPageActiveSort: PropTypes.func.isRequired,
    setAryPageActivePage: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    arys: [],
    totalArysCount: 0,
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),

    projectId: projectIdFromRouteSelector(state),
    arys: arysForProjectSelector(state),
    totalArysCount: totalArysCountForProjectSelector(state),
    activePage: aryPageActivePageSelector(state),
    activeSort: aryPageActiveSortSelector(state),
    filters: aryPageFilterSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setArys: params => dispatch(setArysAction(params)),

    setAryPageActivePage: params => dispatch(setAryPageActivePageAction(params)),
    setAryPageActiveSort: params => dispatch(setAryPageActiveSortAction(params)),
});

const MAX_ARYS_PER_REQUEST = 24;

@connect(mapStateToProps, mapDispatchToProps)
export default class Arys extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

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
            loadingArys: false,
            redirectTo: undefined,
        };
    }

    componentWillMount() {
        this.pullArys();
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject,
            activeSort,
            filters,
            activePage,
        } = nextProps;

        if (
            this.props.activeProject !== activeProject ||
            this.props.activeSort !== activeSort ||
            this.props.filters !== filters ||
            this.props.activePage !== activePage
        ) {
            this.pullArys(nextProps);
        }
    }

    componentWillUnmount() {
        this.arysRequest.stop();

        if (this.aryDeleteRequest) {
            this.aryDeleteRequest.stop();
        }
    }

    pullArys = (props = this.props) => {
        const {
            activePage,
            activeProject,
            activeSort,
            filters,
        } = props;

        if (this.arysRequest) {
            this.arysRequest.stop();
        }

        const arysRequest = new ArysGetRequest({
            setState: params => this.setState(params),
            setArys: this.props.setArys,
        });

        this.arysRequest = arysRequest.create({
            activeProject,
            activePage,
            activeSort,
            filters,
            MAX_ARYS_PER_REQUEST,
        });

        this.arysRequest.start();
    }

    // UI

    handleRemoveAry = (aryToDelete) => {
        if (this.aryDeleteRequest) {
            this.aryDeleteRequest.stop();
        }
        const aryDeleteRequest = new AryDeleteRequest({
            setState: params => this.setState(params),
            pullArys: this.pullArys,
        });
        this.aryDeleteRequest = aryDeleteRequest.create(aryToDelete);
        this.aryDeleteRequest.start();
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

        let { activeSort } = this.props;
        if (activeSort === key) {
            activeSort = `-${key}`;
        } else {
            activeSort = key;
        }
        this.props.setAryPageActiveSort({ activeSort });
    }

    renderEmpty = () => {
        const {
            filters,
            projectId,
        } = this.props;

        const isFilterEmpty = doesObjectHaveNoData(filters);

        if (!isFilterEmpty) {
            return (
                <Message
                    className={styles.emptyFilterMessage}
                >
                    <img
                        className={styles.image}
                        src={noFilter}
                        alt=""
                    />
                    <span>{_ts('assessments', 'emptyWithFilterMessage')}</span>
                </Message>
            );
        }

        return (
            <Message
                className={styles.emptyMessage}
            >
                <img
                    className={styles.image}
                    src={noSearch}
                    alt=""
                />
                <span>{ _ts('assessments', 'emptyMessage') }</span>
                <Link
                    className={styles.emptyLinkMessage}
                    to={reverseRoute(pathNames.leads, { projectId })}
                >
                    { _ts('assessments', 'emptyLinkMessage') }
                </Link>
            </Message>
        );
    }

    render() {
        const {
            loadingArys,
            redirectTo,
        } = this.state;

        const {
            className,
            arys,
            totalArysCount,
            activePage,
        } = this.props;

        if (redirectTo) {
            return (
                <Redirect
                    to={redirectTo}
                    push
                />
            );
        }

        return (
            <Page
                className={`${className} ${styles.arys}`}
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
                            emptyComponent={this.renderEmpty}
                        />
                        { loadingArys && <LoadingAnimation /> }
                    </div>
                }
                footerClassName={styles.footer}
                footer={
                    <React.Fragment>
                        <div />
                        <Pager
                            activePage={activePage}
                            className={styles.pager}
                            itemsCount={totalArysCount}
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
