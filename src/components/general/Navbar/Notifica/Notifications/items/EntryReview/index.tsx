import React from 'react';
import { reverseRoute } from '@togglecorp/fujs';

import DisplayPicture from '#components/viewer/DisplayPicture';
import { pathNames } from '#constants';
import _ts from '#ts';

import Notification from '../Notification';
import LinkItem from '../LinkItem';

type NotificationStatus = 'seen' | 'unseen';

const REVIEW_TYPE_COMMENT = 0;
const REVIEW_TYPE_APPROVE = 1;
const REVIEW_TYPE_UNAPPROVE = 2;
const REVIEW_TYPE_VERIFY = 3;
const REVIEW_TYPE_UNVERIFY = 4;

type ReviewType = 0 | 1 | 2 | 3 | 4;

interface EntryReviewProps {
    notificationType: string;
    notification: {
        id: number;
        project: number;
        receiver: 5;
        status: NotificationStatus;
        timestamp: string;
        data: {
            id: number;
            commentType: ReviewType;
            lead: number;
            entry: number;
            text: string;
            createdByDetails: {
                id: number;
                name: string;
                email: string;
            };
            projectDetails: {
                id: number;
                title: string;
            };
        };
    };
    className?: string;
    onNotificationSeenStatusChange: (id: number, newStatus: NotificationStatus) => void;
    closeModal: () => void;
}

function EntryReview(props: EntryReviewProps) {
    const {
        notificationType,
        notification,
        onNotificationSeenStatusChange,
        closeModal,
    } = props;

    const {
        id,
        project,
        data: {
            text: commentText,
            lead,
            entry,
            projectDetails: {
                title: projectName,
            },
            createdByDetails: {
                name: assigner,
            },
        },
    } = notification;

    const [
        entriesPageLink,
        entriesPageLinkWithReview,
    ] = React.useMemo(() => ([
        reverseRoute(
            pathNames.entryEditRedirect, {
                projectId: project,
                leadId: lead,
                entryId: entry,
            },
        ),
        reverseRoute(
            pathNames.entryCommentRedirect, {
                projectId: project,
                leadId: lead,
                entryId: entry,
            },
        ),
    ]), [project, lead, entry]);


    const projectPageLink = React.useMemo(() => (reverseRoute(
        pathNames.projects, {
            projectId: project,
        },
    )), [project]);

    const [
        entryLinkItem,
        entryLinkItemWithReview,
        commentLinkItem,
        projectLinkItem,
    ] = React.useMemo(() => ([
        <LinkItem
            link={entriesPageLink}
            title={_ts('notifications.entryReviewComment', 'entryLabel')}
            closeModal={closeModal}
        />,
        <LinkItem
            link={entriesPageLinkWithReview}
            title={_ts('notifications.entryReviewComment', 'entryLabel')}
            closeModal={closeModal}
        />,
        <LinkItem
            link={entriesPageLink}
            title={_ts('notifications.entryReviewComment', 'commentLabel')}
            closeModal={closeModal}
        />,
        <LinkItem
            link={projectPageLink}
            title={projectName}
            closeModal={closeModal}
        />,
    ]), [entriesPageLink, entriesPageLinkWithReview, projectPageLink, projectName, closeModal]);

    const handleNotificationSeenStatusChange = React.useCallback(() => {
        if (onNotificationSeenStatusChange) {
            onNotificationSeenStatusChange(
                notification.id,
                (notification.status === 'seen' ? 'unseen' : 'seen'),
            );
        }
    }, [notification.id, notification.status, onNotificationSeenStatusChange]);


    if (notificationType !== 'entry_review_comment_add'
            && notificationType !== 'entry_review_comment_modify') {
        return null;
    }


    let message: React.ReactNode = null;
    if (notificationType === 'entry_review_comment_add') {
        switch (notification.data.commentType) {
            case REVIEW_TYPE_COMMENT:
                message = _ts('notifications.entryReviewComment', 'commentAdd', {
                    assigner,
                    comment: commentLinkItem,
                });
                break;
            case REVIEW_TYPE_APPROVE:
                message = _ts('notifications.entryReviewComment', 'approve', {
                    assigner,
                    entry: commentText ? entryLinkItemWithReview : entryLinkItem,
                    projectName: projectLinkItem,
                });
                break;
            case REVIEW_TYPE_UNAPPROVE:
                message = 'bla bla';
                message = _ts('notifications.entryReviewComment', 'unapprove', {
                    assigner,
                    entry: entryLinkItemWithReview,
                    projectName: projectLinkItem,
                });
                break;
            case REVIEW_TYPE_VERIFY:
                message = _ts('notifications.entryReviewComment', 'verify', {
                    assigner,
                    entry: commentText ? entryLinkItemWithReview : entryLinkItem,
                    projectName: projectLinkItem,
                });
                break;
            case REVIEW_TYPE_UNVERIFY:
                message = _ts('notifications.entryReviewComment', 'unverify', {
                    assigner,
                    entry: entryLinkItemWithReview,
                    projectName: projectLinkItem,
                });
                break;

            default:
                message = _ts('notifications.entryReviewComment', 'commentAdd', {
                    assigner,
                    comment: commentLinkItem,
                });
                break;
        }
    } else if (notificationType === 'entry_review_comment_modify') {
        message = _ts('notifications.entryReviewComment', 'commentUpdate', {
            comment: commentLinkItem,
        });
    }

    return (
        <Notification
            notificationId={id}
            message={message}
            icon={(
                <DisplayPicture />
            )}
            timestamp={notification.timestamp}
            description={notification.data.text}
            descriptionLabel={_ts('entryComments.notifications', 'expandButtonLabel')}
            onNotificationSeenStatusChange={handleNotificationSeenStatusChange}
        />
    );
}

export default EntryReview;
