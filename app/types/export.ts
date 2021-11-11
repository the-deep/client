export type ExportType = 'WORD' | 'PDF' | 'EXCEL' | 'JSON';
export type ExportStatus = 'pending' | 'started' | 'success' | 'failure';
export interface Export {
    id: number;
    title: string;
    isPreview: boolean;
    format: string;
    type: 'entries' | 'assessments' | 'planned_assessments';
    exportType: 'excel' | 'report' | 'json';
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
