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
    userUserGroupsSelector,
    activeUserSelector,
    unsetUserProfileUsergroupAction,
    userIdFromRouteSelector,
} from '#redux';
import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import UserGroupDeleteRequest from '../requests/UserGroupDeleteRequest';

import UserGroupAdd from './UserGroupAdd';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    usergroups: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    unsetUserGroup: PropTypes.func.isRequired,
    userId: PropTypes.number.isRequired,
};

const defaultProps = {
    className: '',
};


const mapStateToProps = state => ({
    usergroups: userUserGroupsSelector(state),
    activeUser: activeUserSelector(state),
    userId: userIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    unsetUserGroup: params => dispatch(unsetUserProfileUsergroupAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class UserGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static userGroupsTableKeyExtractor = rowData => rowData.id;

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
        this.userGroupDeleteRequest = new UserGroupDeleteRequest({
            setState: v => this.setState(v),
            unsetUserGroup: this.props.unsetUserGroup,
        });
    }

    componentWillUnmount() {
        this.userGroupDeleteRequest.stop();
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
        const { id } = userGroup;
        const { userId } = this.props.activeUser;
        // TODO: change Usergroup to UserUserGroup, thanks
        this.userGroupDeleteRequest.init(id, userId).start();
    }

    render() {
        const {
            className,
            usergroups,
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
                        data={usergroups}
                        headers={this.userGroupsTableHeaders}
                        keySelector={UserGroup.userGroupsTableKeyExtractor}
                    />
                </div>
            </div>
        );
    }
}
