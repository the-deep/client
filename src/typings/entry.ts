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

interface BaseEntryFields extends DatabaseEntityBase {
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
}

export type EntryFields = BaseEntryFields & ({
    entryType: 'excerpt';
    excerpt?: string;
    droppedExcerpt?: string;
    imageDetails?: never;
    tabularFieldData?: never;
    tabularField?: never;
    image?: never;
    imageRaw?: never;
} | {
    entryType: 'image';
    excerpt?: string;
    droppedExcerpt?: never;
    imageDetails?: ImageDetails;
    image?: string;
    imageRaw?: string;
    tabularFieldData?: never;
    tabularField?: never;
} | {
    entryType: 'dataSeries';
    tabularFieldData?: TabularDataFields;
    tabularField?: number;
    excerpt?: never;
    droppedExcerpt?: never;
    imageDetails?: never;
    image?: never;
    imageRaw?: never;
});

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
