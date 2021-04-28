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
    roleDetails: {
        id: number;
        title: string;
    };
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
    regions: BasicElement[];

    memberStatus: 'admin' | 'member';
    role: number;
    status: string;
    statusDisplay: string;

    memberships: Membership[];
    userGroups: BasicElement[];
    organizations: ProjectOrganization[];
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

export interface ProjectStat {
    analysisFramework?: number;
    analysisFrameworkTitle?: string;
    assessmentTemplate?: number;
    assessmentTemplateTitle?: string;
    createdAt: string;
    createdBy: string;
    createdByName: string;
    description?: string;
    endDate?: string;
    entriesActivity: CountTimeSeries[];
    id: number;
    isDefault?: boolean;
    isPrivate: boolean;
    isVisualizationEnabled: VisaulizationEnabledOptions;
    leadsActivity: CountTimeSeries[];
    memberStatus: 'admin' | 'member';
    modifiedAt: string;
    modifiedBy: number;
    modifiedByName: string;
    numberOfEntries: number;
    numberOfLeads: number;
    numberOfLeadsTagged: number;
    numberOfLeadsTaggedAndControlled: number;
    numberOfUsers: number;
    role: number;
    startDate?: string;
    status: string;
    statusDisplay: string;
    title: string;
    topSourcers: UserActivityStat[];
    topTaggers: UserActivityStat[];
    userGroups: BasicElement[];
    versionId: number;
}

export interface ProjectSummaryItem {
    count: number;
    id: number;
    title: string;
}

interface ActivitySummaryItem {
    project: number;
    count: number;
    date: string;
}

export interface ProjectRecentActivity {
    projects: ProjectSummaryItem[];
    activities: ActivitySummaryItem[];
}

export interface ProjectsSummary {
    projectsCount: number;
    totalLeadsCount: number;
    totalLeadsTaggedCount: number;
    totalLeadsTaggedAndVerifiedCount: number;
    recentEntriesActivity: ProjectRecentActivity;
}

export interface UserGroup {
    id: number;
    title: string;
    joinedAt: string;
    project: number;
    usergroup: number;
    role: number;
    addedBy: number;
    addedByName: string;
    roleDetails: {
        id: number;
        title: string;
    };
}

type Permissions = 'view' | 'create' | 'modify' | 'delete'

export interface ProjectRole {
    id: number;
    leadPermissions: [Permissions];
    entryPermissions: [Permissions];
    setupPermissions: [Permissions];
    exportPermissions: [Permissions];
    assessmentPermissions: [Permissions];
    title: string;
    description: string;
    level: number;
    isCreatorRole: boolean;
    isDefaultRole: boolean;
    qualityController: boolean; //TODO: fix this later
}
