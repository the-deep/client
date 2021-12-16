import React, { lazy } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import { wrap } from '#base/utils/routes';

const fourHundredFour = wrap({
    path: '*',
    title: '404',
    component: lazy(() => import('#views/FullPageErrorMessage')),
    componentProps: {
        krakenVariant: 'skydive',
        errorTitle: '404',
        errorMessage: (
            <>
                Sorry, the requested page does not exist
                <br />
                You have come too DEEP, this is where the DEEP Kraken rests.
            </>
        ),
    },
    visibility: 'is-anything',
    navbarVisibility: false,
});
const login = wrap({
    path: '/login/',
    title: 'Login',
    navbarVisibility: false,
    component: lazy(() => import('#views/Login')),
    componentProps: {
    },
    visibility: 'is-not-authenticated',
});
const register = wrap({
    path: '/register/',
    title: 'Register',
    navbarVisibility: false,
    component: lazy(() => import('#views/Register')),
    componentProps: {
    },
    visibility: 'is-not-authenticated',
});
const forgotPassword = wrap({
    path: '/forgot-password/',
    title: 'Forgot Password',
    navbarVisibility: false,
    component: lazy(() => import('#views/ForgotPassword')),
    componentProps: {
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
    },
    visibility: 'is-not-authenticated',
});
const home = wrap({
    path: '/',
    title: 'Home',
    navbarVisibility: true,
    component: lazy(() => import('#views/Home')),
    componentProps: {
    },
    visibility: 'is-authenticated',
});
const myProfile = wrap({
    path: '/my-profile/',
    title: 'My Profile',
    navbarVisibility: true,
    component: lazy(() => import('#views/MyProfile')),
    componentProps: {
    },
    visibility: 'is-authenticated',
});
const userGroups = wrap({
    path: '/user-groups/',
    title: 'User Groups',
    navbarVisibility: true,
    component: lazy(() => import('#views/UserGroup')),
    componentProps: {
    },
    visibility: 'is-authenticated',
});
const explore = wrap({
    path: '/explore/',
    title: 'Explore DEEP',
    navbarVisibility: true,
    component: lazy(() => import('#views/ExploreDeep')),
    componentProps: {
    },
    visibility: 'is-anything',
});
const analyticalFrameworkCreateRoute = wrap({
    path: '/frameworks/new/',
    title: 'Analytical Framework',
    navbarVisibility: false,
    component: lazy(() => import('#views/AnalyticalFramework')),
    componentProps: { },
    visibility: 'is-authenticated',
    // NOTE: we cannot use permission check related to project on this route
    // as this route manages all the data load
});
const analyticalFrameworkEditRoute = wrap({
    path: '/frameworks/:frameworkId(\\d+)/',
    title: 'Analytical Framework',
    navbarVisibility: false,
    component: lazy(() => import('#views/AnalyticalFramework')),
    componentProps: { },
    visibility: 'is-authenticated',
    // NOTE: we cannot use permission check related to project on this route
    // as this route manages all the data load
});

const projectCreateRoute = wrap({
    path: '/projects/new/',
    title: 'New Project',
    navbarVisibility: false,
    component: lazy(() => import('#views/ProjectEdit')),
    componentProps: { },
    visibility: 'is-authenticated',
    // NOTE: we cannot use permission check related to project on this route
    // as this route manages all the data load
});

const projectRoute = wrap({
    path: '/projects/:projectId(\\d+)/',
    title: 'Project',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project')),
    componentProps: { },
    visibility: 'is-authenticated',
    // NOTE: we cannot use permission check related to project on this route
    // as this route manages all the data load
});

const taggingRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/tagging/',
    title: 'Tagging',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project/Tagging')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project || project.allowedPermissions.length <= 0) {
            return false;
        }
        return (
            project.allowedPermissions.includes('VIEW_ALL_LEAD')
            || project.allowedPermissions.includes('VIEW_ONLY_UNPROTECTED_LEAD')
        );
    },
});
const projectEditRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/edit/',
    title: 'Edit Project',
    navbarVisibility: false,
    component: lazy(() => import('#views/ProjectEdit')),
    componentProps: { },
    visibility: 'is-authenticated',
    checkPermissions: (project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project || project.allowedPermissions.length <= 0) {
            return false;
        }
        return project.allowedPermissions.includes('UPDATE_PROJECT');
    },
});
const entryEditRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/leads/:leadId(\\d+)/',
    title: 'Edit Entry',
    navbarVisibility: false,
    component: lazy(() => import('#views/Project/EntryEdit')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (
            !project
            || project.allowedPermissions.length <= 0
            || isNotDefined(project.analysisFramework?.id)
        ) {
            return false;
        }
        // NOTE: should also check if users can edit lead
        // either in route or inside page
        return (
            project.allowedPermissions.includes('CREATE_ENTRY')
            || project.allowedPermissions.includes('UPDATE_ENTRY')
            || project.allowedPermissions.includes('DELETE_ENTRY')
        );
    },
});
const analysis = wrap({
    parent: projectRoute,
    path: '/analysis/',
    title: 'Analysis',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project/AnalysisModule')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project || project.allowedPermissions.length <= 0) {
            return false;
        }
        return (
            project.allowedPermissions.includes('VIEW_ENTRY')
        );
    },
});
const pillarAnalysis = wrap({
    parent: projectRoute,
    path: '/analysis/:analysisId(\\d+)/pillar/:pillarAnalysisId(\\d+)/',
    title: 'Pillar Analysis',
    navbarVisibility: false,
    component: lazy(() => import('#views/Project/PillarAnalysis')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project || project.allowedPermissions.length <= 0) {
            return false;
        }
        return (
            project.allowedPermissions.includes('UPDATE_ENTRY')
        );
    },
});

const sources = wrap({
    parent: { path: taggingRoute.path },
    path: '/sources/',
    title: 'Sources',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project/Tagging/Sources')),
    componentProps: {
    },
    visibility: 'is-authenticated',
});
const assessments = wrap({
    parent: { path: taggingRoute.path },
    path: '/assessments/',
    title: 'Assessments',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project/Tagging/Assessments')),
    componentProps: {
    },
    checkPermissions: (project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project) {
            return false;
        }
        return project.hasAssessmentTemplate;
    },
    visibility: 'is-authenticated',
});
const leadGroups = wrap({
    parent: { path: taggingRoute.path },
    path: '/source-groups/',
    title: 'Source Groups',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project/Tagging/LeadGroups')),
    componentProps: {
    },
    checkPermissions: (project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project) {
            return false;
        }
        return project.hasAssessmentTemplate;
    },
    visibility: 'is-authenticated',
});
const dashboard = wrap({
    parent: { path: taggingRoute.path },
    path: '/dashboard/',
    title: 'Dashboard',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project/Tagging/Dashboard')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project) {
            return false;
        }
        return project.isVisualizationEnabled && project.isVisualizationAvailable;
    },
});

const aryDashboard = wrap({
    parent: { path: taggingRoute.path },
    path: '/assessment-dashboard/',
    title: 'Assessments Dashboard',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project/Tagging/AryDashboard')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project) {
            return false;
        }
        return (
            project.isVisualizationEnabled
            && project.isVisualizationAvailable
            && project.hasAssessmentTemplate
        );
    },
});

const exportRoute = wrap({
    parent: { path: taggingRoute.path },
    path: '/export/',
    title: 'Export',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project/Tagging/Export')),
    componentProps: {
    },
    visibility: 'is-authenticated',
});

const assessmentEditRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/assessments/:leadId(\\d+)/',
    title: 'Edit Assessment',
    navbarVisibility: false,
    component: lazy(() => import('#views/Project/EditAssessment')),
    componentProps: {
    },
    visibility: 'is-authenticated', // TODO handle permission
    checkPermissions: (project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project) {
            return false;
        }
        // NOTE: using permission for LEAD as we don't have one for assessment
        return project.hasAssessmentTemplate && (
            project.allowedPermissions.includes('CREATE_LEAD')
            || project.allowedPermissions.includes('UPDATE_LEAD')
        );
    },
});

const routes = {
    login,
    register,
    forgotPassword,
    resetPassword,
    home,
    myProfile,
    userGroups,
    tagging: taggingRoute,
    analysis,
    pillarAnalysis,
    explore,
    project: projectRoute,
    analyticalFrameworkEdit: analyticalFrameworkEditRoute,
    analyticalFrameworkCreate: analyticalFrameworkCreateRoute,
    projectCreate: projectCreateRoute,
    projectEdit: projectEditRoute,
    sources,
    assessments,
    leadGroups,
    fourHundredFour,
    dashboard,
    aryDashboard,
    export: exportRoute,
    entryEdit: entryEditRoute,
    assessmentEdit: assessmentEditRoute,
};
export default routes;
