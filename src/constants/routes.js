import { matchPath } from 'react-router-dom';

import {
    mapObjectToObject,
    mapObjectToArray,
} from '#utils/common';

import { allLinks } from './linksAcl';

export const ROUTE = {
    exclusivelyPublic: 'exclusively-public',
    public: 'public',
    private: 'private',
};

// Routes

export const routes = {
    // NOTE: Do not remove the immediate line
    // 'adminPanel': {}, _ts('pageTitle', 'adminPanel');

    editAry: {
        order: 51,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/:leadId/ary/edit/',
        loader: () => import('../views/EditAry'),
        links: allLinks,
        hideNavbar: true,
    }, // _ts('pageTitle', 'editAry');

    editLeadGroupAssessment: {
        order: 51,
        type: ROUTE.private,
        path: '/projects/:projectId/lead-groups/:leadGroupId/ary/edit/',
        loader: () => import('../views/EditAry'),
        links: allLinks,
        hideNavbar: true,
    }, // _ts('pageTitle', 'editLeadGroupAssessment');


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
    const paths = Object.values(pathNames);

    for (let i = 0; i < paths.length; i += 1) {
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
