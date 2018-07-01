const acl = {
    leads: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
        disable: ({ hasProjects }) => !hasProjects,
    },
    entries: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
        disable: ({ hasProjects, hasAnalysisFramework }) => (
            !hasProjects || !hasAnalysisFramework
        ),
    },
    arys: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
        disable: ({ hasProjects, hasAssessmentTemplate }) => (
            !hasProjects || !hasAssessmentTemplate
        ),
    },
    export: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
        disable: ({ hasProjects, hasAnalysisFramework }) => (
            !hasProjects || !hasAnalysisFramework
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
        hide: ({ isLoggedIn }) => !isLoggedIn,
    },
    adminPanel: {
        hide: ({ isLoggedIn, isAdmin }) => (
            !isLoggedIn || !isAdmin
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
