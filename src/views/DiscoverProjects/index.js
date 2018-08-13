import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Link } from 'react-router-dom';
import { reverseRoute } from '#rsu/common';
import { pathNames } from '#constants/';

import BoundError from '#rscg/BoundError';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import Pager from '#rscv/Pager';
import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';
import FormattedDate from '#rscv/FormattedDate';
import SparkLines from '#rscz/SparkLines';
import Numeral from '#rscv/Numeral';

import {
    discoverProjectsTotalProjectsCountSelector,
    discoverProjectsProjectListSelector,
    discoverProjectsActivePageSelector,
    discoverProjectsActiveSortSelector,
    discoverProjectsProjectsPerPageSelector,
    discoverProjectsFiltersSelector,

    setDiscoverProjectsProjectJoinAction,
    setDiscoverProjectsProjectListAction,
    setDiscoverProjectsActiveSortAction,
    setDiscoverProjectsActivePageAction,
    setDiscoverProjectsProjectPerPageAction,
} from '#redux';

import AppError from '#components/AppError';
import _ts from '#ts';

import ProjectListRequest from './requests/ProjectListRequest';
import ProjectJoinRequest from './requests/ProjectJoinRequest';
import ProjectJoinCancelRequest from './requests/ProjectJoinCancelRequest';

import FilterProjectsForm from './FilterProjectsForm';
import headers from './headers';
import Actions from './Actions';
import styles from './styles.scss';

const Admin = ({ admin }) => (
    <Link
        className={styles.admin}
        to={reverseRoute(pathNames.userProfile, { userId: admin.member })}
    >
        {admin.memberName}
    </Link>
);

Admin.propTypes = {
    admin: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    projectList: PropTypes.array.isRequired,
    setProjectList: PropTypes.func.isRequired,
    totalProjectsCount: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    projectsPerPage: PropTypes.number.isRequired,

    setActiveSort: PropTypes.func.isRequired,
    setActivePage: PropTypes.func.isRequired,
    setProjectPerPage: PropTypes.func.isRequired,
    setProjectJoin: PropTypes.func.isRequired,
};

const defaultProps = {
    filters: {},
};

const mapStateToProps = state => ({
    filters: discoverProjectsFiltersSelector(state),
    projectList: discoverProjectsProjectListSelector(state),
    totalProjectsCount: discoverProjectsTotalProjectsCountSelector(state),
    activePage: discoverProjectsActivePageSelector(state),
    activeSort: discoverProjectsActiveSortSelector(state),
    projectsPerPage: discoverProjectsProjectsPerPageSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectList: params => dispatch(setDiscoverProjectsProjectListAction(params)),
    setProjectJoin: params => dispatch(setDiscoverProjectsProjectJoinAction(params)),

    setActiveSort: params => dispatch(setDiscoverProjectsActiveSortAction(params)),
    setActivePage: params => dispatch(setDiscoverProjectsActivePageAction(params)),
    setProjectPerPage: params => dispatch(setDiscoverProjectsProjectPerPageAction(params)),
});


