export interface AnalyticalFramework {
    title: string;
    createdBy: number;
    createdByName: string;
    createdAt: string;
    organization: number;
    description: string;
    isPrivate: boolean;
    previewImage?: string;
    organizationDetails: {
        id: number;
        title: string;
        shortName: string;
    }
}
