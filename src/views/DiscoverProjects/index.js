import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import BoundError from '#rs/components/General/BoundError';
import SelectInput from '#rs/components/Input/SelectInput';
import Pager from '#rs/components/View/Pager';
import RawTable from '#rs/components/View/RawTable';
import TableHeader from '#rs/components/View/TableHeader';
import FormattedDate from '#rs/components/View/FormattedDate';
import _ts from '#ts';

import {
    discoverProjectsProjectListSelector,
    setDiscoverProjectsProjectListAction,
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
};

const defaultProps = {
};

const mapStateToProps = state => ({
    projectList: discoverProjectsProjectListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectList: params => dispatch(setDiscoverProjectsProjectListAction(params)),
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
            activeSort: undefined,
        };

        this.projectListRequest = new ProjectListRequest({
            setState: d => this.setState(d),
            setProjectList: props.setProjectList,
        });
    }

    componentDidMount() {
        this.projectListRequest.init();
        this.projectListRequest.start();
    }

    componentWillUnmount() {
        this.projectListRequest.stop();
    }

    headerModifier = (headerData) => {
        const { activeSort } = this.state;

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
            case 'createdAt':
                return (
                    <FormattedDate
                        date={project.createdAt}
                        mode="dd-MM-yyyy"
                    />
                );
            case 'numberOfProjects':
                return project.memberships.length;
            case 'regions':
                return project.regions.map(d => d.title).join(', ');
            case 'actions':
                return <Actions project={project} />;
            default:
                return project[columnKey];
        }
    }

    renderHeader = () => (
        <header className={styles.header}>
            <FilterProjectsForm className={styles.filters} />
        </header>
    )

    renderFooter = () => {
        /*
        const {
            totalProjectsCount,
            activePage,
            projectsPerPage,
        } = this.props;
        */
        const activePage = 1;
        const totalProjectsCount = 202;
        const projectsPerPage = 25;

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
                        // onChange={this.handleProjectsPerPageChange}
                    />
                </div>
                <div className={styles.pagerContainer}>
                    <Pager
                        activePage={activePage}
                        className={styles.pager}
                        itemsCount={totalProjectsCount}
                        maxItemsPerPage={projectsPerPage}
                        // onPageClick={this.handlePageClick}
                    />
                </div>
            </footer>
        );
    }

    render() {
        const { projectList } = this.props;
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
                            dataModifier={this.dataModifier}
                            headerModifier={this.headerModifier}
                            headers={headers}
                            onHeaderClick={this.handleTableHeaderClick}
                            keyExtractor={projectKeyExtractor}
                            className={styles.projectsTable}
                        />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}
