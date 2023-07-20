import { MimeTypes } from '#components/lead/LeadPreview/Preview/mimeTypes';
import {
    AssessmentRegistryDocumentTypeEnum,
    LeadSourceTypeEnum,
} from '#generated/types';

export type SourceFileType = 'disk' | 'dropbox';

export const sourceTypeMap: { [key in SourceFileType]: LeadSourceTypeEnum } = {
    disk: 'DISK',
    dropbox: 'DROPBOX',
};

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
    isPublic: boolean;
    projects: number[];
    metadata: unknown;
    sourceType: SourceFileType;
    documentType: AssessmentRegistryDocumentTypeEnum;
    externalLink?: string;
}

export type FileLike = {
    clientId: string;
    key: string;
    id: string;
    name: string;
    documentType: AssessmentRegistryDocumentTypeEnum;
    fileType: SourceFileType;
} & ({
    fileType: 'disk';
    file: File;
} | {
    fileType: 'dropbox',
    link: string;
})