import acl from './acl';

export const noLinks = {};
export const allLinks = {
    leads: acl.leads,
    entries: acl.entries,
    arys: acl.arys,
    export: acl.export,
    userProfile: acl.userProfile,
    projects: acl.projects,
    countries: acl.countries,
    connectors: acl.connectors,
    apiDocs: acl.apiDocs,
    stringManagement: acl.stringManagement,
    notifications: acl.notifications,
    visualization: acl.visualization,

    adminPanel: acl.adminPanel,
    projectSelect: acl.projectSelect,
};
