import { getDateWithTimezone } from '#utils/common';
import { encodeDate } from '@togglecorp/fujs';

// FIXME: this is duplicated in views/LeadAdd/utils
export const LEAD_TYPE = {
    dropbox: 'dropbox',
    drive: 'google-drive',
    file: 'disk',
    website: 'website',
    text: 'text',
};

export const mimeType = {
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    rtf: 'application/rtf',
    text: 'text/plain',
    otf: 'font/otf',
    pdf: 'application/pdf',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xlsx2: 'application/wps-office.xlsx',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    csv: 'text/csv',

    png: 'image/png',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    fig: 'image/fig',

    json: 'application/json',
    xml: 'application/xml',
    msword: 'application/msword',
};

// FIXME: don't use this
export const mimeTypeToIconMap = {
    [mimeType.text]: 'documentText',

    [mimeType.docx]: 'docx',
    [mimeType.rtf]: 'rtf',
    [mimeType.otf]: 'otf',
    [mimeType.msword]: 'msword',

    [mimeType.pdf]: 'pdf',

    [mimeType.pptx]: 'pptx',
    [mimeType.ppt]: 'ppt',

    [mimeType.xls]: 'xls',
    [mimeType.xlsx]: 'xlsx',
    [mimeType.ods]: 'ods',

    [mimeType.csv]: 'csv',

    [mimeType.png]: 'png',
    [mimeType.jpg]: 'jpg',
    [mimeType.jpeg]: 'jpeg',
    [mimeType.fig]: 'fig',

    [mimeType.json]: 'json',
    [mimeType.xml]: 'xml',
};

export const getFiltersForRequest = (filters) => {
    const requestFilters = {};
    Object.keys(filters).forEach((key) => {
        const filter = filters[key];
        switch (key) {
            case 'created_at':
                if (filter) {
                    const endDate = new Date(filter.endDate);
                    endDate.setDate(endDate.getDate() + 1);

                    requestFilters.created_at__gte = getDateWithTimezone(filter.startDate);
                    requestFilters.created_at__lt = getDateWithTimezone(encodeDate(endDate));
                }
                break;
            case 'published_on':
                if (filter) {
                    const endDate = new Date(filter.endDate);
                    endDate.setDate(endDate.getDate() + 1);

                    requestFilters.published_on__gte = filter.startDate;
                    requestFilters.published_on__lt = encodeDate(endDate);
                }
                break;
            default:
                requestFilters[key] = filter;
                break;
        }
    });
    return requestFilters;
};
