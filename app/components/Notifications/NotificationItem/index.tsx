import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Message,
    Link,
} from '@the-deep/deep-ui';
import { generatePath } from 'react-router-dom';

import generateString from '#utils/string';
import routes from '#base/configs/routes';

import { Notification, ReviewEntryCommentAdd } from '../types';
import NotificationContainer from '../NotificationContainer';
import ProjectJoinRequestItem from './ProjectJoinRequestItem';
import { EntryAction } from '#components/entryReview/commentConstants';
import styles from './styles.css';

interface Props {
    className?: string;
    notification: Notification;
    closeNotification: () => void;
    onNotificationUpdate: () => void;
}

function getCommentTokenString(data: ReviewEntryCommentAdd['data']) {
    if (data?.comment_type === EntryAction.COMMENT) {
        return '{createdByName} assigned you to a comment in an {entryLink} in the project {projectTitle}.';
    }
    if (data?.comment_type === EntryAction.VERIFY) {
        return '{createdByName} verified an {entryLink} in the project {projectTitle}.';
    }
    if (data?.comment_type === EntryAction.UNVERIFY) {
        return '{createdByName} unverified an {entryLink} in the project {projectTitle}.';
    }
    if (data?.comment_type === EntryAction.CONTROL) {
        return '{createdByName} controlled an {entryLink} in the project {projectTitle}.';
    }
    if (data?.comment_type === EntryAction.UNCONTROL) {
        return '{createdByName} uncontrolled an {entryLink} in the project {projectTitle}.';
    }
    return '';
}

