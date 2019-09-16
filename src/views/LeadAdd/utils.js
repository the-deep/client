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

export const fakeLeads = [
    {
        id: 'lead-v25847n4',
        faramValues: {
            title: '5W.xlsx',
            project: 1,
            sourceType: 'disk',
            confidentiality: 'unprotected',
            assignee: 2,
            publishedOn: '2019-09-11',
            attachment: {
                id: 898,
            },
            // author: 'My Author',
            // source: 'His Author',
        },
        faramErrors: {},
        faramInfo: {
            error: false,
            pristine: false,
            serverError: false,
        },
    },
    {
        id: 'lead-dssyx1uz',
        faramValues: {
            title: 'Lead 8:01:23 PM',
            project: 1,
            sourceType: 'text',
            publishedOn: '2019-09-11',
            text: 'This is a test!',
        },
        faramErrors: {},
        faramInfo: {
            error: false,
            pristine: false,
            serverError: false,
        },
    },
    {
        id: 'lead-dssyx1uh',
        faramValues: {
            title: 'Lead 8:01:24 PM',
            project: 1,
            sourceType: 'text',
            confidentiality: 'protected',
            assignee: 2,
            publishedOn: '2019-09-11',
            text: 'This is a test!',
            // source: 'Test',
            // author: 'Test',
        },
        faramErrors: {},
        faramInfo: {
            error: false,
            pristine: false,
            serverError: false,
        },
    },
    {
        id: 'lead-1jkvobim',
        serverId: 85,
        faramValues: {
            title: 'set chrome eslint - Google Search',
            sourceType: 'website',
            project: 1,
            confidentiality: 'unprotected',
            assignee: 2,
            publishedOn: '2019-09-06',
            website: 'www.google.com',
            url: 'https://www.google.com/search?hl=en&ei=0-xxXcjvAszNvgSZ04CACA&q=set+chrome+eslint&oq=set+chrome+eslint&gs_l=psy-ab.3..33i160.44296.47906..48377...0.2..1.317.2345.0j10j1j1......0....1..gws-wiz.......0i71j0i67j0j0i22i30.RzsmYxnD610&ved=0ahUKEwiIpZ3fubvkAhXMpo8KHZkpAIAQ4dUDCAs&uact=5',
            text: '',
        },
        faramErrors: {},
        faramInfo: {
            error: false,
            pristine: true,
            serverError: false,
        },
    },
];


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
