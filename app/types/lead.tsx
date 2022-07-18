import { DatabaseEntityBase } from './common';

type Confidentiality = 'confidential' | 'unprotected';
type LeadStatus = 'pending' | 'processed' | 'validated';
type LeadSourceType = 'Text' | 'Disk' | 'Website' |
    'Dropbox' | 'Google Drive' | 'RSS Feed' | 'EMM' | 'Web API' | 'Unknown';

interface UserDetails {
    id: number;
    email: string;
    displayName: string;
    displayPicture?: number;
}

interface OrganizationDetail {
    id: number;
    title: string;
}

interface Lead extends DatabaseEntityBase {
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
