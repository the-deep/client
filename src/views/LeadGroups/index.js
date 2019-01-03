import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { reverseRoute } from '#rsu/common';
import FormattedDate from '#rscv/FormattedDate';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Pager from '#rscv/Pager';
import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';

import BackLink from '#components/general/BackLink';
import {
    activeProjectIdFromStateSelector,

    leadGroupsForProjectSelector,
    totalLeadGroupsCountSelector,
    leadGroupsViewActivePageSelector,
    leadGroupsViewActiveSortSelector,
    leadGroupsViewFilterSelector,

    setLeadGroupsAction,
    setLeadGroupsActivePageAction,
    setLeadGroupsActiveSortAction,
} from '#redux';

import { pathNames } from '#constants';

import _ts from '#ts';

import LeadGroupsGetRequest from './requests/LeadGroupsGetRequest';
import LeadGroupDeleteRequest from './requests/LeadGroupDeleteRequest';
import ActionButtons from './ActionButtons';
import FilterLeadGroupsForm from './FilterLeadGroupsForm';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    setLeadGroups: PropTypes.func.isRequired,
    totalLeadGroupsCount: PropTypes.number,
    setLeadGroupsActivePage: PropTypes.func.isRequired,
    setLeadGroupsActiveSort: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    leadGroups: [],
    totalLeadGroupsCount: 0,
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),

    leadGroups: leadGroupsForProjectSelector(state),
    totalLeadGroupsCount: totalLeadGroupsCountSelector(state),
    activePage: leadGroupsViewActivePageSelector(state),
    activeSort: leadGroupsViewActiveSortSelector(state),
    filters: leadGroupsViewFilterSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadGroups: params => dispatch(setLeadGroupsAction(params)),

    setLeadGroupsActivePage: params => dispatch(setLeadGroupsActivePageAction(params)),
    setLeadGroupsActiveSort: params => dispatch(setLeadGroupsActiveSortAction(params)),
});

const MAX_LEADGROUPS_PER_REQUEST = 25;

@connect(mapStateToProps, mapDispatchToProps)
export default class LeadGroups extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'title',
                label: _ts('leadGroups', 'titleLabel'),
                order: 1,
                sortable: true,
                modifier: row => row.title,
            },
            {
                key: 'created_at',
                label: _ts('leadGroups', 'createdAt'),
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
                label: _ts('leadGroups', 'createdBy'),
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
                key: 'no_of_leads',
                label: _ts('leadGroups', 'noOfLeadsTitle'),
                order: 4,
                sortable: true,
                modifier: row => row.noOfLeads,
            },
            {
                key: 'actions',
                label: _ts('leadGroups', 'tableHeaderActions'),
                order: 5,
                sortable: false,
                modifier: row => (
                    <ActionButtons
                        row={row}
                        activeProject={props.activeProject}
                        onRemoveLeadGroup={this.handleRemoveLeadGroup}
                    />
                ),
            },
        ];

        this.state = {
            deleteLeadGroupPending: false,
            dataLoading: true,
        };
    }

    componentWillMount() {
        this.startLeadGroupsRequest();
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
            this.startLeadGroupsRequest(nextProps);
        }
    }

    componentWillUnmount() {
        if (this.requestForLeadGroups) {
            this.requestForLeadGroups.stop();
        }
        if (this.leadGroupDeleteRequest) {
            this.leadGroupDeleteRequest.stop();
        }
    }

    startLeadGroupsRequest = (props = this.props) => {
        const {
            activePage,
            activeProject,
            activeSort,
            filters,
        } = props;

        const { setLeadGroups } = this.props;

        if (this.requestForLeadGroups) {
            this.requestForLeadGroups.stop();
        }
        const requestForLeadGroups = new LeadGroupsGetRequest({
            setState: v => this.setState(v),
            setLeadGroups,
        });
        this.requestForLeadGroups = requestForLeadGroups.create({
            activeProject,
            activePage,
            activeSort,
            filters,
            MAX_LEADGROUPS_PER_REQUEST,
        });
        this.requestForLeadGroups.start();
    }

    leadGroupKeyExtractor = leadGroup => (leadGroup.id.toString())

    leadGroupModifier = (leadGroup, columnKey) => {
        const header = this.headers.find(d => d.key === columnKey);
        if (header.modifier) {
            return header.modifier(leadGroup);
        }
        return leadGroup[columnKey];
    }

    handleRemoveLeadGroup = (leadGroupToDelete) => {
        if (this.leadGroupDeleteRequest) {
            this.leadGroupDeleteRequest.stop();
        }
        const leadGroupDeleteRequest = new LeadGroupDeleteRequest({
            setState: params => this.setState(params),
            pullLeadGroups: this.startLeadGroupsRequest,
        });
        this.leadGroupDeleteRequest = leadGroupDeleteRequest.create(leadGroupToDelete);
        this.leadGroupDeleteRequest.start();
    }

    handlePageClick = (page) => {
        this.props.setLeadGroupsActivePage({ activePage: page });
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
        this.props.setLeadGroupsActiveSort({ activeSort });
    }

    renderHeader = () => {
        const {
            activeProject,
        } = this.props;
        return (
            <header className={styles.header} >
                <BackLink
                    defaultLink={reverseRoute(pathNames.leads, { projectId: activeProject })}
                />
                <FilterLeadGroupsForm className={styles.filters} />
            </header>
        );
    }

    renderFooter = () => {
        const {
            totalLeadGroupsCount,
            activePage,
        } = this.props;

        return (
            <footer className={styles.footer}>
                <div />
                <Pager
                    activePage={activePage}
                    className={styles.pager}
                    itemsCount={totalLeadGroupsCount}
                    maxItemsPerPage={MAX_LEADGROUPS_PER_REQUEST}
                    onPageClick={this.handlePageClick}
                    showItemsPerPageChange={false}
                />
            </footer>
        );
    }

    render() {
        const {
            className,
            leadGroups,
        } = this.props;

        const Header = this.renderHeader;
        const Footer = this.renderFooter;

        const {
            deleteLeadGroupPending,
            dataLoading,
        } = this.state;

        const loading = dataLoading || deleteLeadGroupPending;

        return (
            <div className={`${styles.leadGroups} ${className}`} >
                {loading && <LoadingAnimation />}
                <Header />
                <div className={styles.tableContainer}>
                    <RawTable
                        data={leadGroups}
                        dataModifier={this.leadGroupModifier}
                        headerModifier={this.headerModifier}
                        headers={this.headers}
                        onHeaderClick={this.handleTableHeaderClick}
                        keySelector={this.leadGroupKeyExtractor}
                        className={styles.leadGroupsTable}
                    />
                </div>
                <Footer />
            </div>
        );
    }
}
