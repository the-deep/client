import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import {
    reverseRoute,
    caseInsensitiveSubmatch,
    compareLength,
    compareString,
} from '#rsu/common';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Confirm from '#rscv/Modal/Confirm';
import FormattedDate from '#rscv/FormattedDate';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import Table from '#rscv/Table';
import SearchInput from '#rsci/SearchInput';

import {
    usergroupProjectsSelector,

    setUsergroupViewAction,
    unsetUsergroupViewProjectAction,
} from '#redux';
import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import ProjectAddForm from '#components/ProjectAddForm';

import ProjectDeleteRequest from '../requests/ProjectDeleteRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    usergroup: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    unSetProject: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    isCurrentUserAdmin: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    projects: usergroupProjectsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setUsergroupView: params => dispatch(setUsergroupViewAction(params)),
    unSetProject: params => dispatch(unsetUsergroupViewProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectsTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAddProjectModal: false,
            showDeleteProjectModal: false,
            confirmText: '',
            deletePending: false,
            selectedProject: {},
            searchProjectInputValue: '',
            projects: props.projects,
        };

        this.projectHeaders = [
            {
                key: 'title',
                label: _ts('userGroup', 'tableHeaderTitle'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'createdAt',
                label: _ts('userGroup', 'tableHeaderCreatedAt'),
                order: 2,
                modifier: row => <FormattedDate date={row.createdAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'startDate',
                label: _ts('userGroup', 'tableHeaderStartDate'),
                order: 3,
                modifier: row => <FormattedDate date={row.startDate} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'countries',
                label: _ts('userGroup', 'tableHeaderCountries'),
                order: 4,
                sortable: true,
                modifier: d => ((d.regions || []).length),
                comparator: (a, b) => compareLength(a.regions, b.regions),
            },
            {
                key: 'status',
                label: _ts('userGroup', 'tableHeaderStatus'),
                order: 5,
                modifier: () => 'Active', // NOTE: Show 'Active' for now
            },
            {
                key: 'modifiedAt',
                label: _ts('userGroup', 'tableHeaderLastModifiedAt'),
                order: 6,
                modifier: row => <FormattedDate date={row.modifiedAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'members',
                label: _ts('userGroup', 'tableHeaderMembers'),
                order: 7,
                sortable: true,
                modifier: d => ((d.memberships || []).length),
                comparator: (a, b) => compareLength(a.memberships, b.memberships),
            },
            {
                key: 'actions',
                label: _ts('userGroup', 'tableHeaderActions'),
                order: 8,
                modifier: row => (
                    <div>
                        <Link
                            title={_ts('userGroup', 'viewProjectLinkTitle')}
                            key={row.id}
                            to={reverseRoute(pathNames.projects, { projectId: row.id })}
                            className={styles.link}
                        >
                            <span className={iconNames.openLink} />
                        </Link>
                        {
                            row.role === 'admin' &&
                            <DangerButton
                                title={_ts('userGroup', 'deleteProjectLinkTitle')}
                                onClick={() => this.handleDeleteProjectClick(row)}
                                iconName={iconNames.delete}
                                smallVerticalPadding
                                transparent
                            />
                        }
                    </div>
                ),
            },
        ];

        // Requests
        this.projectDeleteRequest = new ProjectDeleteRequest({
            setState: v => this.setState(v),
            unSetProject: this.props.unSetProject,
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            projects: nextProps.projects,
        });
    }

    componentWillUnmount() {
        this.projectDeleteRequest.stop();
    }

    createUserGroupList = memoize(userGroup => ([userGroup]))

    handleDeleteProjectClick = (project) => {
        const confirmText = _ts('userGroup', 'confirmTextDeleteProject', {
            title: (<b>{project.title}</b>),
        });

        this.setState({
            showDeleteProjectModal: true,
            selectedProject: project,
            confirmText,
        });
    };

    handleDeleteProjectClose = (confirm) => {
        if (confirm) {
            const { selectedProject: { id: projectId } } = this.state;
            const { id: usergroupId } = this.props.usergroup;
            this.projectDeleteRequest.init(projectId, usergroupId).start();
        }
        this.setState({ showDeleteProjectModal: false });
    }

    handleAddProjectClick = () => {
        this.setState({ showAddProjectModal: true });
    }

    handleAddProjectModalClose = () => {
        this.setState({ showAddProjectModal: false });
    }

    handleSearchProjectChange = (value) => {
        const { projects } = this.props;
        const newProjects = projects.filter(
            project => caseInsensitiveSubmatch(project.title, value),
        );
        this.setState({
            searchProjectInputValue: value,
            projects: newProjects,
        });
    }

    keySelector = rowData => rowData.id

    render() {
        const { usergroup } = this.props;

        const {
            deletePending,
            showAddProjectModal,
            showDeleteProjectModal,
            projects,
            searchProjectInputValue,
            confirmText,
        } = this.state;

        return (
            <div className={`${this.props.className} ${styles.projects}`}>
                {deletePending && <LoadingAnimation /> }
                <div className={styles.header}>
                    <h2>
                        {_ts('userGroup', 'headerProjects')}
                    </h2>
                    <div className={styles.pusher} />
                    <SearchInput
                        placeholder={_ts('userGroup', 'placeholderSearch')}
                        onChange={this.handleSearchProjectChange}
                        value={searchProjectInputValue}
                        className={styles.searchInput}
                        showLabel={false}
                        showHintAndError={false}
                    />
                    {
                        this.props.isCurrentUserAdmin &&
                        <PrimaryButton
                            onClick={this.handleAddProjectClick}
                            title={_ts('userGroup', 'addProjectButtonLabel')}
                        >
                            {_ts('userGroup', 'addProjectButtonLabel')}
                        </PrimaryButton>
                    }
                </div>
                <div className={styles.content}>
                    <Table
                        data={projects}
                        headers={this.projectHeaders}
                        keySelector={this.keySelector}
                    />
                </div>
                { showAddProjectModal &&
                    <Modal
                        closeOnEscape
                        onClose={this.handleAddProjectModalClose}
                    >
                        <ModalHeader
                            title={_ts('userGroup', 'addProjectButtonLabel')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddProjectModalClose}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody>
                            <ProjectAddForm
                                userGroups={this.createUserGroupList(usergroup)}
                                onModalClose={this.handleAddProjectModalClose}
                            />
                        </ModalBody>
                    </Modal>
                }
                <Confirm
                    onClose={this.handleDeleteProjectClose}
                    show={showDeleteProjectModal}
                >
                    <p>{confirmText}</p>
                </Confirm>
            </div>
        );
    }
}
