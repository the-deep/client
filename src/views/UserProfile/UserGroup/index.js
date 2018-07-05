/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author jacky <prabes.pathak@gmail.com>
 */

import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
    compareString,
    compareDate,
} from '#rs/utils/common';
import DangerConfirmButton from '#rs/components/Action/ConfirmButton/DangerConfirmButton';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import FormattedDate from '#rs/components/View/FormattedDate';
import Modal from '#rs/components/View/Modal';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalHeader from '#rs/components/View/Modal/Header';
import Table from '#rs/components/View/Table';

import {
    userGroupsSelector,
    setUserGroupsAction,
    activeUserSelector,
    unSetUserGroupAction,
    userIdFromRouteSelector,
} from '#redux';
import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import UserGroupGetRequest from '../requests/UserGroupGetRequest';
import UserGroupDeleteRequest from '../requests/UserGroupDeleteRequest';

import UserGroupAdd from './UserGroupAdd';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    setUserGroups: PropTypes.func.isRequired,
    userGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    unSetUserGroup: PropTypes.func.isRequired,
    userId: PropTypes.number.isRequired,
};

const defaultProps = {
    className: '',
    userGroups: [],
};


const mapStateToProps = (state, props) => ({
    userGroups: userGroupsSelector(state, props),
    activeUser: activeUserSelector(state),
    userId: userIdFromRouteSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setUserGroups: params => dispatch(setUserGroupsAction(params)),
    unSetUserGroup: params => dispatch(unSetUserGroupAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class UserGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // Add Modal state
            addUserGroup: false,

            deletePending: false,
        };

        this.userGroupsTableHeaders = [
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
                modifier: (row) => {
                    const { userId } = this.props;
                    const { memberships = [] } = row;
                    const membership = memberships.find(d => d.member === userId);
                    return membership && membership.role ? membership.role : '-';
                },
            },
            {
                key: 'joinedAt',
                label: _ts('userProfile', 'tableHeaderJoinedAt'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareDate(a.joinedAt, b.joinedAt),
                modifier: (row) => {
                    const { userId } = this.props;
                    const { memberships = [] } = row;
                    const membership = memberships.find(d => d.member === userId);
                    const { joinedAt } = membership || {};
                    return (
                        <FormattedDate
                            date={joinedAt}
                            mode="dd-MM-yyyy hh:mm"
                        />
                    );
                },
            },
            {
                key: 'actions',
                label: _ts('userProfile', 'tableHeaderActions'),
                order: 4,
                modifier: (d) => {
                    const { activeUser } = this.props;
                    const activeUserMembership = (d.memberships || [])
                        .find(e => e.member === activeUser.userId);

                    const linkToUserGroup = reverseRoute(
                        pathNames.userGroup,
                        { userGroupId: d.id },
                    );

                    if (!activeUserMembership || activeUserMembership.role !== 'admin') {
                        return (
                            <Link
                                title={_ts('userProfile', 'viewUsergroupLinkTitle')}
                                to={linkToUserGroup}
                                className={styles.link}
                            >
                                <span className={iconNames.openLink} />
                            </Link>
                        );
                    }

                    const confirmText = _ts('userProfile', 'confirmTextDeleteUserGroup', {
                        title: (<b>{d.title}</b>),
                    });

                    return (
                        <Fragment>
                            <Link
                                title={_ts('userProfile', 'editUsergroupLinkTitle')}
                                to={linkToUserGroup}
                                className={styles.link}
                            >
                                <span className={iconNames.edit} />
                            </Link>
                            <DangerConfirmButton
                                title={_ts('userProfile', 'deleteUsergroupLinkTitle')}
                                onClick={() => this.handleDeleteUserGroupClick(d)}
                                iconName={iconNames.delete}
                                smallVerticalPadding
                                confirmationMessage={confirmText}
                                transparent
                            />
                        </Fragment>
                    );
                },
            },
        ];
        this.userGroupsTableKeyExtractor = rowData => rowData.id;
    }

    componentWillMount() {
        const { userId } = this.props;
        this.startRequestForUserGroups(userId);
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps;
        if (this.props.userId !== userId) {
            this.startRequestForUserGroups(userId);
        }
    }

    componentWillUnmount() {
        if (this.userGroupsRequest) {
            this.userGroupsRequest.stop();
        }
        if (this.userGroupDeleteRequest) {
            this.userGroupDeleteRequest.stop();
        }
    }

    startRequestForUserGroups = (userId) => {
        if (this.userGroupsRequest) {
            this.userGroupsRequest.stop();
        }
        const userGroupsRequest = new UserGroupGetRequest({
            setUserGroups: this.props.setUserGroups,
        });
        this.userGroupsRequest = userGroupsRequest.create(userId);
        this.userGroupsRequest.start();
    }

    startRequestForUserGroupDelete = (userGroupId, userId) => {
        if (this.userGroupDeleteRequest) {
            this.userGroupDeleteRequest.stop();
        }
        const userGroupDeleteRequest = new UserGroupDeleteRequest({
            unSetUserGroup: this.props.unSetUserGroup,
            setState: v => this.setState(v),
        });
        this.userGroupDeleteRequest = userGroupDeleteRequest.create({
            userGroupId, userId,
        });
        this.userGroupDeleteRequest.start();
    }

    // BUTTONS

    handleAddUserGroupClick = () => {
        this.setState({ addUserGroup: true });
    }

    handleAddUserGroupClose = () => {
        this.setState({ addUserGroup: false });
    }

    // Delete Close
    handleDeleteUserGroupClick = (userGroup) => {
        const { userId } = this.props.activeUser;

        const { id } = userGroup;
        this.startRequestForUserGroupDelete(id, userId);
    }

    render() {
        const {
            className,
            userGroups,
            userId,
            activeUser,
        } = this.props;

        const {
            addUserGroup,
            deletePending,
        } = this.state;

        const isCurrentUser = userId === activeUser.userId;

        return (
            <div className={`${styles.groups} ${className}`}>
                {deletePending && <LoadingAnimation />}
                <div className={styles.header}>
                    <h2>
                        {_ts('userProfile', 'headerGroups')}
                    </h2>
                    {
                        isCurrentUser && (
                            <PrimaryButton
                                onClick={this.handleAddUserGroupClick}
                            >
                                {_ts('userProfile', 'addUserGroupButtonLabel')}
                            </PrimaryButton>
                        )
                    }
                </div>
                { addUserGroup &&
                    <Modal
                        closeOnEscape
                        onClose={this.handleAddUserGroupClose}
                    >
                        <ModalHeader
                            title={_ts('userProfile', 'addUserGroupButtonLabel')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddUserGroupClose}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody>
                            <UserGroupAdd
                                handleModalClose={this.handleAddUserGroupClose}
                            />
                        </ModalBody>
                    </Modal>
                }
                <div className={styles.usergroupTable}>
                    <Table
                        data={userGroups}
                        headers={this.userGroupsTableHeaders}
                        keyExtractor={this.userGroupsTableKeyExtractor}
                    />
                </div>
            </div>
        );
    }
}
