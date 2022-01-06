import viewsAcl from './viewsAcl';

// NOTE: This is done to only hide the button but it can be accessed through link
const notClusteringViewable = ({ isLoggedIn, leadPermissions, isBeta, isProd }) => (
    !isLoggedIn || !leadPermissions.view || isBeta || isProd
);

export const noLinks = {};
export const allLinks = {
    home: viewsAcl.home,
    leads: viewsAcl.leads,
    entries: viewsAcl.entries,
    arys: viewsAcl.arys,
    export: viewsAcl.export,

    userProfile: viewsAcl.userProfile,
    projects: viewsAcl.projects,
    newProject: viewsAcl.newProject,
    editProject: viewsAcl.editProject,
    countries: viewsAcl.countries,
    clusterViz: { hide: notClusteringViewable },
    connectors: viewsAcl.connectors,
    stringManagement: viewsAcl.stringManagement,
    adminPanel: viewsAcl.adminPanel,

    projectQuestionnaires: viewsAcl.projectQuestionnaires,
    analysisModule: viewsAcl.analysisModule,

    leadsViz: viewsAcl.leadsViz,

    // TODO: do not disable if there is a 403 error inside
    projectSelect: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
        disable: ({ pathKey, hasProjects }) => (
            ![
                'projects',
                'home',
                'dashboard',
                'leadGroups',
                'leads',
                'leadsViz',
                'clusterViz',
                'entries',
                'projectQuestionnaires',
                'arys',
                'export',
                'userExports',
                'analysisModule',
                'tagging',
                'taggingDashboard',
                'taggingExport',
            ].includes(pathKey) || !hasProjects
        ),
    },
};
