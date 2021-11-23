import {
    UserNotificationsQuery,
} from '#generated/types';

export type NotificationFromServer = NonNullable<NonNullable<NonNullable<UserNotificationsQuery>['notifications']>['results']>[number];

export type BaseNotification = Omit<NotificationFromServer, 'data' | 'notificationType'>;

interface ReviewEntryCommentAdd {
    notificationType: 'ENTRY_REVIEW_COMMENT_ADD';
    data: {
        // eslint-disable-next-line camelcase
        comment_type: number;
        // eslint-disable-next-line camelcase
        created_at: string;
        entry: number;
        lead: number;
        id: number;
        text: string;
        // eslint-disable-next-line camelcase
        created_by_details: {
            id: number;
            name: string;
        };
        // eslint-disable-next-line camelcase
        project_details: {
            id: number;
            title: string;
        };
    };
}

interface ReviewEntryCommentModify {
    notificationType: 'ENTRY_REVIEW_COMMENT_MODIFY';
    data: {
        // eslint-disable-next-line camelcase
        comment_type: number;
        // eslint-disable-next-line camelcase
        created_at: string;
        entry: number;
        lead: number;
        id: number;
        text: string;
        // eslint-disable-next-line camelcase
        created_by_details: {
            id: number;
            name: string;
        };
        // eslint-disable-next-line camelcase
        project_details: {
            id: number;
            title: string;
        };
    };
}

export interface ProjectJoinRequest {
    notificationType: 'PROJECT_JOIN_REQUEST';
    data: {
        // eslint-disable-next-line camelcase
        requested_at: string;
        id: number;
        // eslint-disable-next-line camelcase
        requested_by: {
            id: number;
            // eslint-disable-next-line camelcase
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
        // eslint-disable-next-line camelcase
        requested_by: {
            id: number;
            // eslint-disable-next-line camelcase
            display_name: string;
        };
        // eslint-disable-next-line camelcase
        responded_by: {
            id: number;
            // eslint-disable-next-line camelcase
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
        // eslint-disable-next-line camelcase
        requested_by: {
            id: number;
            // eslint-disable-next-line camelcase
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
        // eslint-disable-next-line camelcase
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
