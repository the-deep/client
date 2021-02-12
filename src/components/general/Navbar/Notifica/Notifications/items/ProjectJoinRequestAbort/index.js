import PropTypes from 'prop-types';
import React from 'react';

import { reverseRoute } from '@togglecorp/fujs';

import Avatar from '#components/ui/Avatar';

import { pathNames } from '#constants';
import _ts from '#ts';

import Notification, { NOTIFICATION_STATUS_SEEN } from '../Notification';
import LinkItem from '../LinkItem';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    notification: PropTypes.object,
    closeModal: PropTypes.func.isRequired,
    onNotificationSeenStatusChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    notification: {},
};

function ProjectJoinRequestAbortItem(props) {
    const {
        className,
        notification: {
            id: notificationId,
            status: seenStatus,
            data: {
                requestedBy: {
                    displayName: requestorName,
                    id: requestorId,
                },
                project: {
                    id: projectId,
                    title: projectTitle,
                },
            },
            timestamp,
        },
        onNotificationSeenStatusChange,
        closeModal,
    } = props;

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
            notificationId={notificationId}
            seenStatus={seenStatus === NOTIFICATION_STATUS_SEEN}
            onNotificationSeenStatusChange={onNotificationSeenStatusChange}
            icon={<Avatar name={requestorName} />}
            message={
                <div>
                    {_ts('notifications', 'projectJoinRequestAbortText', {
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
            timestamp={timestamp}
        />
    );
}

ProjectJoinRequestAbortItem.propTypes = propTypes;
ProjectJoinRequestAbortItem.defaultProps = defaultProps;

export default ProjectJoinRequestAbortItem;
