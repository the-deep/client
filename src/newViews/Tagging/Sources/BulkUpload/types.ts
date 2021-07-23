export interface FileUploadResponse {
    id: number;
    createdAt: string;
    modifiedAt: string;
    createdBy: number;
    modifiedBy: number;
    createdByName: string;
    modifiedByName: string;
    versionId: number;
    file: string;
    uuid: string;
    title: string;
    mimeType: string;
    isPublic: boolean;
    projects: number[];
    metadata: unknown;
}

export type FileLike = {
    key: string;
    id: string;
    name: string;
    fileType: 'disk' | 'google-drive' | 'dropbox';
} & ({
    fileType: 'disk';
    file: File;
} | {
    fileType: 'google-drive';
    mimeType: string;
    accessToken: string;
} | {
    fileType: 'dropbox';
    link: string;
})
