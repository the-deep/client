export const galleryImageMimeType = ['image/png', 'image/jpeg', 'image/fig', 'image/gif'];

export const galleryDocsMimeType = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf', 'text/plain', 'font/otf', 'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'application/json', 'application/xml', 'application/msword',
    'application/wps-office.docx',
];

export const galleryType = {
    IMAGE: 'image',
    DOC: 'doc',
    HTML: 'html',
};

export const galleryMapping = {};

galleryImageMimeType.forEach((type) => { galleryMapping[type] = galleryType.IMAGE; });
galleryDocsMimeType.forEach((type) => { galleryMapping[type] = galleryType.DOC; });
galleryMapping['text/html'] = galleryType.HTML;
