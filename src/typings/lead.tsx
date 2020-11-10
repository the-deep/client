import { DatabaseEntityBase } from './common';

export type Confidentiality = 'confidential' | 'unprotected';
export type LeadStatus = 'pending' | 'processed';
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

    noOfEntries: number;
    pageCount: number;
    wordCount?: number;
    confidentialityDisplay?: string;
}
