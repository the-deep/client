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

export interface EntryFields extends DatabaseEntityBase {
    attributes: {
        [key: string]: AttributeFields;
    };
    analysisFramework: number;
    entryType: EntryType;
    project: number;
    projectLabels: string[];
    order: string;
    resolvedCommentCount: number;
    unresolvedCommentCount: number;
    excerpt?: string;
    droppedExcerpt?: string;
    clientId: string;
    highlightHidden: boolean;
    image?: string;
    tabularField: number;
    tabularFieldData: TabularDataFields;
    lead: Pick<Lead, EntryLeadType>;
    projectLabel: ProjectLabelFields[];
    verified: boolean;
    verificationLastChangedByDetails: UserFields;
    approvedBy: UserFields['id'][];
    approvedByCount: number;
    isApprovedByCurrentUser: boolean;
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
    createdBy: KeyValueElement;
    projectEntryLabel: BasicElement[];
}

interface UserDetail {
    id: number;
    name: string;
    email: string;
    organization: string;
}

export interface EntryComment {
    id: number;
    textHistory: {
        createdAt: string;
        text: string;
    }[];
    lead: number;
    createdByDetails: UserDetail & { displayPicture: string };
    mentionedUsersDetails: UserDetail[];
    commentTypeDisplay: string;
    commentType: number;
    createdBy: number;
    createdAt: string;
    entry: number;
    mentionedUsers: number[];
}

export interface EntryReviewSummary {
    approvedBy: UserDetail[];
    verified: boolean;
    verificationLastChangedBy: UserDetail & { displayPicture: string };
}
