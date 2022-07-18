interface AccessibleFeature {
    key: string;
    title: string;
    featureType: 'general_access' | 'experimental' | 'early_access';
}

interface ProjectElement {
    id: number;
    title: string;
    isPrivate: boolean;
}

export interface User {
    userId: number;
    username: string;
    isSuperuser: boolean;
    exp: number;
    email: string;
    displayPicture?: number;
    displayName: string;
    accessibleFeatures: AccessibleFeature[];
}

export interface UserMini {
    id: number;
    email: string;
    displayName: string;
}

export interface Assignment {
    id: number;
    createdAt: string;
    projectDetails: ProjectElement;
    createdByDetails: {
        id: number;
        displayName: string;
        email: string;
    };
    contentObjectDetails: {
        id: number;
        title: string;
        lead?: string;
        entry?: string;
    };
    isDone: boolean;
    contentObjectType: 'lead' | 'entryreviewcomment' | 'entrycomment';
}
