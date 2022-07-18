export type EntryType = 'excerpt' | 'image' | 'dataSeries';

export interface TabularDataFields {
    cache: {
        healthStatus: {
            empty: number;
            total: number;
            invalid: number;
        };
        imageStatus: string;
        images: {
            id: number;
            format: string;
            chartType: string;
        }[];
        status: string;
        series: {
            value: string | number;
            count: number;
        };
    };
}

export interface EntryReviewComment {
    id: number;
    textHistory: string[];
    lead: number;
    createdByDetails: {
        id: number;
        name: string;
        email: string;
        organization: string;
        displayPictureUrl: string;
    };
    mentionedUsersDetails: {
        id: number;
        name: string;
        email: string;
        organization: string;
        displayPictureUrl: string;
    }[];
    commentTypeDisplay: string;
    createdAt: string;
    commentType: number;
    createdBy: number;
    entry: string;
    mentionedUsers: number[];
}
