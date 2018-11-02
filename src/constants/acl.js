const acl = {
    leads: {
        hide: ({ isLoggedIn, hasProjects }) => (
            !isLoggedIn || !hasProjects
        ),
    },
    entries: {
        hide: ({ isLoggedIn, hasProjects, hasAnalysisFramework }) => (
            !isLoggedIn || !hasProjects || !hasAnalysisFramework
        ),
    },
    arys: {
        hide: ({ isLoggedIn, hasProjects, hasAssessmentTemplate }) => (
            !isLoggedIn || !hasProjects || !hasAssessmentTemplate
        ),
    },
    export: {
        hide: ({ isLoggedIn, hasProjects, hasAnalysisFramework, exportPermissions }) => (
            !isLoggedIn || !hasProjects || !hasAnalysisFramework || !exportPermissions.includes('create')
        ),
    },

    userProfile: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
    },
    projects: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
    },
    countries: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
    },
    connectors: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
    },
    apiDocs: {
        hide: ({ isLoggedIn, isDevMode }) => (
            !isLoggedIn || !isDevMode
        ),
    },
    stringManagement: {
        hide: ({ isLoggedIn, isAdmin }) => (
            !isLoggedIn || !isAdmin
        ),
    },
    notifications: {
        hide: ({ isLoggedIn, isBeta }) => (
            !isLoggedIn || isBeta
        ),
    },
    adminPanel: {
        hide: ({ isLoggedIn, isAdmin }) => (
            !isLoggedIn || !isAdmin
        ),
    },

    visualization: {
        hide: ({ isLoggedIn, isDevMode }) => (
            !isLoggedIn || !isDevMode
        ),
    },

    // this is an element
    projectSelect: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
        disable: ({ pathKey, hasProjects }) => (
            ![
                'projects',
                'dashboard',
                'leadGroups',
                'leads',
                'leadsViz',
                'clusterViz',
                'entries',
                'arys',
                'export',
                'userExports',
            ].includes(pathKey) || !hasProjects
        ),
    },
};

export default acl;
