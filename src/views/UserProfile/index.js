/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author pprabesh <prabes.pathak@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Message from '#rscv/Message';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import LoadingAnimation from '#rscv/LoadingAnimation';

import DisplayPicture from '#components/DisplayPicture';
import {
    userInformationSelector,
    setUserProfileAction,
    unsetUserProfileAction,
    activeUserSelector,
    userIdFromRouteSelector,
} from '#redux';
import _ts from '#ts';
import { iconNames } from '#constants';

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
            editProfile: false,
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
        this.setState({ editProfile: true });
    }

    handleEditProfileClose = () => {
        this.setState({ editProfile: false });
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
        } = this.state;

        const pending = (
            userInformationPending ||
            userProjectsPending ||
            userUsergroupsPending
        );

        const isCurrentUser = userId === activeUser.userId;

        if (pending) {
            return (
                <div className={styles.userProfile}>
                    <LoadingAnimation large />
                </div>
            );
        }

        if (!userInformation.id) {
            return (
                <Message>
                    {_ts('userProfile', 'userNotFound')}
                </Message>
            );
        }

        // FIXME: strings, line 166
        return (
            <div className={styles.userProfile}>
                <header className={styles.header}>
                    <h2>User Profile</h2>
                </header>
                <div className={styles.info}>
                    {/* FIXME: add a default image in img */}
                    <DisplayPicture
                        className={styles.displayPicture}
                        galleryId={userInformation.displayPicture}
                    />
                    <div className={styles.detail}>
                        <div className={styles.name}>
                            <div>
                                <span className={styles.first}>
                                    { userInformation.firstName }
                                </span>
                                <span className={styles.last}>
                                    { userInformation.lastName }
                                </span>
                            </div>
                            {
                                isCurrentUser &&
                                    <PrimaryButton
                                        onClick={this.handleEditProfileClick}
                                        transparent
                                    >
                                        <span className={iconNames.edit} />
                                    </PrimaryButton>
                            }
                            { this.state.editProfile &&
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
                                            >
                                                <span className={iconNames.close} />
                                            </PrimaryButton>
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
                            }
                        </div>
                        <p className={styles.email}>
                            { userInformation.email }
                        </p>
                        <p className={styles.organization}>
                            { userInformation.organization }
                        </p>
                    </div>
                </div>
                <div className={styles.stats}>
                    <h2>Stats</h2>
                </div>
                <UserProject className={styles.projects} />
                <UserGroup className={styles.groups} />
            </div>
        );
    }
}