function NotificationItem(props: Props) {
    const {
        className,
        notification,
        onNotificationUpdate,
        closeNotification,
    } = props;

    if (notification.notificationType === 'PROJECT_JOIN_REQUEST') {
        return (
            <ProjectJoinRequestItem
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                onNotificationUpdate={onNotificationUpdate}
            />
        );
    }
    if (notification.notificationType === 'PROJECT_JOIN_REQUEST_ABORT') {
        const { data } = notification;

        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                userName={data?.requested_by?.display_name}
                descriptionLabel="Reason"
                description={data?.reason}
                content={
                    generateString(
                        '{requestorName} removed their join request to the project {projectTitle}.',
                        {
                            requestorName: (<b>{data?.requested_by?.display_name}</b>),
                            projectTitle: (<b>{data?.project?.title}</b>),
                        },
                    )
                }
            />
        );
    }
    if (notification.notificationType === 'PROJECT_JOIN_RESPONSE') {
        const { data } = notification;

        const content = data?.status === 'accepted'
            ? (generateString(
                '{respondorName} accepted join request of {requestorName} in the project {projectTitle}.',
                {
                    requestorName: (<b>{data?.requested_by?.display_name}</b>),
                    respondorName: (<b>{data?.responded_by?.display_name}</b>),
                    projectTitle: (<b>{data?.project?.title}</b>),
                },
            )) : (
                generateString(
                    '{respondorName} rejected join request of {requestorName} in the project {projectTitle}.',
                    {
                        requestorName: (<b>{data?.requested_by?.display_name}</b>),
                        respondorName: (<b>{data?.responded_by?.display_name}</b>),
                        projectTitle: (<b>{data?.project?.title}</b>),
                    },
                )
            );

        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                userName={data?.requested_by?.display_name}
                content={content}
            />
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_ADD') {
        const {
            data,
            project,
        } = notification;

        const editEntryLink = (project?.id && data?.lead) ? ({
            pathname: (generatePath(routes.entryEdit.path, {
                projectId: project?.id,
                leadId: data?.lead,
            })),
            state: {
                entryId: data?.entry,
            },
            hash: '#/primary-tagging',
        }) : undefined;

        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                userName={data?.created_by_detail?.name}
                descriptionLabel="Comment"
                description={data?.text}
                content={
                    generateString(
                        '{createdByName} assigned you to a comment in the {entryLink} in the project {projectTitle}.',
                        {
                            createdByName: (<b>{data?.created_by_detail?.name}</b>),
                            entryLink: editEntryLink ? (
                                <Link
                                    className={styles.link}
                                    onClick={closeNotification}
                                    to={editEntryLink}
                                >
                                    entry
                                </Link>
                            ) : (
                                'entry'
                            ),
                            projectTitle: (<b>{project?.title}</b>),
                        },
                    )
                }
            />
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_MODIFY') {
        const {
            data,
            project,
        } = notification;

        const editEntryLink = (project?.id && data?.lead) ? ({
            pathname: (generatePath(routes.entryEdit.path, {
                projectId: project?.id,
                leadId: data?.lead,
            })),
            state: {
                entryId: data?.entry,
            },
            hash: '#/primary-tagging',
        }) : undefined;

        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                userName={data?.created_by_detail?.name}
                descriptionLabel="Comment"
                description={data?.text}
                content={
                    generateString(
                        '{createdByName} modified the comment you were assigned to in the {entryLink} in the project {projectTitle}.',
                        {
                            createdByName: (<b>{data?.created_by_detail?.name}</b>),
                            entryLink: editEntryLink ? (
                                <Link
                                    className={styles.link}
                                    onClick={closeNotification}
                                    to={editEntryLink}
                                >
                                    entry
                                </Link>
                            ) : (
                                'entry'
                            ),
                            projectTitle: (<b>{project?.title}</b>),
                        },
                    )
                }
            />
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_ASSIGNEE_CHANGE') {
        const {
            data,
            project,
        } = notification;

        const editEntryLink = {
            pathname: (generatePath(routes.entryEdit.path, {
                projectId: project?.id,
                leadId: data?.lead,
            })),
            state: {
                entryId: data?.entry,
            },
            hash: '#/primary-tagging',
        };

        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                userName={data?.created_by_detail?.name}
                descriptionLabel="Comment"
                description={data?.text}
                content={
                    generateString(
                        '{createdByName} assigned you to a comment in the {entryLink} in the project {projectTitle}.',
                        {
                            createdByName: (<b>{data?.created_by_detail?.name}</b>),
                            entryLink: (
                                <Link
                                    className={styles.link}
                                    onClick={closeNotification}
                                    to={editEntryLink}
                                >
                                    entry
                                </Link>
                            ),
                            projectTitle: (<b>{project?.title}</b>),
                        },
                    )
                }
            />
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_REPLY_ADD') {
        const {
            data,
            project,
        } = notification;

        const editEntryLink = {
            pathname: (generatePath(routes.entryEdit.path, {
                projectId: project?.id,
                leadId: data?.lead,
            })),
            state: {
                entryId: data?.entry,
            },
            hash: '#/primary-tagging',
        };

        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                userName={data?.created_by_detail?.name}
                descriptionLabel="Comment"
                description={data?.text}
                content={
                    generateString(
                        '{createdByName} replied to a comment in the {entryLink} you were following in the project {projectTitle}.',
                        {
                            createdByName: (<b>{data?.created_by_detail?.name}</b>),
                            entryLink: (
                                <Link
                                    className={styles.link}
                                    to={editEntryLink}
                                    onClick={closeNotification}
                                >
                                    entry
                                </Link>
                            ),
                            projectTitle: (<b>{project?.title}</b>),
                        },
                    )
                }
            />
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_REPLY_MODIFY') {
        const {
            data,
            project,
        } = notification;

        const editEntryLink = {
            pathname: (generatePath(routes.entryEdit.path, {
                projectId: project?.id,
                leadId: data?.lead,
            })),
            state: {
                entryId: data?.entry,
            },
            hash: '#/primary-tagging',
        };

        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                userName={data?.created_by_detail?.name}
                descriptionLabel="Comment"
                description={data?.text}
                content={
                    generateString(
                        '{createdByName} modified the reply to a comment in the {entryLink} you were following in the project {projectTitle}.',
                        {
                            createdByName: (<b>{data?.created_by_detail?.name}</b>),
                            entryLink: (
                                <Link
                                    className={styles.link}
                                    onClick={closeNotification}
                                    to={editEntryLink}
                                >
                                    entry
                                </Link>
                            ),
                            projectTitle: (<b>{project?.title}</b>),
                        },
                    )
                }
            />
        );
    }
    if (notification.notificationType === 'ENTRY_COMMENT_RESOLVED') {
        const {
            data,
            project,
        } = notification;

        const editEntryLink = {
            pathname: (generatePath(routes.entryEdit.path, {
                projectId: project?.id,
                leadId: data?.lead,
            })),
            state: {
                entryId: data?.entry,
            },
            hash: '#/primary-tagging',
        };

        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                userName={data?.created_by_detail?.name}
                descriptionLabel="Comment"
                description={data?.text}
                content={
                    generateString(
                        '{createdByName} resolved the comment in the {entryLink} you were following in the project {projectTitle}.',
                        {
                            createdByName: (<b>{data?.created_by_detail?.name}</b>),
                            entryLink: (
                                <Link
                                    className={styles.link}
                                    to={editEntryLink}
                                    onClick={closeNotification}
                                >
                                    entry
                                </Link>
                            ),
                            projectTitle: (<b>{project?.title}</b>),
                        },
                    )
                }
            />
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
            hash: '#/primary-tagging',
        };
        const content = generateString(
            getCommentTokenString(data),
            {
                createdByName: (<b>{data?.created_by_details?.name}</b>),
                entryLink: (
                    <Link
                        className={styles.link}
                        to={editEntryLink}
                        onClick={closeNotification}
                    >
                        entry
                    </Link>
                ),
                projectTitle: (<b>{data?.project_details?.title}</b>),
            },
        );
        return (
            <NotificationContainer
                className={_cs(className, styles.notificationItem)}
                notification={notification}
                userName={data?.created_by_details?.name}
                descriptionLabel="Comment"
                description={data?.text}
                content={content}
            />
        );
    }

    if (notification.notificationType === 'ENTRY_REVIEW_COMMENT_MODIFY') {
        const { data } = notification;

        const editEntryLink = {
            pathname: (generatePath(routes.entryEdit.path, {
                projectId: data?.project_details?.id,
                leadId: data?.lead,
            })),
            state: {
                entryId: data?.entry,
            },
            hash: '#/primary-tagging',
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
                        '{createdByName} modified a comment you were following in the {entryLink} in the project {projectTitle}.',
                        {
                            createdByName: (<b>{data?.created_by_details?.name}</b>),
                            entryLink: (
                                <Link
                                    className={styles.link}
                                    onClick={closeNotification}
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

    return (
        <Message
            className={_cs(className, styles.notificationItem)}
            message="Sorry, we could not render this notification. So, use this notification as a reminder to stretch!  "
        />
    );
}

export default NotificationItem;
