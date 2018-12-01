import PropTypes from 'prop-types';
import React from 'react';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';
import { reverseRoute } from '#rsu/common';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';

import DisplayPicture from '#components/DisplayPicture';
import {
    pathNames,
    iconNames,
} from '#constants';
import _ts from '#ts';

import Notification from '../Notification';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    notification: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    projectJoinApproveRequest: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    projectJoinRejectRequest: PropTypes.object,

    className: PropTypes.string,
};

const defaultProps = {
    notification: {},
    className: '',
    projectJoinApproveRequest: {},
    projectJoinRejectRequest: {},
};

const REQUEST_PENDING = 'pending';
const ROLE_DEFAULT = 'normal';
const ROLE_ADMIN = 'admin';

// TODO: show error message for request failure
const requests = {
    projectJoinApproveRequest: {
        url: ({
            params: {
                projectId,
                requestId,
            },
        }) => `/projects/${projectId}/requests/${requestId}/accept/`,
        method: requestMethods.POST,
        body: ({ params: { role } }) => ({ role }),
        isUnique: true,
    },
    projectJoinRejectRequest: {
        url: ({
            params: {
                projectId,
                requestId,
            },
        }) => `/projects/${projectId}/requests/${requestId}/reject/`,
        method: requestMethods.POST,
        isUnique: true,
    },
};

@RequestClient(requests)
export default class ProjectJoinRequestItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleAddButtonClick = () => {
        const {
            notification: {
                data: {
                    id: requestId,
                    project: { id: projectId },
                },
            },
            projectJoinApproveRequest,
        } = this.props;

        projectJoinApproveRequest.do({
            requestId,
            projectId,
            role: ROLE_DEFAULT,
        });
    }

    handleAddAsAdminButtonClick = () => {
        const {
            notification: {
                data: {
                    id: requestId,
                    project: { id: projectId },
                },
            },
            projectJoinApproveRequest,
        } = this.props;

        projectJoinApproveRequest.do({
            requestId,
            projectId,
            role: ROLE_ADMIN,
        });
    }

    handleRejectButtonClick = () => {
        const { projectJoinRejectRequest } = this.props;
        projectJoinRejectRequest.do();
    }

    render() {
        const {
            className: classNameFromProps,
            notification: {
                data: {
                    status,
                    requestedBy: {
                        displayPicture: requestorDisplayPictureId,
                        displayName: requestorName,
                        id: requestorId,
                    } = {},
                    project: {
                        id: projectId,
                        title: projectTitle,
                    } = {},
                },
                timestamp,
            },
            projectJoinApproveRequest: {
                pending: pendingProjectJoinAcceptRequest,
            },
            projectJoinRejectRequest: {
                pending: pendingProjectJoinRejectRequest,
            },
        } = this.props;

        if (!projectId) {
            return null;
        }

        const pending = pendingProjectJoinAcceptRequest || pendingProjectJoinAcceptRequest;

        const className = `
            ${classNameFromProps}
            ${styles.projectJoinRequestNotification}
        `;

        const requestorProfileLink = reverseRoute(
            pathNames.userProfile,
            { userId: requestorId },
        );

        const projectLink = reverseRoute(
            pathNames.projects,
            { projectId },
        );

        return (
            <Notification
                className={className}
                icon={
                    <DisplayPicture
                        className={styles.displayPicture}
                        galleryId={requestorDisplayPictureId}
                    />
                }
                message={
                    <div className={styles.message}>
                        {_ts('notifications.projectJoinRequest', 'message', {
                            requestorName: (
                                <a
                                    className={styles.requestorName}
                                    href={requestorProfileLink}
                                >
                                    {requestorName}
                                </a>
                            ),
                            projectTitle: (
                                <a
                                    className={styles.projectTitle}
                                    href={projectLink}
                                >
                                    {projectTitle}
                                </a>
                            ),
                        })}
                    </div>
                }
                timestamp={timestamp}
                actions={
                    status === REQUEST_PENDING && (
                        <React.Fragment>
                            <SuccessButton
                                disabled={pending}
                                className={styles.button}
                                iconName={iconNames.check}
                                onClick={this.handleAddButtonClick}
                                transparent
                            >
                                {_ts('notifications.projectJoinRequest', 'addButtonTitle')}
                            </SuccessButton>
                            <WarningButton
                                disabled={pending}
                                className={styles.button}
                                iconName={iconNames.check}
                                onClick={this.handleAddAsAdminButtonClick}
                                transparent
                            >
                                {_ts('notifications.projectJoinRequest', 'addAsAdminButtonTitle')}
                            </WarningButton>
                            <DangerButton
                                disabled={pending}
                                className={styles.button}
                                iconName={iconNames.close}
                                onClick={this.handleRejectButtonClick}
                                transparent
                            >
                                {_ts('notifications.projectJoinRequest', 'rejectButtonTitle')}
                            </DangerButton>
                        </React.Fragment>
                    )
                }
            />
        );
    }
}
