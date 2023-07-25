import { MimeTypes } from '#components/lead/LeadPreview/Preview/mimeTypes';
import { AssessmentRegistryDocumentTypeEnum } from '#generated/types';

export interface FileUploadResponse {
    id: string;
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
    metadata: unknown;
    documentType: AssessmentRegistryDocumentTypeEnum;
    externalLink?: string;
}

export type FileLike = {
    clientId: string;
    key?: string;
    id?: string;
    documentType: AssessmentRegistryDocumentTypeEnum;
    file?: File | null;
    externalLink?: string;
}
