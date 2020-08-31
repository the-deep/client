import {
    caseInsensitiveSubmatch,
    isNotDefined,
    randomString,
    formatDateToString,
} from '@togglecorp/fujs';

export const leadKeySelector = lead => lead.id;
export const leadIdSelector = lead => lead.serverId;
export const leadFaramValuesSelector = lead => lead.faramValues;
export const leadFaramErrorsSelector = lead => lead.faramErrors;
export const leadFaramInfoSelector = lead => lead.faramInfo;

export const leadSourceTypeSelector = lead => (
    lead.faramValues && lead.faramValues.sourceType
);

export const LEAD_TYPE = {
    dropbox: 'dropbox',
    drive: 'google-drive',
    file: 'disk',
    website: 'website',
    text: 'text',
    connectors: 'connectors',
};

export const ATTACHMENT_TYPES = [
    LEAD_TYPE.file,
    LEAD_TYPE.dropbox,
    LEAD_TYPE.drive,
];

export const LEAD_FILTER_STATUS = {
    invalid: 'invalid',
    saved: 'saved',
    unsaved: 'unsaved',
};

export const LEAD_STATUS = {
    uploading: 'uploading',
    warning: 'warning',
    requesting: 'requesting',
    invalid: 'invalid',
    nonPristine: 'nonPristine',
    complete: 'complete',
    pristine: 'pristine',
};

