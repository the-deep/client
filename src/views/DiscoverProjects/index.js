import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import BoundError from '#rs/components/General/BoundError';
import RawTable from '#rs/components/View/RawTable';
import TableHeader from '#rs/components/View/TableHeader';
import FormattedDate from '#rs/components/View/FormattedDate';
// import _ts from '#ts';

import {
    discoverProjectsProjectListSelector,
    setDiscoverProjectsProjectListAction,
} from '#redux';

import AppError from '#components/AppError';
import styles from './styles.scss';
import ProjectListRequest from './requests/ProjectListRequest';

import headers from './headers';
import Actions from './Actions';

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
export default class HomeScreen extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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

    render() {
        const { projectList } = this.props;
        const projectKeyExtractor = d => d.id;

        return (
            <div className={styles.discoverProjects}>
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
        );
    }
}
