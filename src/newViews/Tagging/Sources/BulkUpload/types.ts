export interface FileUploadResponse {
    id: number;
    title: string;
    file: string; // this is a url
    mimeType?: string;
    metadata?: unknown;
}

export interface FileLike {
    key: string;
    id: string;
    name: string;
    isUploaded: boolean;
    response?: FileUploadResponse;
    file?: File;
}

export interface FileType extends FileLike {
    file: File;
}

export type GoogleFile = Omit<FileLike, 'file'> & {
    mimeType: string;
}

export type DropboxFile = Omit<FileLike, 'file'> & {
    link: string;
}
