import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import BoundError from '#rscg/BoundError';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';

import AppError from '#components/AppError';
import { iconNames } from '#constants';
import {
    groupSelector,
    setUserGroupAction,
    unSetUserGroupAction,

    activeUserSelector,
    groupIdFromRouteSelector,
} from '#redux';
import _ts from '#ts';

import MembersTable from './MembersTable';
import ProjectsTable from './ProjectsTable';
import UserGroupEdit from './UserGroupEdit';
import UserGroupGetRequest from './requests/UserGroupGetRequest';

import styles from './styles.scss';

const propTypes = {
    userGroup: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setUserGroup: PropTypes.func.isRequired,
    unSetUserGroup: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupId: PropTypes.number.isRequired,
};

const defaultProps = {};

const mapStateToProps = (state, props) => ({
    userGroup: groupSelector(state, props),
    activeUser: activeUserSelector(state),
    userGroupId: groupIdFromRouteSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setUserGroup: params => dispatch(setUserGroupAction(params)),
    unSetUserGroup: params => dispatch(unSetUserGroupAction(params)),
});

const emptyList = [];

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class UserGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showUserGroupEditModal: false,
            pending: true,
        };
    }

    componentWillMount() {
        const { userGroupId } = this.props;
        this.startRequestForUserGroup(userGroupId);
    }

    componentWillUnmount() {
        if (this.userGroupRequest) {
            this.userGroupRequest.stop();
        }
        if (this.usersRequest) {
            this.usersRequest.stop();
        }
    }

    startRequestForUserGroup = (id) => {
        if (this.userGroupRequest) {
            this.userGroupRequest.stop();
        }
        const userGroupRequest = new UserGroupGetRequest({
            setUserGroup: this.props.setUserGroup,
            unSetUserGroup: this.props.unSetUserGroup,
            setState: v => this.setState(v),
        });
        this.userGroupRequest = userGroupRequest.create(id);
        this.userGroupRequest.start();
    }

    isCurrentUserAdmin = memberData => (
        memberData.findIndex(member => (
            member.role === 'admin' && member.member === this.props.activeUser.userId
        )) !== -1
    )

    handleUserGroupEditModalClose = () => {
        this.setState({ showUserGroupEditModal: false });
    }

    handleUserGroupEditClick = () => {
        this.setState({ showUserGroupEditModal: true });
    }

    render() {
        const {
            userGroup,
            userGroupId,
        } = this.props;
        const {
            showUserGroupEditModal,
            pending,
        } = this.state;

        const isCurrentUserAdmin = this.isCurrentUserAdmin(userGroup.memberships || emptyList);

        if (pending) {
            return (
                <div className={styles.usergroup}>
                    <LoadingAnimation large />
                </div>
            );
        }

        if (!userGroup.id) {
            return (
                <div className={styles.usergroup}>
                    <div className={styles.usergroupAlt}>
                        {_ts('userGroup', 'userGroupNotFound')}
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.usergroup}>
                <header className={styles.header}>
                    <h2>
                        {_ts('userGroup', 'userGroupTitle')}
                    </h2>
                </header>
                <div className={styles.info}>
                    <div className={styles.titleContainer}>
                        <span className={styles.name}>{ userGroup.title }</span>
                        {
                            isCurrentUserAdmin &&
                                <PrimaryButton
                                    onClick={this.handleUserGroupEditClick}
                                    transparent
                                >
                                    <span className={iconNames.edit} />
                                </PrimaryButton>
                        }
                    </div>
                    <p className={styles.description}>
                        { userGroup.description }
                    </p>
                </div>
                <div className={styles.stats}>
                    <h2>
                        {_ts('userGroup', 'userGroupActivtyLogTitle')}
                    </h2>
                </div>
                <ProjectsTable
                    className={styles.projects}
                    isCurrentUserAdmin={isCurrentUserAdmin}
                    userGroup={userGroup}
                />
                <MembersTable
                    className={styles.members}
                    memberData={userGroup.memberships || emptyList}
                    userGroupId={userGroupId}
                    isCurrentUserAdmin={isCurrentUserAdmin}
                    activeUser={this.props.activeUser}
                />
                { showUserGroupEditModal &&
                    <Modal
                        closeOnEscape
                        onClose={this.handleUserGroupEditModalClose}
                        className={styles.userGroupEditModal}
                    >
                        <ModalHeader
                            title={_ts('userGroup', 'userGroupEditModalLabel')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleUserGroupEditModalClose}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody>
                            <UserGroupEdit
                                userGroup={userGroup}
                                handleModalClose={this.handleUserGroupEditModalClose}
                            />
                        </ModalBody>
                    </Modal>
                }
            </div>
        );
    }
}
