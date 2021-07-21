export interface FileUploadResponse {
    id: number;
    title: string;
    file: string; // this is a url
    mimeType?: string;
    metadata?: unknown;
}

export type FileLike = {
    key: string;
    id: string;
    name: string;
} & ({
    fileType: 'file';
    file: File;
} | {
    fileType: 'google';
    mimeType: string;
    accessToken: string;
} | {
    fileType: 'dropbox';
    link: string;
})
