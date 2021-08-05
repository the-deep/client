import { MimeTypes } from '#components/LeadPreview/Preview/mimeTypes';

export type SourceFileType = 'disk' | 'google-drive' | 'dropbox';

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
    mimeType: MimeTypes;
    isPublic: boolean;
    projects: number[];
    metadata: unknown;
    sourceType: SourceFileType;
}

export type FileLike = {
    key: string;
    id: string;
    name: string;
    fileType: SourceFileType;
} & ({
    fileType: 'disk';
    file: File;
} | {
    fileType: 'google-drive';
    mimeType: MimeTypes;
    accessToken: string;
} | {
    fileType: 'dropbox';
    link: string;
})
