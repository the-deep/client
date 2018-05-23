const acl = {
    leads: {
        requireLogin: true,
        requireProject: true,
    },
    entries: {
        requireLogin: true,
        requireProject: true,
        requireAnalysisFramework: true,
    },
    arys: {
        requireLogin: true,
        requireProject: true,
        requireAssessmentTemplate: true,
    },
    export: {
        requireLogin: true,
        requireProject: true,
        requireAnalysisFramework: true,
    },
    userProfile: {
        requireLogin: true,
    },
    projects: {
        requireLogin: true,
    },
    countries: {
        requireLogin: true,
    },
    connectors: {
        requireLogin: true,
    },
    apiDocs: {
        requireLogin: true,
        requireDevMode: true,
    },
    stringManagement: {
        requireLogin: true,
        requireAdminRights: true,
    },
    adminPanel: {
        requireLogin: true,
        requireAdminRights: true,
    },

    // this is an element
    projectSelect: {
        requireLogin: true,
        disable: ({ pathKey }) => ![
            'projects',
            'dashboard',
            'leads',
            'leadsViz',
            'entries',
            'arys',
            'export',
            'userExports',
        ].includes(pathKey),
    },
};

export default acl;
