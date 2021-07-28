export interface User {
    permissions: unknown[],

    id: string;
    lastActiveProject?: string;
    displayName?: string;
    displayPictureUrl?: string;
}
