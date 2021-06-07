import PropTypes from 'prop-types';
import React from 'react';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Avatar from '#components/ui/Avatar';

import { pathNames } from '#constants';
import _ts from '#ts';

import Notification, { NOTIFICATION_STATUS_SEEN } from '../Notification';
import LinkItem from '../LinkItem';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    notification: PropTypes.object,
    className: PropTypes.string,
    closeModal: PropTypes.func.isRequired,
    onNotificationSeenStatusChange: PropTypes.func.isRequired,
};

const defaultProps = {
    notification: {},
    className: '',
};

const emptyObject = {};

const PROJECT_JOIN_ACCEPTED = 'accepted';
const PROJECT_JOIN_REJECTED = 'rejected';

function ProjectJoinResponseItem(props) {
    const {
        className,
        notification: {
            id: notificationId,
            status: seenStatus,
            data: {
                respondedBy: {
                    displayName: responderName,
                    id: responderId,
                } = emptyObject,
                requestedBy: {
                    displayName: requestorName,
                    id: requestorId,
                } = emptyObject,
                project: {
                    id: projectId,
                    title: projectTitle,
                } = emptyObject,
                status,
            },
            timestamp,
        },
        onNotificationSeenStatusChange,
        closeModal,
    } = props;

    if (status !== PROJECT_JOIN_REJECTED && status !== PROJECT_JOIN_ACCEPTED) {
        return null;
    }

    const responderProfileLink = reverseRoute(
        pathNames.userProfile,
        { userId: responderId },
    );

    const requestorProfileLink = reverseRoute(
        pathNames.userProfile,
        { userId: requestorId },
    );

    const projectLink = reverseRoute(
        pathNames.projects,
        { projectId },
    );

    const stringParams = {
        responderName: (
            <LinkItem
                link={responderProfileLink}
                title={responderName}
                closeModal={closeModal}
            />
        ),
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
    };

    let messageText = '';
    if (status === PROJECT_JOIN_ACCEPTED) {
        messageText = _ts('notifications.projectJoinResponse', 'acceptText', stringParams);
    } else if (status === PROJECT_JOIN_REJECTED) {
        messageText = _ts('notifications.projectJoinResponse', 'rejectText', stringParams);
    }

    return (
        <Notification
            className={_cs(className)}
            notificationId={notificationId}
            seenStatus={seenStatus === NOTIFICATION_STATUS_SEEN}
            onNotificationSeenStatusChange={onNotificationSeenStatusChange}
            icon={<Avatar name={requestorName} />}
            message={(
                <div>
                    {messageText}
                </div>
            )}
            timestamp={timestamp}
        />
    );
}

ProjectJoinResponseItem.propTypes = propTypes;
ProjectJoinResponseItem.defaultProps = defaultProps;

export default ProjectJoinResponseItem;
