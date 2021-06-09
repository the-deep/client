import { BasicElement } from './';

export interface BasicOrganization {
    id: number;
    title: string;
    logoUrl?: string;
}

export interface OrganizationType {
    id: number;
    title: string;
    shortName: string;
    description: string;
    reliefWebId: string;
}
export interface Organization extends BasicOrganization {
    createdAt: string;
    modifiedAt: string;
    regionsDisplay: BasicElement[];
    shortName: string;
    longName: string;
    url: string;
    verified: boolean;
    regions: number[];
    logo?: number;
    organizationType?: number;
    organizationTypeDisplay: OrganizationType;
}

export interface OrganizationDetails {
    id: number;
    shortName?: string;
    title: string;
    logo?: string;
    mergedAs?: BasicElement;
}
