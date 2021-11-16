import {
    UserNotificationsQuery,
} from '#generated/types';

export type NotificationFromServer = NonNullable<NonNullable<NonNullable<UserNotificationsQuery>['notifications']>['results']>[number];

type BaseNotification = Omit<NotificationFromServer, 'data' | 'notificationType'>;

interface EntryCommentAdd {
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

interface ProjectJoinRequest {
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
    };
}

interface Others {
    notificationType: 'PROJECT_JOIN_REQUEST_ABORT'
    | 'PROJECT_JOIN_RESPONSE'
    | 'ENTRY_COMMENT_ADD'
    | 'ENTRY_COMMENT_MODIFY'
    | 'ENTRY_COMMENT_ASSIGNEE_CHANGE'
    | 'ENTRY_COMMENT_REPLY_ADD'
    | 'ENTRY_COMMENT_REPLY_MODIFY'
    | 'ENTRY_COMMENT_RESOLVED'
    | 'ENTRY_REVIEW_COMMENT_MODIFY';
    data: {
    };
}

export type Notification = BaseNotification & (
    EntryCommentAdd
    | ProjectJoinRequest
    | Others
);
