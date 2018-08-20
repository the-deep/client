/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author thenav56 <ayernavin@gmail.com>
 */

import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
    compareDate,
    compareLength,
    compareString,
} from '#rsu/common';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import Table from '#rscv/Table';

import {
    userProjectsSelector,
    activeUserSelector,
    unsetUserProfileProjectAction,
    userIdFromRouteSelector,
} from '#redux';
import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import UserProjectAdd from '#components/UserProjectAdd';

import ProjectDeleteRequest from '../requests/ProjectDeleteRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    unsetProject: PropTypes.func.isRequired,
    userProjects: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userId: PropTypes.number.isRequired,
};

const defaultProps = {
    className: '',
    userProjects: [],
};

const mapStateToProps = (state, props) => ({
    userProjects: userProjectsSelector(state, props),
    activeUser: activeUserSelector(state),
    userId: userIdFromRouteSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    unsetProject: params => dispatch(unsetUserProfileProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class UserProject extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // Add Modal state
            addProject: false,

            // Delete Modal state
            deletePending: false,
        };

        // TABLE component
        this.projectTableHeaders = [
            {
                key: 'title',
                label: _ts('userProfile', 'tableHeaderTitle'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'rights',
                label: _ts('userProfile', 'tableHeaderRights'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
                modifier: row => row.role,
            },
            {
                key: 'createdAt',
                label: _ts('userProfile', 'tableHeaderCreatedAt'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareDate(a.createdAt, b.createdAt),
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'modifiedAt',
                label: _ts('userProfile', 'tableHeaderLastModifiedAt'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.modifiedAt, b.modifiedAt),
                modifier: row => (
                    <FormattedDate
                        date={row.modifiedAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'status',
                label: _ts('userProfile', 'tableHeaderStatus'),
                order: 5,
                modifier: () => 'Active', // NOTE: Show 'Active' for now
            },
            {
                key: 'members',
                label: _ts('userProfile', 'tableHeaderMembers'),
                order: 6,
                sortable: true,
                comparator: (a, b) => compareLength(a.memberships, b.memberships),
                modifier: d => (d.memberships || []).length,
            },
            {
                key: 'actions',
                label: _ts('userProfile', 'tableHeaderActions'),
                order: 7,
                modifier: (d) => {
                    const { activeUser } = this.props;
                    const activeUserMembership = (d.memberships || [])
                        .find(e => e.member === activeUser.userId);

                    if (activeUserMembership && activeUserMembership.role === 'normal') {
                        return (
                            <Link
                                title={_ts('userProfile', 'viewProjectLinkTitle')}
                                to={reverseRoute(pathNames.projects, { projectId: d.id })}
                                className={styles.link}
                            >
                                <span className={iconNames.openLink} />
                            </Link>
                        );
                    }

                    if (activeUserMembership && activeUserMembership.role === 'admin') {
                        const confirmMsg = _ts('userProfile', 'confirmTextDeleteProject', {
                            title: (<b>{d.title}</b>),
                        });

                        return (
                            <Fragment>
                                <Link
                                    title={_ts('userProfile', 'editProjectLinkTitle')}
                                    to={reverseRoute(pathNames.projects, { projectId: d.id })}
                                    className={styles.link}
                                >
                                    <span className={iconNames.edit} />
                                </Link>
                                <DangerConfirmButton
                                    title={_ts('userProfile', 'deleteProjectLinkTitle')}
                                    onClick={() => this.handleDeleteProjectClick(d)}
                                    iconName={iconNames.delete}
                                    smallVerticalPadding
                                    transparent
                                    confirmationMessage={confirmMsg}
                                />
                            </Fragment>
                        );
                    }

                    return null;
                },
            },
        ];
        this.projectTableKeyExtractor = rowData => rowData.id;

        // Request
        this.projectDeleteRequest = new ProjectDeleteRequest({
            unsetProject: this.props.unsetProject,
            setState: v => this.setState(v),
        });
    }

    componentWillUnmount() {
        this.projectDeleteRequest.stop();
    }

    // BUTTONS

    handleAddProjectClick = () => {
        this.setState({ addProject: true });
    }

    handleAddProjectClose = () => {
        this.setState({ addProject: false });
    }

    // Table Actions

    handleDeleteProjectClick = (selectedProject) => {
        this.projectDeleteRequest.init(
            selectedProject.id,
            this.props.activeUser.userId,
        ).start();
    }

    render() {
        const {
            className,
            userProjects,
            userId,
            activeUser,
        } = this.props;

        const {
            addProject,
            deletePending,
        } = this.state;

        const isCurrentUser = userId === activeUser.userId;

        return (
            <div className={`${styles.projects} ${className}`}>
                { deletePending && <LoadingAnimation /> }
                <div className={styles.header}>
                    <h2>
                        {_ts('userProfile', 'headerProjects')}
                    </h2>
                    {

                        isCurrentUser && (
                            <PrimaryButton onClick={this.handleAddProjectClick} >
                                {_ts('userProfile', 'addProjectButtonLabel')}
                            </PrimaryButton>
                        )
                    }
                </div>
                { addProject &&
                    <Modal
                        closeOnEscape
                        onClose={this.handleAddProjectClose}
                    >
                        <ModalHeader
                            title={_ts('userProfile', 'addProjectButtonLabel')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddProjectClose}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody>
                            <UserProjectAdd handleModalClose={this.handleAddProjectClose} />
                        </ModalBody>
                    </Modal>
                }
                <div className={styles.projectsTable}>
                    <Table
                        data={userProjects}
                        headers={this.projectTableHeaders}
                        keyExtractor={this.projectTableKeyExtractor}
                    />
                </div>
            </div>
        );
    }
}