export const getLeadState = (
    lead,
    { leadSaveStatus, fileUploadStatus, driveUploadStatus, dropboxUploadStatus },
) => {
    const serverId = leadIdSelector(lead);
    const type = leadSourceTypeSelector(lead);
    const faramValues = leadFaramValuesSelector(lead);

    const { attachment } = faramValues;
    const { pristine, error, serverError } = leadFaramInfoSelector(lead);

    const isFileUploading = fileUploadStatus && fileUploadStatus.progress < 100;
    const isDriveUploading = driveUploadStatus && driveUploadStatus.pending;
    const isDropboxUploading = dropboxUploadStatus && dropboxUploadStatus.pending;
    const noAttachment = !attachment;

    if (
        (type === LEAD_TYPE.file && isFileUploading) ||
        (type === LEAD_TYPE.drive && isDriveUploading) ||
        (type === LEAD_TYPE.dropbox && isDropboxUploading)
    ) {
        return LEAD_STATUS.uploading;
    } else if (
        noAttachment && (
            type === LEAD_TYPE.file ||
            type === LEAD_TYPE.drive ||
            type === LEAD_TYPE.dropbox
        )
    ) {
        return LEAD_STATUS.warning; // invalid
    } else if (leadSaveStatus && leadSaveStatus.pending) {
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

export const supportedGoogleDriveMimeTypes = [
    'application/json', 'application/xml', 'application/msword',
    'application/rtf', 'text/plain', 'font/otf', 'application/pdf',
    'application/vnd.ms-powerpoint', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/wps-office.xlsx',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/fig',
    'image/jpeg',
    'image/png',
    'text/csv',
];

export const supportedDropboxExtension = [
    '.doc', '.docx', '.rtf', '.txt',
    '.otf', '.pdf', '.ppt', '.pptx',
    '.xls', '.xlsx', '.ods', '.csv', '.png',
    '.jpg', '.gif', '.json', '.xml',
];

export const supportedFileTypes = '.pdf, .ppt, .pptx, .csv, .ods, .xls, .xlsx, .doc, .docx, .odt, .rtf, image/*';

export const isLeadFormLoading = leadState => (
    leadState === LEAD_STATUS.requesting
);

export const isLeadFormDisabled = leadState => (
    leadState === LEAD_STATUS.requesting
    || leadState === LEAD_STATUS.warning
);

export const isLeadSaveDisabled = leadState => (
    leadState !== LEAD_STATUS.nonPristine && leadState !== LEAD_STATUS.invalid
);

export const isLeadExportDisabled = leadState => (
    leadState !== LEAD_STATUS.complete
);

export const isLeadRemoveDisabled = leadState => (
    leadState === LEAD_STATUS.requesting
);

export function isExportEnabledForLeads(leads, leadStates) {
    if (leads.length <= 0) {
        return false;
    }
    return leads.some(lead => !isLeadExportDisabled(leadStates[leadKeySelector(lead)]));
}

export function isSaveEnabledForLeads(leads, leadStates) {
    if (leads.length <= 0) {
        return false;
    }
    return leads.some(lead => !isLeadSaveDisabled(leadStates[leadKeySelector(lead)]));
}

export function isRemoveEnabledForLeads(leads, leadStates) {
    if (leads.length <= 0) {
        return false;
    }
    return leads.some(lead => !isLeadRemoveDisabled(leadStates[leadKeySelector(lead)]));
}

export function getExportEnabledForLeads(leads, leadStates) {
    if (leads.length <= 0) {
        return [];
    }
    return leads.filter(lead => !isLeadExportDisabled(leadStates[leadKeySelector(lead)]));
}

export function getSaveEnabledForLeads(leads, leadStates) {
    if (leads.length <= 0) {
        return false;
    }
    return leads.filter(lead => !isLeadSaveDisabled(leadStates[leadKeySelector(lead)]));
}

export function getRemoveEnabledForLeads(leads, leadStates) {
    if (leads.length <= 0) {
        return false;
    }
    return leads.filter(lead => !isLeadRemoveDisabled(leadStates[leadKeySelector(lead)]));
}

function findLeadIndex(leads, activeLeadKey) {
    if (leads.length <= 0 || isNotDefined(activeLeadKey)) {
        return -1;
    }
    const index = leads.findIndex(lead => activeLeadKey === leadKeySelector(lead));
    return index;
}

export function isLeadPrevDisabled(leads, activeLeadKey) {
    const index = findLeadIndex(leads, activeLeadKey);
    return index === -1 || index === 0;
}

export function isLeadNextDisabled(leads, activeLeadKey) {
    const index = findLeadIndex(leads, activeLeadKey);
    return index === -1 || index === (leads.length - 1);
}

export function getNewLeadKey(prefix = 'lead') {
    const uid = randomString(16);
    return `${prefix}-${uid}`;
}

function statusMatches(leadState, filterStatus) {
    switch (filterStatus) {
        case LEAD_FILTER_STATUS.invalid:
            return (
                leadState === LEAD_STATUS.invalid ||
                leadState === LEAD_STATUS.warning
            );
        case LEAD_FILTER_STATUS.saved:
            return leadState === LEAD_STATUS.complete;
        case LEAD_FILTER_STATUS.unsaved:
            return (
                leadState === LEAD_STATUS.nonPristine ||
                leadState === LEAD_STATUS.uploading ||
                leadState === LEAD_STATUS.requesting
            );
        default:
            return false;
    }
}

export function leadFilterMethod(lead, filters, leadState) {
    // NOTE: removed filter by publisher
    const {
        search,
        type,
        // source,
        status,
    } = filters;

    const leadType = leadSourceTypeSelector(lead);
    const {
        title: leadTitle = '',
        // source: leadSource = '',
    } = leadFaramValuesSelector(lead);

    if (search && !caseInsensitiveSubmatch(leadTitle, search)) {
        return false;
    // } else if (source && !caseInsensitiveSubmatch(leadSource, source)) {
    //     return false;
    } else if (type && type.length > 0 && type.indexOf(leadType) === -1) {
        return false;
    } else if (status && status.length > 0 && !statusMatches(leadState, status)) {
        return false;
    }
    return true;
}


export function getFaramValuesFromLead(lead) {
    return {
        title: lead.title,
        sourceType: lead.sourceType,
        emmTriggers: lead.emmTriggers,
        emmEntities: lead.emmEntities,
        source: lead.sourceDetail ? lead.sourceDetail.id : undefined,
        authors: lead.authorsDetail ? lead.authorsDetail.map(item => item.id) : undefined,
        publishedOn: formatDateToString(new Date(lead.publishedOn), 'yyyy-MM-dd'),
        // Website type
        website: lead.website,
        url: lead.url,
        // File type
        attachment: lead.attachment,
        // Text tye
        text: lead.text,
        priority: lead.priority,

        // fields exclusive to lead (not on leadCandidate)
        leadGroup: lead.leadGroup,
        tabularBook: lead.tabularBook,
        project: lead.project,
        confidentiality: lead.confidentiality,
        assignee: lead.assignee,
        sourceRaw: !lead.sourceDetail ? lead.sourceRaw : undefined,
        authorRaw: !lead.authorsDetail || lead.authorsDetail.length <= 0
            ? lead.authorRaw
            : undefined,
    };
}

// We get lead candidate from connectors
export function getFaramValuesFromLeadCandidate(leadCandidate) {
    const lead = leadCandidate;
    return {
        title: lead.title,
        sourceType: LEAD_TYPE.website,
        emmEntities: lead.emmEntities,
        emmTriggers: lead.emmTriggers,
        source: lead.sourceDetail ? lead.sourceDetail.id : undefined,
        authors: lead.authorsDetail ? lead.authorsDetail.map(item => item.id) : undefined,
        publishedOn: formatDateToString(new Date(lead.publishedOn), 'yyyy-MM-dd'),
        // Website
        website: lead.website,
        url: lead.url,

        // fields only on connectors
        sourceSuggestion: !lead.sourceDetail ? lead.sourceRaw : undefined,
        authorSuggestion: !lead.authorsDetail || lead.authorsDetail.length <= 0
            ? lead.authorRaw
            : undefined,
        // NOTE: organizations are created for connectors, so we may drop
        // organization suggestion
    };
}
