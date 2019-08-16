import update from '#rsu/immutable-update';
import { getDateWithTimezone } from '#utils/common';
import { encodeDate } from '@togglecorp/fujs';

export const LEAD_TYPE = {
    dropbox: 'dropbox',
    drive: 'google-drive',
    file: 'disk',
    website: 'website',
    text: 'text',
};

export const ATTACHMENT_TYPES = [
    LEAD_TYPE.file,
    LEAD_TYPE.dropbox,
    LEAD_TYPE.drive,
];

export const LEAD_STATUS = {
    uploading: 'uploading',
    warning: 'warning',
    requesting: 'requesting',
    invalid: 'invalid',
    nonPristine: 'nonPristine',
    complete: 'complete',
    pristine: 'pristine',
};

export const LEAD_FILTER_STATUS = {
    invalid: 'invalid',
    saved: 'saved',
    unsaved: 'unsaved',
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

export const leadAccessor = {
    getKey: lead => lead.id,
    getServerId: lead => lead.serverId,
    getType: lead => lead.faramValues && lead.faramValues.sourceType,

    getFaramValues: lead => lead.faramValues,
    getFaramErrors: lead => lead.faramErrors,

    getUiState: lead => lead.uiState,
    hasServerError: lead => !!lead.uiState && lead.uiState.serverError,
};

const leadReference = {
    id: 'lead-0',
    serverId: undefined,
    faramValues: {
        title: 'Lead #0',
        project: 0,
    },
    faramErrors: {},
    uiState: {
        error: false,
        pristine: false,
        serverError: false,
    },
};

export const createLead = (lead) => {
    const { id, serverId, faramValues = {}, pristine = false } = lead;
    const settings = {
        id: { $set: id },
        serverId: { $set: serverId },
        faramValues: { $set: faramValues },
        uiState: {
            pristine: { $set: pristine },
        },
    };
    return update(leadReference, settings);
};

export const calcLeadState = ({ lead, upload, rest, drive, dropbox }) => {
    const type = leadAccessor.getType(lead);
    const serverId = leadAccessor.getServerId(lead);

    const faramValues = leadAccessor.getFaramValues(lead);
    const { pristine, error, serverError } = leadAccessor.getUiState(lead);

    const isFileUploading = () => upload && upload.progress <= 100;
    const isDriveUploading = () => drive && drive.pending;
    const isDropboxUploading = () => dropbox && dropbox.pending;
    const noAttachment = () => faramValues && !faramValues.attachment;

    if (
        (type === LEAD_TYPE.file && isFileUploading()) ||
        (type === LEAD_TYPE.drive && isDriveUploading()) ||
        (type === LEAD_TYPE.dropbox && isDropboxUploading())
    ) {
        return LEAD_STATUS.uploading;
    } else if (
        noAttachment() && (
            type === LEAD_TYPE.file ||
            type === LEAD_TYPE.drive ||
            type === LEAD_TYPE.dropbox
        )
    ) {
        return LEAD_STATUS.warning; // invalid
    } else if (rest && rest.pending) {
        return LEAD_STATUS.requesting;
    } else if (error || serverError) {
        return LEAD_STATUS.invalid;
    } else if (!pristine) {
        return LEAD_STATUS.nonPristine;
    } else if (serverId) {
        return LEAD_STATUS.complete;
    }
    return LEAD_STATUS.pristine;
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
