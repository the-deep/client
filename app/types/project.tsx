import { BasicElement } from '.';
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
        level: number;
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
    regions: BasicRegion[];

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

export type OrganizationTypes = 'lead_organization' | 'international_partner' | 'national_partner' | 'donor' | 'government';

export interface ProjectOrganization {
    id: number;
    organization: number;
    organizationDetails: OrganizationDetails;
    organizationType: OrganizationTypes;
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
    numberOfLeadsTaggedAndVerified: number;
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
        level: number;
    };
}

interface Permission {
    view?: boolean;
    create?: boolean;
    modify?: boolean;
    delete?: boolean;
}

export interface ProjectRole {
    id: number;
    leadPermissions: Permission;
    entryPermissions: Permission;
    setupPermissions: Permission;
    exportPermissions: Permission;
    assessmentPermissions: Permission;
    title: string;
    description: string;
    level: number;
    isCreatorRole: boolean;
    isDefaultRole: boolean;
}

export interface ProjectMemberships {
    id: number;
    joinedAt: string;
    member: number;
    memberEmail: string;
    memberName: string;
    memberOrganization?: string;
    memberStatus: string;
    project: number;
    role: number;
    roleDetails: {
        id: number;
        title: string;
        level: number;
    };
    userGroupOptions: {
        id: number;
        title: string;
    }[];
}

export interface ProjectRolesMap {
    [key: number]: ProjectRole;
}

export interface AdminLevel {
    id: number;
    title: string;
    // clientId: string;
    level: number;
    nameProp?: string;
    codeProp?: string;
    parentNameProp?: string;
    parentCodeProp?: string;
}

export interface BasicRegion {
    id: number;
    title: string;
}

export interface Region extends BasicRegion {
    createdAt: string;
    modifiedAt: string;
    createdBy: number;
    modifiedBy: number;
    createdByName: string;
    modifiedByName: string;
    versionId: number;
    adminLevels: AdminLevel[];
    code: string;
    title: string;
    public: boolean;
    isPublished: boolean;
}

export interface GeoShapeFile {
    id: number;
    title: string;
    file: string;
    mimeType: string;
}
export interface AdminLevelGeoArea extends AdminLevel {
    geoShapeFileDetails?: GeoShapeFile;
    geojsonFile?: string;
    boundsFile?: string;
    tolerance: number;
    staleGeoAreas: boolean;
    region: number;
    geoShapeFile: number;
    parent?: number;
}

export interface GeoAreaBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
