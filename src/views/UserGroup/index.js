import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';

import { iconNames } from '#constants';
import {
    usergroupInformationSelector,
    isCurrentUserAdminOfCurrentUsergroup,
    setUsergroupViewAction,
    unSetUserGroupAction,

    activeUserSelector,
    groupIdFromRouteSelector,
} from '#redux';
import _ts from '#ts';

import MembersTable from './MembersTable';
import ProjectsTable from './ProjectsTable';
import UserGroupEdit from './UserGroupEdit';

import UserGroupGetRequest from './requests/UserGroupGetRequest';
import UserGroupProjectsRequest from './requests/UserGroupProjectsRequest';

import styles from './styles.scss';

const propTypes = {
    usergroup: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setUsergroupView: PropTypes.func.isRequired,
    unSetUserGroup: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupId: PropTypes.number.isRequired,
    isCurrentUserAdmin: PropTypes.bool.isRequired,
};

const defaultProps = {};

const mapStateToProps = state => ({
    usergroup: usergroupInformationSelector(state),
    activeUser: activeUserSelector(state),
    userGroupId: groupIdFromRouteSelector(state),
    isCurrentUserAdmin: isCurrentUserAdminOfCurrentUsergroup(state),
});

const mapDispatchToProps = dispatch => ({
    setUsergroupView: params => dispatch(setUsergroupViewAction(params)),
    unSetUserGroup: params => dispatch(unSetUserGroupAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Usergroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showUserGroupEditModal: false,
            pending: true,
        };

        // Requests
        this.userGroupRequest = new UserGroupGetRequest({
            setUsergroupView: this.props.setUsergroupView,
            unSetUserGroup: this.props.unSetUserGroup,
            setState: v => this.setState(v),
        });
        this.usergroupProjectsRequest = new UserGroupProjectsRequest({
            setUsergroupView: this.props.setUsergroupView,
        });
    }

    componentWillMount() {
        const { userGroupId } = this.props;
        this.userGroupRequest.init(userGroupId).start();
        this.usergroupProjectsRequest.init(userGroupId).start();
    }

    componentWillUnmount() {
        this.userGroupRequest.stop();
        this.usergroupProjectsRequest.stop();
    }

    handleUserGroupEditModalClose = () => {
        this.setState({ showUserGroupEditModal: false });
    }

    handleUserGroupEditClick = () => {
        this.setState({ showUserGroupEditModal: true });
    }

    render() {
        const {
            usergroup,
            userGroupId,
            isCurrentUserAdmin,
        } = this.props;
        const {
            showUserGroupEditModal,
            pending,
        } = this.state;

        if (pending) {
            return (
                <div className={styles.usergroup}>
                    <LoadingAnimation large />
                </div>
            );
        }

        if (!usergroup.id) {
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
                        <span className={styles.name} >
                            { usergroup.title }
                        </span>
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
                        { usergroup.description }
                    </p>
                </div>
                <div className={styles.stats}>
                    <h2>
                        {_ts('userGroup', 'userGroupActivtyLogTitle')}
                    </h2>
                </div>
                <ProjectsTable
                    className={styles.projects}
                    usergroup={usergroup}
                />
                <MembersTable
                    className={styles.members}
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
                                userGroup={usergroup}
                                handleModalClose={this.handleUserGroupEditModalClose}
                            />
                        </ModalBody>
                    </Modal>
                }
            </div>
        );
    }
}
