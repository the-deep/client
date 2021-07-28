import { lazy } from 'react';
import { wrap } from '#base/utils/routes';
import styles from './styles.css';

const routes = {
    home: wrap({
        path: '/',
        title: 'Home',
        navbarVisibility: true,
        component: lazy(() => import('#views/Home')),
        componentProps: {
            className: styles.view,
        },
        visibility: 'is-authenticated',
    }),
    tagging: wrap({
        path: '/tagging/',
        title: 'Tagging',
        navbarVisibility: true,
        component: lazy(() => import('#views/Tagging')),
        componentProps: {
            className: styles.view,
        },
        visibility: 'is-authenticated',
    }),
    analysis: wrap({
        path: '/analysis/',
        title: 'Analysis',
        navbarVisibility: true,
        component: lazy(() => import('#views/Analysis')),
        componentProps: {
            className: styles.view,
        },
        visibility: 'is-authenticated',
    }),
    explore: wrap({
        path: '/explore/',
        title: 'Explore DEEP',
        navbarVisibility: true,
        component: lazy(() => import('#views/ExploreDeep')),
        componentProps: {
            className: styles.view,
        },
        visibility: 'is-authenticated',
    }),
    signIn: wrap({
        path: '/login/',
        title: 'Login',
        navbarVisibility: true,
        component: lazy(() => import('#base/components/PreloadMessage')),
        componentProps: {
            content: 'Login',
            className: styles.view,
        },
        visibility: 'is-not-authenticated',
    }),
    signUp: wrap({
        path: '/register/',
        title: 'Register',
        navbarVisibility: false,
        component: lazy(() => import('#base/components/PreloadMessage')),
        componentProps: {
            content: 'Register',
            className: styles.view,
        },
        visibility: 'is-not-authenticated',
    }),
    forgetPassword: wrap({
        path: '/forgot-password/',
        title: 'Forgot Password',
        navbarVisibility: false,
        component: lazy(() => import('#base/components/PreloadMessage')),
        componentProps: {
            content: 'Forgot Password',
            className: styles.view,
        },
        visibility: 'is-not-authenticated',
    }),
    resetPassword: wrap({
        path: '/reset-password/:userId/:resetToken/',
        title: 'Reset Password',
        navbarVisibility: false,
        component: lazy(() => import('#base/components/PreloadMessage')),
        componentProps: {
            content: 'Reset Password',
            className: styles.view,
        },
        visibility: 'is-not-authenticated',
    }),
    project: wrap({
        path: '/projects/:projectid(\\d+)/',
        title: 'Project',
        navbarVisibility: true,
        component: lazy(() => import('#base/components/PreloadMessage')),
        visibility: 'is-authenticated',
        componentProps: {
            content: 'Project',
            className: styles.view,
        },
        // checkPermissions: (permissions) => permissions.entry?.change,
    }),

    fourHundredFour: wrap({
        path: '*',
        title: '404',
        component: lazy(() => import('#base/components/PreloadMessage')),
        componentProps: {
            className: styles.view,
        },
        visibility: 'is-anything',
        navbarVisibility: true,
    }),
};

export default routes;
