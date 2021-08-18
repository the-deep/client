export type ExportType = 'word' | 'pdf' | 'excel' | 'json';

export type ExportStatus = 'pending' | 'started' | 'success' | 'failure';
export interface Export {
    id: number;
    title: string;
    isPreview: boolean;
    format: string;
    type: string;
    exportType: ExportType;
    mimeType: string;
    file?: string;
    exportedAt: string;
    pending: boolean;
    status: ExportStatus;
    isDeleted: boolean;
    isArchived: boolean;
    project: number;
    exportedBy: number;
}

