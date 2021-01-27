import { BasicElement } from './';
import { OrganizationDetails } from './organization';

export interface ProjectElement {
    id: number;
    title: string;
    isPrivate: boolean;
}

export interface VisaulizationEnabledOptions {
    entry: boolean;
    assessment: boolean;
}

export interface Membership {
    id: number;
    member: number;
    memberEmail: string;
    memberName: string;
    addedByName: string;
    addedBy: number;
    memberOrganization?: string;
    memberStatus: 'admin' | 'member';
    project: number;
    role: number;
    joinedAt: string;
    userGroupOptions: BasicElement[];
}

export interface ProjectDetails {
    analysisFramework?: number;
    analysisFrameworkTitle?: string;
    assessmentTemplate?: number;
    assessmentTemplateTitle?: string;

    id: number;
    createdAt: string;
    createdBy: number;
    createdByName: string;
    modifiedAt: string;
    modifiedBy: number;
    modifiedByName: string;
    startDate?: string;
    endDate?: string;
    isDefault?: boolean;
    isPrivate: boolean;
    description?: string;
    title: string;
    isVisualizationEnabled: VisaulizationEnabledOptions;
    versionId: number;

    memberStatus: 'admin' | 'member';
    role: number;
    status: number;
    statusTitle: string;

    memberships: Membership[];
    userGroups: BasicElement[];
}
export interface CountTimeSeries {
    date: string;
    count: number;
}

export interface UserActivityStat {
    id: number;
    userId: number;
    name: string;
    count: number;
    date?: string;
}

export interface ProjectOrganization {
    id: number;
    organization: number;
    organizationDetails: OrganizationDetails;
    organizationType: 'lead_organization' | 'international_partners' | 'national_partners' | 'donors' | 'government';
    organizationTypeDisplay: string;
}

export interface ProjectStats {
    createdAt: string;
    createdBy: string;
    createdById: number;
    entriesActivity: CountTimeSeries[];
    leadsActivity: CountTimeSeries[];
    numberOfEntries: number;
    numberOfLeads: number;
    numberOfUsers: number;
    status: string;
    isPrivate: boolean;
    topSourcers: UserActivityStat[];
    topTaggers: UserActivityStat[];
}