@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class DiscoverProjects extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static membershipKeySelector = m => m.id;
    static activityCountSelector = a => a.count;
    static activityDateSelector = a => new Date(a.date).getTime();
    static activityDateModifier = d => `
        ${_ts('discoverProjects.table', 'dateLabel')}:
        ${FormattedDate.format(new Date(d), 'dd-MM-yyyy')}
    `;
    static entriesActivityNumberModifier = d => `
        ${_ts('discoverProjects.table', 'numberOfEntries')}: ${d}
    `;
    static leadsActivityNumberModifier = d => `
        ${_ts('discoverProjects.table', 'numberOfLeads')}: ${d}
    `;

    static projectsPerPageOptions = [
        { label: '25', key: 25 },
        { label: '50', key: 50 },
        { label: '75', key: 75 },
        { label: '100', key: 100 },
    ];

    constructor(props) {
        super(props);

        this.state = {
            pendingProjectList: false,
            pendingProjectJoin: false,
            pendingProjectJoinCancel: false,
        };

        this.projectListRequest = new ProjectListRequest({
            setState: d => this.setState(d),
            setProjectList: props.setProjectList,
        });

        this.projectJoinRequest = new ProjectJoinRequest({
            setState: d => this.setState(d),
            setProjectJoin: this.props.setProjectJoin,
        });

        this.projectJoinCancelRequest = new ProjectJoinCancelRequest({
            setState: d => this.setState(d),
            setProjectJoin: this.props.setProjectJoin,
        });
    }

    componentDidMount() {
        const {
            activeSort,
            filters,
            activePage,
            projectsPerPage,
        } = this.props;

        this.projectListRequest.init({
            activeSort,
            filters,
            activePage,
            projectsPerPage,
        });
        this.projectListRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeSort,
            filters,
            activePage,
            projectsPerPage,
        } = nextProps;

        if (
            this.props.activeSort !== activeSort ||
            this.props.filters !== filters ||
            this.props.activePage !== activePage ||
            this.props.projectsPerPage !== projectsPerPage
        ) {
            this.projectListRequest.init({
                activeSort,
                filters,
                activePage,
                projectsPerPage,
            });
            this.projectListRequest.start();
        }
    }

    componentWillUnmount() {
        this.projectListRequest.stop();
        this.projectJoinRequest.stop();
        this.projectJoinCancelRequest.stop();
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
                label={headerData.title}
                sortOrder={sortOrder}
                sortable={headerData.sortable}
            />
        );
    }

    dataModifier = (project, columnKey) => {
        switch (columnKey) {
            case 'admins': {
                const adminsList = project.memberships.filter(d => d.role === 'admin');
                const rendererParams = (key, admin) => ({ admin });
                const EmptyComponent = () => '-';

                return (
                    <ListView
                        data={adminsList}
                        keyExtractor={DiscoverProjects.membershipKeySelector}
                        renderer={Admin}
                        rendererParams={rendererParams}
                        emptyComponent={EmptyComponent}
                    />
                );
            }
            case 'created_at':
                return (
                    <FormattedDate
                        date={project.createdAt}
                        mode="dd-MM-yyyy"
                    />
                );
            case 'created_by':
                return (
                    <Link to={reverseRoute(pathNames.userProfile, { userId: project.createdBy })}>
                        {project.createdByName}
                    </Link>
                );
            case 'analysis_framework':
                return project.analysisFrameworkTitle;
            case 'number_of_users':
                return (
                    <Numeral
                        value={project.numberOfUsers}
                        precision={0}
                    />
                );
            case 'number_of_leads':
                return (
                    <Numeral
                        value={project.numberOfLeads}
                        precision={0}
                    />
                );
            case 'number_of_entries':
                return (
                    <Numeral
                        value={project.numberOfEntries}
                        precision={0}
                    />
                );
            case 'number_of_projects':
                return project.memberships.length;
            case 'regions':
                return project.regions.map(d => d.title).join(', ') || '-';
            case 'leads_activity':
                return (
                    <SparkLines
                        className={styles.sparkLine}
                        data={project.leadsActivity}
                        yValueAccessor={DiscoverProjects.activityCountSelector}
                        xValueAccessor={DiscoverProjects.activityDateSelector}
                        xLabelModifier={DiscoverProjects.activityDateModifier}
                        yLabelModifier={DiscoverProjects.leadsActivityNumberModifier}
                        fill
                    />
                );
            case 'entries_activity':
                return (
                    <SparkLines
                        className={styles.sparkLine}
                        data={project.entriesActivity}
                        yValueAccessor={DiscoverProjects.activityCountSelector}
                        xValueAccessor={DiscoverProjects.activityDateSelector}
                        xLabelModifier={DiscoverProjects.activityDateModifier}
                        yLabelModifier={DiscoverProjects.entriesActivityNumberModifier}
                        fill
                    />
                );
            case 'actions':
                return (
                    <Actions
                        project={project}
                        onProjectJoin={this.handleProjectJoin}
                        onProjectJoinCancel={this.handleProjectJoinCancel}
                    />
                );
            case 'status':
                return project.statusTitle;
            default:
                return project[columnKey];
        }
    }

    handlePageClick = (page) => {
        this.props.setActivePage(page);
    }

    handleProjectsPerPageChange = (pageCount) => {
        this.props.setProjectPerPage(pageCount);
    }

    handleTableHeaderClick = (key) => {
        const headerData = headers.find(h => h.key === key);
        // prevents click on 'actions' column
        if (!headerData.sortable) {
            return;
        }

        let { activeSort } = this.props;
        if (activeSort === key) {
            activeSort = `-${key}`;
        } else {
            activeSort = key;
        }
        this.props.setActiveSort(activeSort);
    }

    handleProjectJoin = (project) => {
        this.projectJoinRequest.init({
            projectId: project.id,
            projectTitle: project.title,
        });
        this.projectJoinRequest.start();
    }

    handleProjectJoinCancel = (project) => {
        this.projectJoinCancelRequest.init({
            projectId: project.id,
            projectTitle: project.title,
        });
        this.projectJoinCancelRequest.start();
    }

    renderHeader = () => (
        <header className={styles.header}>
            <FilterProjectsForm className={styles.filters} />
        </header>
    )

    renderFooter = () => {
        const {
            totalProjectsCount,
            activePage,
            projectsPerPage,
        } = this.props;

        return (
            <footer className={styles.footer}>
                <div />
                <div className={styles.pagerContainer}>
                    <Pager
                        activePage={activePage}
                        className={styles.pager}
                        itemsCount={totalProjectsCount}
                        maxItemsPerPage={projectsPerPage}
                        onPageClick={this.handlePageClick}
                        onItemsPerPageChange={this.handleProjectsPerPageChange}
                    />
                </div>
            </footer>
        );
    }

    render() {
        const { projectList } = this.props;
        const { pendingProjectList, pendingProjectJoin, pendingProjectJoinCancel } = this.state;

        const pending = pendingProjectList || pendingProjectJoin || pendingProjectJoinCancel;

        const projectKeyExtractor = d => d.id;

        const Header = this.renderHeader;
        const Footer = this.renderFooter;

        return (
            <div className={styles.discoverProjects}>
                <Header />
                <div className={styles.tableContainer}>
                    <div className={styles.scrollWrapper}>
                        <RawTable
                            data={projectList}
                            headers={headers}
                            dataModifier={this.dataModifier}
                            headerModifier={this.headerModifier}
                            onHeaderClick={this.handleTableHeaderClick}
                            keyExtractor={projectKeyExtractor}
                            className={styles.projectsTable}
                        />
                        { pending && <LoadingAnimation large /> }
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}
