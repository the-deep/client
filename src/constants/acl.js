const acl = {
    // NOTE: Don't forget to modify viewsAcl.js or linkAcl.js

    leads: {
        hide: ({ isLoggedIn, hasProjects, leadPermissions }) => (
            !isLoggedIn || !hasProjects || !leadPermissions.view
        ),
    },
    entries: {
        hide: ({ isLoggedIn, hasProjects, hasAnalysisFramework, entryPermissions }) => (
            !isLoggedIn || !hasProjects || !hasAnalysisFramework || !entryPermissions.view
        ),
    },
    arys: {
        hide: ({ isLoggedIn, hasProjects, hasAssessmentTemplate, assessmentPermissions }) => (
            !isLoggedIn || !hasProjects || !hasAssessmentTemplate || !assessmentPermissions.view
        ),
    },
    export: {
        hide: ({ isLoggedIn, hasProjects, hasAnalysisFramework, exportPermissions }) => (
            !isLoggedIn || !hasProjects || !hasAnalysisFramework || !exportPermissions.create
        ),
    },

    // TODO: add acl for every page

    dashboard: {
        hide: ({ isLoggedIn, hasProjects, setupPermissions }) => (
            !isLoggedIn || !hasProjects || !setupPermissions.view
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
    workshop: {
        hide: ({ isLoggedIn, isDevMode, isAdmin }) => (
            !isLoggedIn || (!isDevMode && !isAdmin)
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
                'workshop',
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
