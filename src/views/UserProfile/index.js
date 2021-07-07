import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Page from '#rscv/Page';
import Message from '#rscv/Message';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Avatar from '#newComponents/ui/Avatar';

import {
    userInformationSelector,
    setUserProfileAction,
    unsetUserProfileAction,
    activeUserSelector,
    userIdFromRouteSelector,
} from '#redux';
import _ts from '#ts';

import UserInformationGetRequest from './requests/UserInformationGetRequest';
import UserProjectsGetRequest from './requests/UserProjectsGetRequest';
import UserUsergroupsGetRequest from './requests/UserUsergroupsGetRequest';

import UserProject from './UserProject';
import UserGroup from './UserGroup';
import UserEdit from './UserEdit';

import styles from './styles.scss';

const propTypes = {
    setUserProfile: PropTypes.func.isRequired,
    unsetUserProfile: PropTypes.func.isRequired,
    userInformation: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userId: PropTypes.number.isRequired,
};

const defaultProps = {};

const mapStateToProps = state => ({
    userInformation: userInformationSelector(state),
    activeUser: activeUserSelector(state),
    userId: userIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserProfile: params => dispatch(setUserProfileAction(params)),
    unsetUserProfile: params => dispatch(unsetUserProfileAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class UserProfile extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showEditProfileModal: false,
            userInformationPending: true,
            userProjectsPending: true,
            userUsergroupsPending: true,
        };

        this.userInformationRequest = new UserInformationGetRequest({
            unsetUserProfile: this.props.unsetUserProfile,
            setUserProfile: this.props.setUserProfile,
            setState: v => this.setState(v),
        });
        this.userProjectsRequest = new UserProjectsGetRequest({
            setUserProfile: this.props.setUserProfile,
            setState: v => this.setState(v),
        });
        this.userGroupsRequest = new UserUsergroupsGetRequest({
            setUserProfile: this.props.setUserProfile,
            setState: v => this.setState(v),
        });
    }

    componentDidMount() {
        const { userId } = this.props;
        this.userInformationRequest.init(userId).start();
        this.userProjectsRequest.init(userId).start();
        this.userGroupsRequest.init(userId).start();
    }

    componentWillReceiveProps(nextProps) {
        const { userId: newUserId } = nextProps;
        const { userId: oldUserId } = this.props;
        if (newUserId !== oldUserId) {
            this.userInformationRequest.init(newUserId).start();
            this.userProjectsRequest.init(newUserId).start();
            this.userGroupsRequest.init(newUserId).start();
        }
    }

    componentWillUnmount() {
        this.userInformationRequest.stop();
        this.userProjectsRequest.stop();
        this.userGroupsRequest.stop();
    }

    // BUTTONS
    handleEditProfileClick = () => {
        this.setState({ showEditProfileModal: true });
    }

    handleEditProfileClose = () => {
        this.setState({ showEditProfileModal: false });
    }

    renderEditProfileModal = () => {
        const {
            userInformation,
            userId,
        } = this.props;

        return (
            <Modal
                closeOnEscape
                onClose={this.handleEditProfileClose}
                className={styles.userProfileEditModal}
            >
                <ModalHeader
                    title={_ts('userProfile', 'editProfileModalHeader')}
                    rightComponent={
                        <PrimaryButton
                            onClick={this.handleEditProfileClose}
                            transparent
                            iconName="close"
                        />
                    }
                />
                <ModalBody>
                    <UserEdit
                        userId={userId}
                        userInformation={userInformation}
                        handleModalClose={this.handleEditProfileClose}
                    />
                </ModalBody>
            </Modal>
        );
    }

    render() {
        const {
            userInformation,
            userId,
            activeUser,
        } = this.props;

        const {
            userInformationPending,
            userProjectsPending,
            userUsergroupsPending,
            showEditProfileModal,
        } = this.state;

        const pending = (
            userInformationPending ||
            userProjectsPending ||
            userUsergroupsPending
        );

        const isCurrentUser = userId === activeUser.userId;
        const EditProfileModal = this.renderEditProfileModal;

        return (
            <Page
                className={styles.userProfile}
                header={
                    <h2 className={styles.heading}>
                        {_ts('userProfile', 'userProfileTitle')}
                    </h2>
                }
                mainContentClassName={styles.mainContent}
                mainContent={
                    <React.Fragment>
                        { pending && <LoadingAnimation /> }
                        { !pending && userInformation.id ? (
                            <React.Fragment>
                                <div className={styles.left}>
                                    <div className={styles.info}>
                                        <Avatar
                                            className={styles.displayPicture}
                                            src={userInformation.displayPictureUrl}
                                            name={`${userInformation.firstName} ${userInformation.lastName}`}
                                        />
                                        <div className={styles.detail}>
                                            <div className={styles.nameContainer}>
                                                <div className={styles.name}>
                                                    <div className={styles.first}>
                                                        { userInformation.firstName }
                                                    </div>
                                                    <div>
                                                        { userInformation.lastName }
                                                    </div>
                                                </div>
                                                { isCurrentUser && (
                                                    <Button
                                                        className={styles.editProfileButton}
                                                        onClick={this.handleEditProfileClick}
                                                        transparent
                                                        iconName="edit"
                                                    />
                                                )}
                                                { showEditProfileModal && <EditProfileModal /> }
                                            </div>
                                            <div className={styles.email}>
                                                { userInformation.email }
                                            </div>
                                            <div className={styles.organization}>
                                                { userInformation.organization }
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.stats}>
                                        <h2>Stats</h2>
                                    </div>
                                </div>
                                <div className={styles.right}>
                                    <UserProject className={styles.projects} />
                                    <UserGroup className={styles.groups} />
                                </div>
                            </React.Fragment>
                        ) : (
                            <Message>
                                {_ts('userProfile', 'userNotFound')}
                            </Message>
                        ) }
                    </React.Fragment>
                }
            />
        );
    }
}
