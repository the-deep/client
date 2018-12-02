import viewsAcl from './viewsAcl';

export const noLinks = {};
export const allLinks = {
    leads: viewsAcl.leads,
    entries: viewsAcl.entries,
    arys: viewsAcl.arys,
    export: viewsAcl.export,

    userProfile: viewsAcl.userProfile,
    projects: viewsAcl.projects,
    countries: viewsAcl.countries,
    connectors: viewsAcl.connectors,
    apiDocs: viewsAcl.apiDocs,
    stringManagement: viewsAcl.stringManagement,
    visualization: viewsAcl.visualization,
    adminPanel: viewsAcl.adminPanel,

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
