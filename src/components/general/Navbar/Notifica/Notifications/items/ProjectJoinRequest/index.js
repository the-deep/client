import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import {
    RequestClient,
    methods,
} from '#request';

import { reverseRoute, _cs } from '@togglecorp/fujs';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';

import DisplayPicture from '#components/viewer/DisplayPicture';
import { pathNames } from '#constants';
import _ts from '#ts';

import Notification, { NOTIFICATION_STATUS_SEEN } from '../Notification';
import LinkItem from '../LinkItem';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    notification: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,

    className: PropTypes.string,
    closeModal: PropTypes.func.isRequired,

    // eslint-disable-next-line react/no-unused-prop-types
    onNotificationReload: PropTypes.func.isRequired,
    onNotificationSeenStatusChange: PropTypes.func.isRequired,
};

const defaultProps = {
    notification: {},
    className: '',
};

// TODO: show error message for request failure
const requestOptions = {
    projectJoinApproveRequest: {
        url: ({
            params: {
                projectId,
                requestId,
            },
        }) => `/projects/${projectId}/requests/${requestId}/accept/`,
        method: methods.POST,
        body: ({ params: { role } }) => ({ role }),
        onSuccess: ({
            props: {
                onNotificationReload,
            },
        }) => {
            onNotificationReload();
        },
    },
    projectJoinRejectRequest: {
        url: ({
            params: {
                projectId,
                requestId,
            },
        }) => `/projects/${projectId}/requests/${requestId}/reject/`,
        method: methods.POST,
        onSuccess: ({
            props: {
                onNotificationReload,
            },
        }) => {
            onNotificationReload();
        },
    },
};

function ProjectJoinRequestItem(props) {
    const {
        className: classNameFromProps,
        notification: {
            data: {
                id: requestId,
                status,
                requestedBy: {
                    displayPicture: requestorDisplayPictureId,
                    displayName: requestorName,
                    id: requestorId,
                } = {},
                reason,
                project: {
                    id: projectId,
                    title: projectTitle,
                } = {},
            },
            timestamp,
            id: notificationId,
            status: seenStatus,
        },
        requests: {
            projectJoinApproveRequest,
            projectJoinRejectRequest,
        },
        closeModal,
        onNotificationSeenStatusChange,
    } = props;

    const {
        do: projectJoinApproveRequestDo,
        pending: pendingProjectJoinAcceptRequest,
    } = projectJoinApproveRequest;

    const {
        do: projectJoinRejectRequestDo,
        pending: pendingProjectJoinRejectRequest,
    } = projectJoinRejectRequest;

    const handleAddButtonClick = useCallback(() => {
        projectJoinApproveRequestDo({
            requestId,
            projectId,
            role: 'normal',
        });
    }, [requestId, projectId, projectJoinApproveRequestDo]);

    const handleRejectButtonClick = useCallback(() => {
        projectJoinRejectRequestDo({
            requestId,
            projectId,
        });
    }, [requestId, projectId, projectJoinRejectRequestDo]);

    if (!projectId) {
        return null;
    }

    const pending = pendingProjectJoinAcceptRequest || pendingProjectJoinRejectRequest;

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
            className={_cs(classNameFromProps, styles.projectJoinRequestNotification)}
            notificationId={notificationId}
            seenStatus={seenStatus === NOTIFICATION_STATUS_SEEN}
            onNotificationSeenStatusChange={onNotificationSeenStatusChange}
            icon={
                <DisplayPicture
                    className={styles.displayPicture}
                    galleryId={requestorDisplayPictureId}
                />
            }
            message={
                <div>
                    {_ts('notifications.projectJoinRequest', 'message', {
                        requestorName: (
                            <LinkItem
                                link={requestorProfileLink}
                                title={requestorName}
                                closeModal={closeModal}
                            />
                        ),
                        projectTitle: (
                            <LinkItem
                                link={projectLink}
                                title={projectTitle}
                                closeModal={closeModal}
                            />
                        ),
                    })}
                </div>
            }
            description={reason}
            descriptionLabel={_ts('notifications.projectJoinRequest', 'expandButtonLabel')}
            timestamp={timestamp}
            actions={
                status === 'pending' ? (
                    <React.Fragment>
                        <SuccessButton
                            disabled={pending}
                            className={styles.button}
                            iconName="check"
                            onClick={handleAddButtonClick}
                            transparent
                            pending={pendingProjectJoinAcceptRequest}
                        >
                            {_ts('notifications.projectJoinRequest', 'addButtonTitle')}
                        </SuccessButton>
                        <DangerButton
                            disabled={pending}
                            className={styles.button}
                            iconName="close"
                            onClick={handleRejectButtonClick}
                            transparent
                            pending={pendingProjectJoinRejectRequest}
                        >
                            {_ts('notifications.projectJoinRequest', 'rejectButtonTitle')}
                        </DangerButton>
                    </React.Fragment>
                ) : null
            }
        />
    );
}

ProjectJoinRequestItem.propTypes = propTypes;
ProjectJoinRequestItem.defaultProps = defaultProps;

export default RequestClient(requestOptions)(ProjectJoinRequestItem);
