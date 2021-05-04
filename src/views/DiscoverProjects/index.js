import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Link } from 'react-router-dom';
import { pathNames } from '#constants/';
import {
    reverseRoute,
    doesObjectHaveNoData,
    formatDateToString,
} from '@togglecorp/fujs';

import Page from '#rscv/Page';
import Pager from '#rscv/Pager';
import Badge from '#components/viewer/Badge';
import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';
import FormattedDate from '#rscv/FormattedDate';
import SparkLines from '#rscz/SparkLines';
import Numeral from '#rscv/Numeral';
import BackLink from '#components/general/BackLink';
import TableEmptyComponent from '#components/viewer/TableEmptyComponent';
import { getFiltersForRequest } from '#entities/lead';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import {
    discoverProjectsTotalProjectsCountSelector,
    discoverProjectsProjectListSelector,
    discoverProjectsActivePageSelector,
    discoverProjectsActiveSortSelector,
    discoverProjectsFiltersSelector,

    setDiscoverProjectsProjectJoinAction,
    setDiscoverProjectsProjectListAction,
    setDiscoverProjectsActiveSortAction,
    setDiscoverProjectsActivePageAction,
} from '#redux';

import notify from '#notify';
import _ts from '#ts';

import headers from './headers';
import FilterProjectsForm from './FilterProjectsForm';
import Actions from './Actions';

import styles from './styles.scss';

const paginationOptions = [
    { label: '25', key: 25 },
    { label: '50', key: 50 },
];

const TableEmptyComponentWithText = TableEmptyComponent({
    emptyText: _ts('discoverProjects.table', 'emptyMessage'),
    filteredEmptyText: _ts('discoverProjects.table', 'emptyWithFilterMessage'),
});

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
    // eslint-disable-next-line react/no-unused-prop-types
    setProjectList: PropTypes.func.isRequired,
    totalProjectsCount: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,

    setActiveSort: PropTypes.func.isRequired,
    setActivePage: PropTypes.func.isRequired,
    setProjectJoin: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
});

const mapDispatchToProps = dispatch => ({
    setProjectList: params => dispatch(setDiscoverProjectsProjectListAction(params)),
    setProjectJoin: params => dispatch(setDiscoverProjectsProjectJoinAction(params)),

    setActiveSort: params => dispatch(setDiscoverProjectsActiveSortAction(params)),
    setActivePage: params => dispatch(setDiscoverProjectsActivePageAction(params)),
});

const requestOptions = {
    projectListRequest: {
        url: '/projects-stat/',
        query: ({
            params: {
                projectsPerPage = 25,
            },
            props: {
                filters,
                activePage,
                activeSort,
            },
        }) => {
            const sanitizedFilters = getFiltersForRequest(filters);
            const projectListRequestOffset = (activePage - 1) * projectsPerPage;
            const projectListRequestLimit = projectsPerPage;

            return ({
                ...sanitizedFilters,
                ordering: activeSort,
                offset: projectListRequestOffset,
                limit: projectListRequestLimit,
                fields: [
                    'id',
                    'title',
                    'description',
                    'created_at',
                    'modified_at',
                    'is_private',
                    'version_id',
                    'created_by_name',
                    'created_by',
                    'analysis_framework',
                    'analysis_framework_title',
                    'regions',
                    'number_of_users',
                    'number_of_leads',
                    'number_of_entries',
                    'leads_activity',
                    'entries_activity',
                    'status',
                    'member_status',
                    'status_title',
                ],
            });
        },
        onPropsChanged: ['activeSort', 'filters', 'activePage'],
        method: methods.GET,
        onMount: true,
        onSuccess: ({ props, response }) => {
            const { setProjectList } = props;

            setProjectList({
                projectList: response.results,
                totalProjectsCount: response.count,
            });
        },
        extras: {
            schemaName: 'projectStatsGetResponse',
        },
    },
    projectJoinRequest: {
        url: ({ params: { projectId } }) => `/projects/${projectId}/join/`,
        body: ({ params }) => params && params.body,
        method: methods.POST,
        onSuccess: ({
            params: {
                projectId,
                projectTitle,
                closeModal,
            },
            props: { setProjectJoin },
        }) => {
            setProjectJoin({
                projectId,
                isJoining: true,
            });

            if (closeModal) {
                closeModal();
            }

            notify.send({
                title: _ts('discoverProjects', 'discoverProjectsNotificationTitle'),
                type: notify.type.SUCCESS,
                message: _ts(
                    'discoverProjects',
                    'projectJoinNotification',
                    { projectName: projectTitle },
                ),
                duration: notify.duration.MEDIUM,
            });
        },
    },
    projectJoinCancelRequest: {
        url: ({ params: { projectId } }) => `/projects/${projectId}/join/cancel/`,
        method: methods.POST,
        onSuccess: ({
            params: {
                projectId,
                projectTitle,
            },
            props: { setProjectJoin },
        }) => {
            setProjectJoin({
                projectId,
                isJoining: false,
            });

            notify.send({
                title: _ts('discoverProjects', 'discoverProjectsNotificationTitle'),
                type: notify.type.WARNING,
                message: _ts(
                    'discoverProjects',
                    'projectJoinCancelNotification',
                    { projectName: projectTitle },
                ),
                duration: notify.duration.MEDIUM,
            });
        },
    },
};

