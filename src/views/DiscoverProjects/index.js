import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import BoundError from '#rs/components/General/BoundError';
import SelectInput from '#rs/components/Input/SelectInput';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import Pager from '#rs/components/View/Pager';
import RawTable from '#rs/components/View/RawTable';
import TableHeader from '#rs/components/View/TableHeader';
import FormattedDate from '#rs/components/View/FormattedDate';
import _ts from '#ts';

import {
    discoverProjectsTotalProjectsCountSelector,
    discoverProjectsProjectListSelector,
    discoverProjectsActivePageSelector,
    discoverProjectsActiveSortSelector,
    discoverProjectsProjectsPerPageSelector,
    discoverProjectsFiltersSelector,

    setDiscoverProjectsProjectListAction,
    setDiscoverProjectsActiveSortAction,
    setDiscoverProjectsActivePageAction,
    setDiscoverProjectsProjectPerPageAction,
} from '#redux';

import AppError from '#components/AppError';

import ProjectListRequest from './requests/ProjectListRequest';

import FilterProjectsForm from './FilterProjectsForm';
import headers from './headers';
import Actions from './Actions';
import styles from './styles.scss';

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

    setActiveSort: params => dispatch(setDiscoverProjectsActiveSortAction(params)),
    setActivePage: params => dispatch(setDiscoverProjectsActivePageAction(params)),
    setProjectPerPage: params => dispatch(setDiscoverProjectsProjectPerPageAction(params)),
});

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class DiscoverProjects extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
        };

        this.projectListRequest = new ProjectListRequest({
            setState: d => this.setState(d),
            setProjectList: props.setProjectList,
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
            case 'admins':
                return project.memberships
                    .filter(d => d.role === 'admin')
                    .map(d => d.memberName)
                    .join(', ');
            case 'created_at':
                return (
                    <FormattedDate
                        date={project.createdAt}
                        mode="dd-MM-yyyy"
                    />
                );
            case 'analysis_framework_title':
                return project.analysisFrameworkTitle;
            case 'number_of_users':
                return project.numberOfUsers;
            case 'number_of_leads':
                return project.numberOfLeads;
            case 'number_of_entries':
                return project.numberOfEntries;
            case 'number_of_projects':
                return project.memberships.length;
            case 'regions':
                return project.regions.map(d => d.title).join(', ') || '-';
            case 'actions':
                return <Actions project={project} />;
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
                <div className={styles.linkContainer}>
                    <span className={styles.label}>
                        {_ts('discoverProjects.footer', 'projectsPerPage')}
                    </span>
                    <SelectInput
                        className={styles.projectsPerPageInput}
                        hideClearButton
                        showLabel={false}
                        showHintAndError={false}
                        options={DiscoverProjects.projectsPerPageOptions}
                        value={projectsPerPage}
                        onChange={this.handleProjectsPerPageChange}
                    />
                </div>
                <div className={styles.pagerContainer}>
                    <Pager
                        activePage={activePage}
                        className={styles.pager}
                        itemsCount={totalProjectsCount}
                        maxItemsPerPage={projectsPerPage}
                        onPageClick={this.handlePageClick}
                    />
                </div>
            </footer>
        );
    }

    render() {
        const { projectList } = this.props;
        const { pendingProjectList } = this.state;

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
                        { pendingProjectList && <LoadingAnimation large /> }
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}
