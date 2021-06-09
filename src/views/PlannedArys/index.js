import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { getFiltersForRequest } from '#entities/lead';
import produce from 'immer';
import { Link } from 'react-router-dom';

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
import modalize from '#rscg/Modalize';
import AccentButton from '#rsca/Button/AccentButton';

import BackLink from '#components/general/BackLink';
import TableEmptyComponent from '#components/viewer/TableEmptyComponent';
import {
    _cs,
    reverseRoute,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import {
    activeProjectIdFromStateSelector,

    plannedAryPageActivePageSelector,
    plannedAryPageActiveSortSelector,
    plannedAryPageFilterSelector,

    setPlannedAryPageActivePageAction,
    setPlannedAryPageActiveSortAction,
} from '#redux';
import { pathNames } from '#constants/';
import notify from '#notify';
import _ts from '#ts';

import ActionButtons from './ActionButtons';
import PlannedAryForm from './PlannedAryForm';
import PlannedAryFilterForm from './PlannedAryFilterForm';

import styles from './styles.scss';

const ModalButton = modalize(AccentButton);

const propTypes = {
    className: PropTypes.string,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    setPlannedAryPageActiveSort: PropTypes.func.isRequired,
    setPlannedAryPageActivePage: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),

    activePage: plannedAryPageActivePageSelector(state),
    activeSort: plannedAryPageActiveSortSelector(state),
    filters: plannedAryPageFilterSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setPlannedAryPageActivePage: params => dispatch(setPlannedAryPageActivePageAction(params)),
    setPlannedAryPageActiveSort: params => dispatch(setPlannedAryPageActiveSortAction(params)),
});

const MAX_ARYS_PER_REQUEST = 24;

const requestOptions = {
    plannedArysGetRequest: {
        url: '/planned-assessments/',
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
            response: { results, count },
            params: { onArysListGet },
        }) => {
            onArysListGet({
                arys: results,
                arysCount: count,
            });
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('assessments.planned', 'plannedAssessmentsNotifyTitle'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'plannedArysGetResponse',
        },
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class PlannedArys extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            requests: {
                plannedArysGetRequest,
            },
        } = this.props;

        plannedArysGetRequest.setDefaultParams({
            onArysListGet: this.handleArysGet,
        });

        this.headers = [
            {
                key: 'title',
                label: _ts('assessments.planned', 'titleLabel'),
                order: 1,
                sortable: true,
            },
            {
                key: 'created_at',
                label: _ts('assessments.planned', 'createdAt'),
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
                label: _ts('assessments.planned', 'createdByFilterLabel'),
                order: 3,
                sortable: true,
                modifier: row => (
                    <Link
                        className={styles.createdByLink}
                        key={row.createdBy}
                        to={reverseRoute(pathNames.userProfile, { userId: row.createdBy })}
                    >
                        {row.createdByName}
                    </Link>
                ),
            },
            {
                key: 'actions',
                label: _ts('assessments.planned', 'tableHeaderActions'),
                order: 4,
                sortable: false,
                modifier: row => (
                    <ActionButtons
                        projectId={this.props.activeProject}
                        onPlannedAryEdit={this.handlePlannedAryEdit}
                        row={row}
                        onRemoveAry={this.handleRemoveAry}
                    />
                ),
            },
        ];

        this.state = { arys: [] };
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

    handlePlannedAryEdit = (ary) => {
        const { arys } = this.state;
        const newArys = produce(arys, (safeArys) => {
            const aryIndex = arys.findIndex(a => a.id === ary.id);
            if (aryIndex === -1) {
                return;
            }
            // eslint-disable-next-line no-param-reassign
            safeArys[aryIndex] = {
                ...safeArys[aryIndex],
                ...ary,
            };
        });

        this.setState({ arys: newArys });
    }

    handlePlannedAryAdd = (ary) => {
        const {
            arys,
            arysCount,
        } = this.state;

        const newArys = [
            ...arys,
            ary,
        ];

        this.setState({
            arys: newArys,
            arysCount: arysCount + 1,
        });
    }

    handlePageClick = (page) => {
        this.props.setPlannedAryPageActivePage({ activePage: page });
    }

    // TABLE

    plannedAryKeyExtractor = ary => (ary.id.toString())

    plannedAryModifier = (ary, columnKey) => {
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
        this.props.setPlannedAryPageActiveSort({ activeSort });
    }

    render() {
        const {
            arys,
            arysCount,
        } = this.state;

        const {
            className,
            filters,
            activePage,
            activeProject,
            requests: {
                plannedArysGetRequest: {
                    pending: loadingArys,
                },
            },
        } = this.props;

        const backLink = reverseRoute(pathNames.arys, { projectId: activeProject });

        // FIXME: Fix re-rendering
        const EmptyComponent = TableEmptyComponent({
            emptyText: _ts('assessments.planned', 'emptyMessage'),
            filteredEmptyText: _ts('assessments.planned', 'emptyWithFilterMessage'),
        });

        const isFilterEmpty = doesObjectHaveNoData(filters, ['']);

        return (
            <Page
                className={_cs(className, styles.plannedArys)}
                headerClassName={styles.header}
                header={
                    <React.Fragment>
                        <BackLink
                            defaultLink={backLink}
                            className={styles.backLink}
                        />
                        <PlannedAryFilterForm className={styles.filters} />
                        <ModalButton
                            modal={
                                <PlannedAryForm
                                    projectId={activeProject}
                                    onActionSuccess={this.handlePlannedAryAdd}
                                />
                            }
                        >
                            {_ts('assessments.planned', 'addPlannedAryButtonLabel')}
                        </ModalButton>
                    </React.Fragment>
                }
                mainContentClassName={styles.mainContent}
                mainContent={
                    <div className={styles.tableContainer}>
                        <RawTable
                            data={arys}
                            dataModifier={this.plannedAryModifier}
                            headerModifier={this.headerModifier}
                            headers={this.headers}
                            onHeaderClick={this.handleTableHeaderClick}
                            keySelector={this.plannedAryKeyExtractor}
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
