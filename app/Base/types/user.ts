import { FeatureKey } from '#generated/types';

export interface User {
    id: string;
    displayName?: string;
    displayPictureUrl?: string;
    accessibleFeatures?: {
        key: FeatureKey;
    }[];
}
