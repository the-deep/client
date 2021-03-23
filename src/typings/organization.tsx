import { BasicElement } from './';

export interface OrganizationDetails {
    id: number;
    shortName?: string;
    title: string;
    logo?: string;
    mergedAs: BasicElement;
}
