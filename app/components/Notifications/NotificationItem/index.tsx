import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Message,
    Link,
} from '@the-deep/deep-ui';
import { generatePath } from 'react-router-dom';

import generateString from '#utils/string';
import routes from '#base/configs/routes';

import { Notification } from '../types';
import NotificationContainer from '../NotificationContainer';
import styles from './styles.css';

interface Props {
    className?: string;
    notification: Notification;
}

function NotificationItem(props: Props) {
    const {
        className,
        notification,
    } = props;

    if (notification.notificationType === 'PROJECT_JOIN_REQUEST') {
        const { data } = notification;

        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                userName={data?.requested_by?.display_name}
                notification={notification}
                descriptionLabel="Reason"
                description={data?.reason}
                content={
                    generateString(
                        '{requestorName} requested to join the project {projectTitle}.',
                        {
                            requestorName: (<b>{data?.requested_by?.display_name}</b>),
                            projectTitle: (<b>{data?.project?.title}</b>),
                        },
                    )
                }
            />
        );
    }
    if (notification.notificationType === 'PROJECT_JOIN_REQUEST_ABORT') {
        return (
            <div className={_cs(className, styles.notificationItem)}>
                {notification.notificationTypeDisplay}
            </div>
        );
    }
    if (notification.notificationType === 'PROJECT_JOIN_RESPONSE') {
        return (
            <div className={_cs(className, styles.notificationItem)}>
                {notification.notificationTypeDisplay}
            </div>
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_ADD') {
        return (
            <div className={_cs(className, styles.notificationItem)}>
                {notification.notificationTypeDisplay}
            </div>
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_MODIFY') {
        return (
            <div className={_cs(className, styles.notificationItem)}>
                {notification.notificationTypeDisplay}
            </div>
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_ASSIGNEE_CHANGE') {
        return (
            <div className={_cs(className, styles.notificationItem)}>
                {notification.notificationTypeDisplay}
            </div>
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_REPLY_ADD') {
        return (
            <div className={_cs(className, styles.notificationItem)}>
                {notification.notificationTypeDisplay}
            </div>
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_REPLY_MODIFY') {
        return (
            <div className={_cs(className, styles.notificationItem)}>
                {notification.notificationTypeDisplay}
            </div>
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_RESOLVED') {
        return (
            <div className={_cs(className, styles.notificationItem)}>
                {notification.notificationTypeDisplay}
            </div>
        );
    }
    if (notification.notificationType === 'ENTRY_REVIEW_COMMENT_ADD') {
        const { data } = notification;

        const editEntryLink = {
            pathname: (generatePath(routes.entryEdit.path, {
                projectId: data?.project_details?.id,
                leadId: data?.lead,
            })),
            state: {
                entryId: data?.entry,
            },
        };

        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                userName={data?.created_by_details?.name}
                descriptionLabel="Comment"
                description={data?.text}
                content={
                    generateString(
                        '{createdByName} assigned you to a comment in the {entryLink} in the project {projectTitle}.',
                        {
                            createdByName: (<b>{data?.created_by_details?.name}</b>),
                            entryLink: (
                                <Link
                                    className={styles.link}
                                    to={editEntryLink}
                                >
                                    entry
                                </Link>
                            ),
                            projectTitle: (<b>{data?.project_details?.title}</b>),
                        },
                    )
                }
            />
        );
    }
    if (notification.notificationType === 'ENTRY_REVIEW_COMMENT_MODIFY') {
        return (
            <div className={_cs(className, styles.notificationItem)}>
                {notification.notificationTypeDisplay}
            </div>
        );
    }

    return (
        <Message
            className={_cs(className, styles.notificationItem)}
            message="Sorry, we could not render this notification. So, use this notification as a reminder to stretch!  "
        />
    );
}

export default NotificationItem;
