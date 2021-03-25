import { EntryReviewType } from '#typings';

export type NotificationStatus = 'seen' | 'unseen';
export type NotificationType = 'project_join_request'
    | 'project_join_response'
    | 'project_join_request_abort'
    | 'entry_review_comment_add'
    | 'entry_review_comment_modify'

export interface NotificationFields {
    id: number;
    project: number;
    receiver: number;
    status: NotificationStatus;
    timestamp: string;
    data: {
        id: number;
        commentType: EntryReviewType;
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
}
