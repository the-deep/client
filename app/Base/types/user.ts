import {
    FeatureKey,
} from '#generated/types';

export interface User {
    id: string;
    displayName?: string;
    email?: string | undefined;
    displayPictureUrl?: string;
    accessibleFeatures?: {
        key: FeatureKey;
    }[];
}

export interface ProjectUser {
    id: string;
    displayName?: string;
    emailDisplay: string;
    displayPictureUrl?: string;
    accessibleFeatures?: {
        key: FeatureKey;
    }[];
}
