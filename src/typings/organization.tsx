import { BasicElement } from './';

export interface BasicOrganization {
    id: number;
    title: string;
}

export interface Organization extends BasicOrganization {
    id: number;
    createdAt: string;
    modifiedAt: string;
    regionsDisplay: BasicElement[];
    title: string;
    shortName: string;
    longName: string;
    url: string;
    verified: boolean;
    regions: number[];
}

export interface OrganizationDetails {
    id: number;
    shortName?: string;
    title: string;
    logo?: string;
    mergedAs: BasicElement;
}
