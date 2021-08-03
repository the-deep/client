import { prepareUrlParams } from '#utils/request/utils';

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

export type MimeTypes = HTMLMimeTypes | ImageMimeTypes | DocsMimeType;

export const imageMimeTypes: ImageMimeTypes[] = ['image/png', 'image/jpeg', 'image/fig', 'image/gif'];

export const docsMimeTypes: DocsMimeType[] = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf', 'text/plain', 'font/otf', 'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'application/json', 'application/xml', 'application/msword',
    'application/wps-office.docx',
];

export function isImageMimeType(mimeType: MimeTypes) {
    return imageMimeTypes.some((d) => d === mimeType);
}

export function isDocMimeType(mimeType: MimeTypes) {
    return docsMimeTypes.some((d) => d === mimeType);
}

export function isHTMLMimeType(mimeType: MimeTypes) {
    return mimeType === 'text/html';
}
