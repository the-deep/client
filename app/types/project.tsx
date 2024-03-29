import { ProjectRoleTypeEnum } from '#generated/types';

import { BasicElement } from '.';
import { OrganizationDetails } from './organization';

interface VisaulizationEnabledOptions {
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

type OrganizationTypes = 'lead_organization' | 'international_partner' | 'national_partner' | 'donor' | 'government';

interface ProjectOrganization {
    id: number;
    organization: number;
    organizationDetails: OrganizationDetails;
    organizationType: OrganizationTypes;
    organizationTypeDisplay: string;
}

interface ProjectSummaryItem {
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
    type: string;
}

interface AdminLevel {
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
    isPublished: boolean;
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

interface GeoShapeFile {
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

// FIXME: This is a hack for now. Need to fetch this from server later when
// work on server is completed
export const roleLevels: { [key in ProjectRoleTypeEnum]: number } = {
    PROJECT_OWNER: 100,
    ADMIN: 90,
    MEMBER: 80,
    READER: 70,
    READER_NON_CONFIDENTIAL: 60,
    UNKNOWN: 0,
};
