import { prepareUrlParams } from '@togglecorp/toggle-request';

export const createUrlForGoogleViewer = (url: string) => (
    `https://drive.google.com/viewerng/viewer?${prepareUrlParams({
        url,
        pid: 'explorer',
        efh: false,
        a: 'v',
        chrome: false,
        embedded: true,
    })}`
);

export type HTMLMimeTypes = 'text/html';
export type ImageMimeTypes = 'image/png' | 'image/jpeg' | 'image/fig' | 'image/gif';
export type DocsMimeType =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    | 'application/rtf'
    | 'text/plain'
    | 'font/otf'
    | 'application/pdf'
    | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    | 'application/vnd.ms-powerpoint'
    | 'application/vnd.ms-excel'
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'text/csv'
    | 'application/json'
    | 'application/xml'
    | 'application/msword'
    | 'application/wps-office.docx';

export type MimeTypes = string;

export const imageMimeTypes: string[] = ['image/png', 'image/jpeg', 'image/fig', 'image/gif'];

export const docsMimeTypes: string[] = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf', 'text/plain', 'font/otf', 'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'application/json', 'application/xml', 'application/msword',
    'application/wps-office.docx',
];

export function isImageMimeType(mimeType: string) {
    return imageMimeTypes.some((d) => d === mimeType);
}

export function isDocMimeType(mimeType: string) {
    return docsMimeTypes.some((d) => d === mimeType);
}

export function isHTMLMimeType(mimeType: string) {
    return mimeType === 'text/html';
}
