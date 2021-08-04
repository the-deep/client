import { lazy } from 'react';
import { wrap } from '#base/utils/routes';
import styles from './styles.css';

const fourHundredFour = wrap({
    path: '*',
    title: '404',
    component: lazy(() => import('#base/components/PreloadMessage')),
    componentProps: {
        className: styles.view,
        heading: '404',
        content: 'What you are looking for does not exist.',
    },
    visibility: 'is-anything',
    navbarVisibility: true,
});
const signIn = wrap({
    path: '/login/',
    title: 'Login',
    navbarVisibility: true,
    component: lazy(() => import('#base/components/PreloadMessage')),
    componentProps: {
        content: 'Login',
        className: styles.view,
    },
    visibility: 'is-not-authenticated',
});
const signUp = wrap({
    path: '/register/',
    title: 'Register',
    navbarVisibility: false,
    component: lazy(() => import('#base/components/PreloadMessage')),
    componentProps: {
        content: 'Register',
        className: styles.view,
    },
    visibility: 'is-not-authenticated',
});
const forgetPassword = wrap({
    path: '/forgot-password/',
    title: 'Forgot Password',
    navbarVisibility: false,
    component: lazy(() => import('#base/components/PreloadMessage')),
    componentProps: {
        content: 'Forgot Password',
        className: styles.view,
    },
    visibility: 'is-not-authenticated',
});
const resetPassword = wrap({
    path: '/reset-password/:userId/:resetToken/',
    title: 'Reset Password',
    navbarVisibility: false,
    component: lazy(() => import('#base/components/PreloadMessage')),
    componentProps: {
        content: 'Reset Password',
        className: styles.view,
    },
    visibility: 'is-not-authenticated',
});
const home = wrap({
    path: '/',
    title: 'Home',
    navbarVisibility: true,
    component: lazy(() => import('#views/Home')),
    componentProps: {
        className: styles.view,
    },
    visibility: 'is-authenticated',
});
const explore = wrap({
    path: '/explore/',
    title: 'Explore DEEP',
    navbarVisibility: true,
    component: lazy(() => import('#views/ExploreDeep')),
    componentProps: {
        className: styles.view,
    },
    visibility: 'is-authenticated',
});
const projectRoute = wrap({
    path: '/projects/:projectId(\\d+)/',
    title: 'Project',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project')),
    componentProps: {
        className: styles.view,
        content: 'Project',
    },
    visibility: 'is-authenticated',
    // NOTE: we cannot use permission check related to project on this route
    // as this route manages all the data load
});
const taggingRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/tagging/',
    title: 'Tagging',
    navbarVisibility: true,
    component: lazy(() => import('#views/Tagging')),
    componentProps: {
        className: styles.view,
    },
    visibility: 'is-authenticated',
    checkPermissions: (project) => {
        if (!project || project.allowedPermissions.length <= 0) {
            return false;
        }
        return (
            project.allowedPermissions.includes('VIEW_ALL_LEAD')
            || project.allowedPermissions.includes('VIEW_ONLY_UNPROTECTED_LEAD')
        );
    },
});
const sources = wrap({
    parent: { path: taggingRoute.path },
    path: '/sources/',
    title: 'Sources',
    navbarVisibility: true,
    component: lazy(() => import('#views/Sources')),
    componentProps: {
        className: styles.view,
    },
    visibility: 'is-authenticated',
});
const dashboard = wrap({
    parent: { path: taggingRoute.path },
    path: '/dashboard/',
    title: 'Dashboard',
    navbarVisibility: true,
    component: lazy(() => import('#views/Dashboard')),
    componentProps: {
        className: styles.view,
    },
    visibility: 'is-authenticated',
});
const exportRoute = wrap({
    parent: { path: taggingRoute.path },
    path: '/export/',
    title: 'Export',
    navbarVisibility: true,
    component: lazy(() => import('#views/Export')),
    componentProps: {
        className: styles.view,
    },
    visibility: 'is-authenticated',
});
const taggingFlow = wrap({
    parent: { path: taggingRoute.path },
    path: '/:leadId/flow/',
    title: 'Tagging Flow',
    navbarVisibility: true,
    component: lazy(() => import('#views/TaggingFlow')),
    componentProps: {
        className: styles.view,
    },
    visibility: 'is-authenticated',
});

const analysis = wrap({
    parent: projectRoute,
    path: '/analysis/',
    title: 'Analysis',
    navbarVisibility: true,
    component: lazy(() => import('#views/Analysis')),
    componentProps: {
        className: styles.view,
    },
    visibility: 'is-authenticated',
    checkPermissions: (project) => {
        if (!project || project.allowedPermissions.length <= 0) {
            return false;
        }
        return (
            project.allowedPermissions.includes('VIEW_ALL_ENTRY')
            || project.allowedPermissions.includes('VIEW_ONLY_UNPROTECTED_ENTRY')
        );
    },
});

const routes = {
    signIn,
    signUp,
    forgetPassword,
    resetPassword,
    home,
    tagging: taggingRoute,
    analysis,
    explore,
    project: projectRoute,
    sources,
    fourHundredFour,
    dashboard,
    export: exportRoute,
    taggingFlow,
};
export default routes;
