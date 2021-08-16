import {
    KeyValueElement,
    DatabaseEntityBase,
} from './common';

export type Confidentiality = 'confidential' | 'unprotected';
export type LeadStatus = 'pending' | 'processed' | 'validated';
export type LeadSourceType = 'Text' | 'Disk' | 'Website' |
    'Dropbox' | 'Google Drive' | 'RSS Feed' | 'EMM' | 'Web API' | 'Unknown';

export interface UserDetails {
    id: number;
    email: string;
    displayName: string;
    displayPicture?: number;
}

export interface OrganizationDetail {
    id: number;
    title: string;
}

export interface Lead extends DatabaseEntityBase {
    title: string;
    assessmentId?: number;
    assignee?: number | number[];
    assigneeDetails: UserDetails;
    confidentiality: Confidentiality;
    priority: number;
    priorityDisplay: string;
    project: number;
    publishedOn: string;
    status: LeadStatus;
    sourceType: LeadSourceType;

    source: number;
    sourceRaw?: string;
    sourceDetail: OrganizationDetail;
    authors?: [number];
    authorRaw?: string;
    authorsDetail: [OrganizationDetail];

    text?: string;
    url?: string;
    website?: string;

    thumbnail?: string;
    thumbnailWidth?: string;
    thumbnailHeight?: string;

    entriesCount: number;
    filteredEntriesCount?: number;
    pageCount: number;
    wordCount?: number;
    confidentialityDisplay?: string;
    isAssessmentLead?: boolean;

    attachment?: {
        id: number;
        title: string;
        file: string;
        mimeType: string;
    };
}

export interface EmmEntity {
    key: number;
    label: string;
    totalCount: number;
}

export interface LeadOptions {
    status: KeyValueElement[];
    project: KeyValueElement[];
    assignee: KeyValueElement[];
    leadGroup: KeyValueElement[];
    priority: KeyValueElement[];
    confidentiality: KeyValueElement[];
    organizationTypes: KeyValueElement[];
    hasEmmLeads: boolean;
    emmEntities?: EmmEntity[];
    emmRiskFactors?: EmmEntity[];
    emmKeywords?: EmmEntity[];
}

export interface LeadSummary {
    total: number;
    totalEntries: number;
    totalVerifiedEntries: number;
    totalUnverifiedEntries: number;
}

export interface LeadGroup {
    id: number;
    createdAt: string;
    modifiedAt: string;
    createdBy: number;
    modifiedBy: number;
    createdByName: string;
    modifiedByName: string;
    clientId?: string;
    versionId: number;
    leads?: Lead[];
    noOfLeads?: number;
    title: string;
    project?: number;
}
