import { matchPath } from 'react-router-dom';

import {
    mapObjectToObject,
    mapObjectToArray,
} from '#utils/common';

import {
    allLinks,
    noLinks,
} from './linksAcl';

export const ROUTE = {
    exclusivelyPublic: 'exclusively-public',
    public: 'public',
    private: 'private',
};

// Routes

export const routes = {
    // NOTE: Do not remove the immediate line
    // 'adminPanel': {}, _ts('pageTitle', 'adminPanel');

    browserExtension: {
        order: 0,
        type: ROUTE.private,
        path: '/browser-extension/',
        loader: () => import('../views/BrowserExtension'),
        links: allLinks,
    }, // _ts('pageTitle', 'browserExtension');

    login: {
        order: 10,
        type: ROUTE.exclusivelyPublic,
        redirectTo: '/',
        path: '/login/',
        hideNavbar: true,
        loader: () => import('../views/Login'),
        links: noLinks,
    }, // _ts('pageTitle', 'login');

    register: {
        order: 11,
        type: ROUTE.exclusivelyPublic,
        redirectTo: '/',
        path: '/register/',
        loader: () => import('../views/Register'),
        hideNavbar: true,
        links: noLinks,
    }, // _ts('pageTitle', 'register');

    passwordReset: {
        order: 12,
        type: ROUTE.exclusivelyPublic,
        redirectTo: '/',
        path: '/password-reset/',
        loader: () => import('../views/PasswordReset'),
        hideNavbar: true,
        links: noLinks,
    }, // _ts('pageTitle', 'passwordReset');

    discoverProjects: {
        order: 13,
        type: ROUTE.private,
        path: '/discover-projects/',
        loader: () => import('../views/DiscoverProjects'),
        links: allLinks,
    }, //  _ts('pageTitle', 'discoverProjects');

    /*
    discoverUserGroups: {
        order: 14,
        type: ROUTE.private,
        path: '/discover/user-groups/',
        loader: () => import('../views/DiscoverUserGroups'),
        links: allLinks,
    }, //  _ts('pageTitle', 'discoverUserGroups');
    */

    projectQuestionnaires: {
        order: 18,
        type: ROUTE.private,
        path: '/projects/:projectId/questionnaires/',
        loader: () => import('../views/Questionnaires'),
        links: allLinks,
    }, // _ts('pageTitle', 'projectQuestionnaires');

    analysisModule: {
        order: 19,
        type: ROUTE.private,
        path: '/projects/:projectId/analysis-module/',
        loader: () => import('../views/AnalysisModule'),
        links: allLinks,
        showSubNavbar: true,
    }, // _ts('pageTitle', 'analysisModule');

    projects: {
        order: 20,
        type: ROUTE.private,
        path: '/projects/:projectId?/',
        loader: () => import('../views/Project'),
        links: allLinks,
    }, // _ts('pageTitle', 'projects');

    dashboard: {
        order: 21,
        type: ROUTE.private,
        path: '/projects/:projectId/dashboard/',
        loader: () => import('../views/Dashboard'),
        links: allLinks,
    }, // _ts('pageTitle', 'dashboard');

    home: {
        order: 23,
        type: ROUTE.private,
        path: '/home/',
        loader: () => import('../views/Home'),
        links: allLinks,
    }, // _ts('pageTitle', 'home');

    workshop: {
        order: 19,
        type: ROUTE.private,
        path: '/workshop/',
        loader: () => import('../views/Workshop'),
        links: allLinks,
    }, // _ts('pageTitle', 'workshop');

    connectors: {
        order: 22,
        type: ROUTE.private,
        path: '/connectors/:connectorId?/',
        loader: () => import('../views/Connector'),
        links: allLinks,
    }, // _ts('pageTitle', 'connectors');

    leadsViz: {
        order: 31,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/viz/',
        loader: () => import('../views/LeadsViz'),
        links: allLinks,
    }, // _ts('pageTitle', 'leadsViz');

    clusterViz: {
        order: 34,
        type: ROUTE.private,
        path: '/projects/:projectId/clusterviz/',
        loader: () => import('../views/ClusterViz'),
        links: allLinks,
    }, // _ts('pageTitle', 'clusterViz');

    leads: {
        order: 30,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/',
        loader: () => import('../views/Leads'),
        links: allLinks,
    }, // _ts('pageTitle', 'leads');

    leadGroups: {
        order: 33,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/groups/',
        loader: () => import('../views/LeadGroups'),
        links: allLinks,
    }, // _ts('pageTitle', 'leadGroups');

    addLeads: {
        order: 32,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/add/',
        loader: () => import('../views/LeadAdd'),
        links: allLinks,
    }, // _ts('pageTitle', 'addLeads');

    entries: {
        order: 40,
        type: ROUTE.private,
        path: '/projects/:projectId/entries/',
        loader: () => import('../views/Entries/'),
        links: allLinks,
    }, // _ts('pageTitle', 'entries');

    editEntries: {
        order: 41,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/:leadId/entries/edit/',
        loader: () => import('../views/EditEntries'),
        links: allLinks,
    }, // _ts('pageTitle', 'editEntries');

    arys: {
        order: 50,
        type: ROUTE.private,
        path: '/projects/:projectId/arys/',
        loader: () => import('../views/Arys/'),
        links: allLinks,
    }, // _ts('pageTitle', 'arys');

    plannedArys: {
        order: 51,
        type: ROUTE.private,
        path: '/projects/:projectId/planned-arys/',
        loader: () => import('../views/PlannedArys/'),
        links: allLinks,
    }, // _ts('pageTitle', 'plannedArys');

    editAry: {
        order: 51,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/:leadId/ary/edit/',
        loader: () => import('../views/EditAry'),
        links: allLinks,
    }, // _ts('pageTitle', 'editAry');

    editLeadGroupAssessment: {
        order: 51,
        type: ROUTE.private,
        path: '/projects/:projectId/lead-groups/:leadGroupId/ary/edit/',
        loader: () => import('../views/EditAry'),
        links: allLinks,
    }, // _ts('pageTitle', 'editLeadGroupAssessment');

    export: {
        order: 60,
        type: ROUTE.private,
        path: '/projects/:projectId/export/',
        loader: () => import('../views/Export'),
        links: allLinks,
    }, // _ts('pageTitle', 'export');

    countries: {
        order: 70,
        type: ROUTE.private,
        path: '/countries/:countryId?/',
        loader: () => import('../views/Country'),
        links: allLinks,
    }, // _ts('pageTitle', 'countries');

    userProfile: {
        order: 80,
        type: ROUTE.private,
        path: '/users/:userId/',
        loader: () => import('../views/UserProfile'),
        links: allLinks,
    }, // _ts('pageTitle', 'userProfile');

    userGroup: {
        order: 90,
        type: ROUTE.private,
        path: '/user-groups/:userGroupId/',
        loader: () => import('../views/UserGroup'),
        links: allLinks,
    }, // _ts('pageTitle', 'userGroup');

    frameworkQuestions: {
        order: 99,
        type: ROUTE.private,
        path: '/frameworks/:analysisFrameworkId/questions/',
        loader: () => import('../views/FrameworkQuestions'),
        links: allLinks,
    }, // _ts('pageTitle', 'frameworkQuestions');

    analysisFramework: {
        order: 100,
        type: ROUTE.private,
        path: '/frameworks/:analysisFrameworkId/',
        loader: () => import('../views/AnalysisFramework'),
        links: allLinks,
    }, // _ts('pageTitle', 'analysisFramework');

    categoryEditor: {
        order: 110,
        type: ROUTE.private,
        path: '/category-editors/:categoryEditorId/edit/',
        loader: () => import('../views/CategoryEditor'),
        links: allLinks,
    }, // _ts('pageTitle', 'categoryEditor');

    weeklySnapshot: {
        order: 120,
        type: ROUTE.private,
        path: '/weekly-snapshot/',
        loader: () => import('../views/WeeklySnapshot'),
        links: allLinks,
    }, // _ts('pageTitle', 'weeklySnapshot');

    apiDocs: {
        order: 130,
        type: ROUTE.private,
        path: '/api-docs/',
        loader: () => import('../views/ApiDocs'),
        links: allLinks,
    }, // _ts('pageTitle', 'apiDocs');

    landingPage: {
        order: 140,
        type: ROUTE.private,
        path: '/',
        loader: () => import('../views/LandingPage'),
        links: allLinks,
    }, // _ts('pageTitle', 'landingPage');

    stringManagement: {
        order: 150,
        type: ROUTE.private,
        path: '/string-management/',
        loader: () => import('../views/StringManagement'),
        links: allLinks,
    }, // _ts('pageTitle', 'stringManagement');

    visualization: {
        order: 170,
        type: ROUTE.private,
        path: '/visualization/',
        loader: () => import('../views/Visualization'),
        links: allLinks,
    }, // _ts('pageTitle', 'visualization');

    questionnaireBuilder: {
        order: 180,
        type: ROUTE.private,

        path: '/projects/:projectId/questionnaires/:questionnaireId/edit/',
        loader: () => import('../views/QuestionnaireBuilder'),
        links: allLinks,
    }, // _ts('pageTitle', 'questionnaireBuilder');

    entryCommentRedirect: {
        order: 800,
        type: ROUTE.private,
        path: '/permalink/projects/:projectId/leads/:leadId/entries/:entryId/comments/',
        loader: () => import('../redirects/EntryComment.js'),
        links: allLinks,
    },

    entryEditRedirect: {
        order: 810,
        type: ROUTE.private,
        path: '/permalink/projects/:projectId/leads/:leadId/entries/:entryId/',
        loader: () => import('../redirects/EntryEdit.js'),
        links: allLinks,
    },

    projectDenied: {
        order: 970,
        type: ROUTE.public,
        path: '/project-denied/',
        loader: () => import('../views/ProjectDenied'),
        hideNavbar: false,
        links: allLinks,
    }, // _ts('pageTitle', 'projectDenied');

    fourHundredThree: {
        order: 980,
        type: ROUTE.public,
        path: '/403/',
        loader: () => import('../views/FourHundredThree'),
        hideNavbar: false,
        links: allLinks,
    }, // _ts('pageTitle', 'fourHundredThree');
    fourHundredFour: {
        order: 990,
        type: ROUTE.public,
        path: undefined,
        loader: () => import('../views/FourHundredFour'),
        hideNavbar: true,
        links: allLinks,
    }, // _ts('pageTitle', 'fourHundredFour');
};

export const pathNames = mapObjectToObject(routes, route => route.path);
export const validLinks = mapObjectToObject(routes, route => route.links);
export const hideNavbar = mapObjectToObject(routes, route => !!route.hideNavbar);
export const showSubNavbar = mapObjectToObject(routes, route => !!route.showSubNavbar);

export const getCurrentMatch = (location) => {
    const links = Object.keys(pathNames);
    const paths = Object.values(pathNames);

    for (let i = 0; i < links.length; i += 1) {
        const match = matchPath(location.pathname, {
            path: paths[i],
            exact: true,
        });

        if (match) {
            return match;
        }
    }

    return null;
};
export const routesOrder = mapObjectToArray(
    routes,
    (route, key) => ({
        key,
        order: route.order,
    }),
)
    .sort((a, b) => a.order - b.order)
    .map(row => row.key);
