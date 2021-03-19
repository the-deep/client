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

export interface UserMini {
    id: number;
    email: string;
    displayName: string;
}
