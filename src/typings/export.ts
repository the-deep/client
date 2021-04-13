import { DatabaseEntityBase } from './common';

export type ExportType = 'word' | 'pdf' | 'excel' | 'json';

export type ExportStatus = 'pending' | 'started' | 'success' | 'failure';
export interface Export extends DatabaseEntityBase {
    status: ExportStatus;
    mimeType: string;
    file: string;
    exportedAt: string;
    pending: boolean;
    title: string;
    type: string;
}

