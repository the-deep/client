import {
    UserNotificationsQuery,
} from '#generated/types';

export type NotificationFromServer = NonNullable<NonNullable<NonNullable<UserNotificationsQuery>['notifications']>['results']>[number];

export type BaseNotification = Omit<NotificationFromServer, 'data' | 'notificationType'>;

export interface ReviewEntryCommentAdd {
    notificationType: 'ENTRY_REVIEW_COMMENT_ADD';
    data: {

        comment_type: number;

        created_at: string;
        entry: number;
        lead: number;
        id: number;
        text: string;

        created_by_details: {
            id: number;
            name: string;
        };

        project_details: {
            id: number;
            title: string;
        };
    };
}

interface ReviewEntryCommentModify {
    notificationType: 'ENTRY_REVIEW_COMMENT_MODIFY';
    data: {

        comment_type: number;

        created_at: string;
        entry: number;
        lead: number;
        id: number;
        text: string;

        created_by_details: {
            id: number;
            name: string;
        };

        project_details: {
            id: number;
            title: string;
        };
    };
}

export interface ProjectJoinRequest {
    notificationType: 'PROJECT_JOIN_REQUEST';
    data: {

        requested_at: string;
        id: number;

        requested_by: {
            id: number;

            display_name: string;
        };
        reason: string;
        project: {
            id: number;
            title: string;
        };
        status: 'accepted' | 'pending' | 'rejected';
    };
}

interface ProjectJoinResponse {
    notificationType: 'PROJECT_JOIN_RESPONSE';
    data: {
        id: number;
        status: 'rejected' | 'accepted';

        requested_by: {
            id: number;

            display_name: string;
        };

        responded_by: {
            id: number;

            display_name: string;
        };
        reason: string;
        project: {
            id: number;
            title: string;
        };
    };
}

interface ProjectJoinRequestAbort {
    notificationType: 'PROJECT_JOIN_REQUEST_ABORT';
    data: {
        id: number;

        requested_by: {
            id: number;

            display_name: string;
        };
        reason: string;
        project: {
            id: number;
            title: string;
        };
    };
}

// NOTE: No new entry comment notifications will be generated from the server
interface EntryCommentGeneral {
    notificationType: 'ENTRY_COMMENT_ADD'
    | 'ENTRY_COMMENT_MODIFY'
    | 'ENTRY_COMMENT_ASSIGNEE_CHANGE'
    | 'ENTRY_COMMENT_REPLY_ADD'
    | 'ENTRY_COMMENT_REPLY_MODIFY'
    | 'ENTRY_COMMENT_RESOLVED';

    data: {
        id: number;

        created_by_detail: {
            id: number;
            name: string;
        };
        entry: number;
        lead: number;
        text: string;
    };
}

export type Notification = BaseNotification & (
    ReviewEntryCommentAdd
    | ReviewEntryCommentModify
    | ProjectJoinRequest
    | ProjectJoinResponse
    | ProjectJoinRequestAbort
    | EntryCommentGeneral
);
