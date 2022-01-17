import {
    BasicElement,
    KeyValueElement,
    DatabaseEntityBase,
} from './common';
import { Lead } from './lead';

export type EntryType = 'excerpt' | 'image' | 'dataSeries';

export type EntryLeadType = 'id' | 'title' | 'createdAt' | 'url' | 'assigneeDetails' | 'publishedOn' | 'pageCount' | 'confidentiality' | 'sourceRaw' | 'authorsDetail' | 'sourceDetail' | 'confidentialityDisplay' | 'assignee' | 'attachment';

export interface ProjectLabelFields {
    count: number;
    groups: string[];
    labelColor: string;
    labelId: number;
    labelTitle: string;
}

export interface AttributeFields {
    id: number;
    data?: {
        value?: {
            [index: string]: unknown;
        } | string;
    };
}

export interface OrganizationFields {
    id: number;
    title: string;
    shortName?: string;
}

export interface UserFields {
    id: number;
    displayName: string;
    email: string;
}

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

interface ImageDetails {
    id: number;
    file: string;
}

export interface EntryFields extends DatabaseEntityBase {
    attributes: {
        [key: string]: AttributeFields;
    };
    analysisFramework: number;
    project: number;
    projectLabels: string[];
    order: string;
    resolvedCommentCount: number;
    unresolvedCommentCount: number;
    clientId: string;
    highlightHidden: boolean;
    lead: Pick<Lead, EntryLeadType>;
    projectLabel: ProjectLabelFields[];
    verified: boolean;
    verificationLastChangedByDetails: UserFields;
    entryType: 'excerpt';
    excerpt?: string;
    droppedExcerpt?: string;
    imageDetails?: ImageDetails;
    tabularFieldData?: TabularDataFields;
    tabularField?: number;
    image?: number;
    imageRaw?: string;
}

export interface LeadWithGroupedEntriesFields {
    assigneeDetails: UserFields;
    authorsDetails: OrganizationFields[];
    createdByDetails: UserFields;
    sourceRaw?: string;
    sourceDetails?: OrganizationFields;
    title: string;
    pageCount: number;
    confidentialityDisplay: string;
    confidentiality: 'confidential' | 'unprotected';
    publishedOn: string;
    entries: EntryFields[];
}

export type Entry = Omit<EntryFields, 'lead'> & {
    lead: number;
}

export interface TocItemCount {
    labelKey: string;
    widgetKey: string;
    unverifiedCount: number;
    verifiedCount: number;
}

export interface EntrySummary {
    countPerTocItem?: TocItemCount[];
    totalLeads: number;
    totalSources: number;
    totalUnverifiedEntries: number;
    totalVerifiedEntries: number;
    orgTypeCount: {
        count: number;
        org: {
            id: number;
            title: string;
            shortName?: string;
        };
    }[];
}

export interface TocCountMap {
    [key: string]: {
        [key: string]: TocItemCount;
    };
}

export interface EntryOptions {
    createdBy: KeyValueElement[];
    projectEntryLabel: BasicElement[];
}

export interface EntryComment {
    id: number;
    textHistory: {
        createdAt: string;
        text: string;
    }[];
    lead: number;
    createdByDetails: {
        id: number;
        email: string;
        name: string;
        organization?: string;
        displayPictureUrl?: string;
    };
    mentionedUsersDetails: {
        id: number;
        email: string;
        name: string;
        organization?: string;
        displayPictureUrl?: string;
    }[];
    commentTypeDisplay: string;
    commentType: number;
    createdBy: number;
    createdAt: string;
    entry: number;
    mentionedUsers: number[];
}

export interface EntryReviewSummary {
    verifiedBy: {
        id: number;
        email: string;
        name: string;
        organization?: string;
        displayPictureUrl?: string;
    }[];
    controlled: boolean;
    controlledChangedByDetails: {
        id: number;
        email: string;
        name: string;
        organization?: string;
        displayPictureUrl?: string;
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
    entry: number;
    mentionedUsers: number[];
}
