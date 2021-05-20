
export interface AnalyticalFramework {
    title: string;
    createdBy: number;
    createdByName: string;
    createdAt: string;
    organization: number;
    description: string;
    isPrivate: boolean;
    organizationDetails: {
        id: number;
        title: string;
        shortName: string;
    }
}
