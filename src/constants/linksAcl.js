import viewsAcl from './viewsAcl';

// NOTE: This is done to only hide the button but it can be accessed through link
const notClusteringViewable = ({ isLoggedIn, leadPermissions, isBeta }) => (
    !isLoggedIn || !leadPermissions.view || isBeta
);

export const noLinks = {};
export const allLinks = {
    leads: viewsAcl.leads,
    entries: viewsAcl.entries,
    arys: viewsAcl.arys,
    export: viewsAcl.export,

    userProfile: viewsAcl.userProfile,
    projects: viewsAcl.projects,
    countries: viewsAcl.countries,
    clusterViz: { hide: notClusteringViewable },
    apiDocs: viewsAcl.apiDocs,
    stringManagement: viewsAcl.stringManagement,
    visualization: viewsAcl.visualization,
    adminPanel: viewsAcl.adminPanel,

    projectQuestionnaires: viewsAcl.projectQuestionnaires,

    leadsViz: viewsAcl.leadsViz,
    workshop: viewsAcl.workshop,

    // TODO: do not disable if there is a 403 error inside
    projectSelect: {
        hide: ({ isLoggedIn }) => !isLoggedIn,
        disable: ({ pathKey, hasProjects }) => (
            ![
                'projects',
                'dashboard',
                'workshop',
                'leadGroups',
                'leads',
                'addLeads',
                'leadsViz',
                'clusterViz',
                'entries',
                'projectQuestionnaires',
                'arys',
                'export',
                'userExports',
            ].includes(pathKey) || !hasProjects
        ),
    },
};
