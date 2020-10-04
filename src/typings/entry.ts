import { DatabaseEntityBase } from './common';

type EntryType = 'excerpt' | 'image';

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
        value: {
            [index: string]: unknown;
        };
    };
}

export interface OrganizationFields {
    id: number;
    title: string;
}

export interface UserFields {
    id: number;
    displayName: string;
    emain: string;
}

export interface EntryFields extends DatabaseEntityBase {
    attributes: AttributeFields[];
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
    lead: number;
    projectLabel: ProjectLabelFields[];
}

export interface LeadWithGroupedEntriesFields {
    assigneeDetails: UserFields;
    authorsDetails: OrganizationFields[];
    createdByDetails: UserFields;
    sourceDetails: OrganizationFields;
    title: string;
    pageCount: number;
    confidentialityDisplay: string;
    confidentiality: 'confidential' | 'unprotected';
    publishedOn: string;
    entries: EntryFields[];
}
