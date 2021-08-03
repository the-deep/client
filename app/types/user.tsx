import { ProjectElement } from './project';

export interface AccessibleFeature {
    key: string;
    title: string;
    featureType: 'general_access' | 'experimental' | 'early_access';
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

export interface LanguagePreference {
    code: string;
    title: string;
}

export interface BasicUser {
    id: number;
    displayName: string;
}

export interface UserMini {
    id: number;
    email: string;
    displayName: string;
}

export interface RecentActivityItem {
    createdAt: string;
    createdBy: number;
    createdByDisplayName: string;
    createdByDisplayPicture?: string;
    id: number;
    project: number;
    projectDisplayName: string;
    type: string;
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
    };
    isDone: boolean;
    contentObjectType: {
        id: number;
        title: string;
    };
}