const projectKeyExtractor = d => d.id;

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class DiscoverProjects extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static membershipKeySelector = m => m.id;
    static activityCountSelector = a => a.count;
    static activityDateSelector = a => new Date(a.date).getTime();
    static activityDateModifier = d => `
        ${_ts('discoverProjects.table', 'dateLabel')}:
        ${formatDateToString(new Date(d), 'dd-MM-yyyy')} `;
    static entriesActivityNumberModifier = d => `
        ${_ts('discoverProjects.table', 'numberOfEntries')}: ${d}
    `;
    static leadsActivityNumberModifier = d => `
        ${_ts('discoverProjects.table', 'numberOfLeads')}: ${d}
    `;

    constructor(props) {
        super(props);

        this.state = {
            projectsPerPage: 25,
        };
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
        const {
            requests: {
                projectJoinRequest: { pending: pendingProjectJoinRequest },
            },
        } = this.props;

        switch (columnKey) {
            case 'title': {
                return (
                    <div>
                        {project.title}
                        {project.isPrivate &&
                            <Badge
                                className={styles.badge}
                                icon="locked"
                                title={_ts('project', 'privateProjectBadgeTitle')}
                                tooltip={_ts('project', 'privateProjectBadgeTooltip')}
                            />
                        }
                    </div>
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
                return project.createdByName;
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
            case 'regions':
                return project.regions.map(d => d.title).join(', ') || '-';
            case 'leads_activity':
                return (
                    <SparkLines
                        className={styles.sparkLine}
                        data={project.leadsActivity}
                        yValueSelector={DiscoverProjects.activityCountSelector}
                        xValueSelector={DiscoverProjects.activityDateSelector}
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
                        yValueSelector={DiscoverProjects.activityCountSelector}
                        xValueSelector={DiscoverProjects.activityDateSelector}
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
                        projectJoinRequestPending={pendingProjectJoinRequest}
                    />
                );
            case 'status':
                return project.statusDisplay;
            default:
                return project[columnKey];
        }
    }

    handleItemsPerPageChange = (projectsPerPage) => {
        const {
            requests: {
                projectListRequest,
            },
        } = this.props;
        this.setState({ projectsPerPage });
        projectListRequest.do({ projectsPerPage });
    }

    handlePageClick = (page) => {
        this.props.setActivePage(page);
    }

    handleTableHeaderClick = (key) => {
        const headerData = headers.find(h => h.key === key);
        // prevents click on 'actions' column
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
        this.props.setActiveSort(activeSort);
    }

    handleProjectJoin = (options) => {
        const { requests: { projectJoinRequest } } = this.props;

        projectJoinRequest.do(options);
    }

    handleProjectJoinCancel = (project) => {
        const { requests: { projectJoinCancelRequest } } = this.props;

        projectJoinCancelRequest.do({
            projectId: project.id,
            projectTitle: project.title,
        });
    }

    render() {
        const {
            projectList,
            totalProjectsCount,
            activePage,
            filters,
            requests: {
                projectListRequest: { pending: pendingProjectList },
                projectJoinRequest: { pending: pendingProjectJoin },
                projectJoinCancelRequest: { pending: pendingProjectJoinCancel },
            },
        } = this.props;

        const { projectsPerPage } = this.state;

        const pending = (
            pendingProjectList ||
            pendingProjectJoin ||
            pendingProjectJoinCancel
        );

        const exitPath = reverseRoute(pathNames.landingPage);
        const isFilterEmpty = doesObjectHaveNoData(filters, ['']);

        return (
            <Page
                className={styles.discoverProjects}
                headerClassName={styles.header}
                header={
                    <>
                        <BackLink
                            className={styles.backLink}
                            defaultLink={{ pathname: exitPath }}
                        />
                        <FilterProjectsForm className={styles.filters} />
                    </>
                }
                mainContentClassName={styles.mainContent}
                mainContent={
                    <div className={styles.tableContainer}>
                        <RawTable
                            data={projectList}
                            headers={headers}
                            dataModifier={this.dataModifier}
                            headerModifier={this.headerModifier}
                            onHeaderClick={this.handleTableHeaderClick}
                            keySelector={projectKeyExtractor}
                            className={styles.projectsTable}
                            emptyComponent={TableEmptyComponentWithText}
                            isFiltered={!isFilterEmpty}
                            pending={pending}
                        />
                    </div>
                }
                footerClassName={styles.footer}
                footer={
                    <Pager
                        activePage={activePage}
                        className={styles.pager}
                        itemsCount={totalProjectsCount}
                        maxItemsPerPage={projectsPerPage}
                        onItemsPerPageChange={this.handleItemsPerPageChange}
                        onPageClick={this.handlePageClick}
                        options={paginationOptions}
                    />
                }
            />
        );
    }
}
