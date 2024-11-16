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
const termsOfService = wrap({
    path: '/terms-and-privacy/',
    title: 'Terms and Privacy',
    navbarVisibility: false,
    component: lazy(() => import('#views/TermsOfService')),
    componentProps: {
    },
    visibility: 'is-anything',
});
const extensionPrivacyPolicy = wrap({
    path: '/extension-privacy-policy/',
    title: 'DEEP Extension Privacy Policy',
    navbarVisibility: false,
    component: lazy(() => import('#views/ExtensionPrivacyPolicy')),
    componentProps: {
    },
    visibility: 'is-anything',
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
    visibility: 'is-authenticated',
});
const publicExplore = wrap({
    path: '/public-explore/',
    title: 'Explore DEEP',
    navbarVisibility: true,
    component: lazy(() => import('#views/PublicExploreDeep')),
    componentProps: {},
    visibility: 'is-anything',
});
const analyticalFrameworkCreateRoute = wrap({
    path: '/frameworks/new/',
    title: 'Analytical Framework',
    navbarVisibility: false,
    component: lazy(() => import('#views/AnalyticalFramework')),
    componentProps: {},
    visibility: 'is-authenticated',
    // NOTE: we cannot use permission check related to project on this route
    // as this route manages all the data load
});
const analyticalFrameworkEditRoute = wrap({
    path: '/frameworks/:frameworkId(\\d+)/',
    title: 'Analytical Framework',
    navbarVisibility: false,
    component: lazy(() => import('#views/AnalyticalFramework')),
    componentProps: {},
    visibility: 'is-authenticated',
    // NOTE: we cannot use permission check related to project on this route
    // as this route manages all the data load
});

const projectCreateRoute = wrap({
    path: '/projects/new/',
    title: 'New Project',
    navbarVisibility: false,
    component: lazy(() => import('#views/ProjectEdit')),
    componentProps: {},
    visibility: 'is-authenticated',
    // NOTE: we cannot use permission check related to project on this route
    // as this route manages all the data load
});

const projectRoute = wrap({
    path: '/projects/:projectId(\\d+)/',
    title: 'Project',
    navbarVisibility: true,
    component: lazy(() => import('#views/Project')),
    componentProps: {},
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
    },
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
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
    componentProps: {},
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
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
    component: lazy(() => import('#views/EntryEdit')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
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
const reportEditRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/reports/:reportId(\\d+)/',
    title: 'Edit Report',
    navbarVisibility: false,
    component: lazy(() => import('#views/ReportEdit')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
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

const publicReportViewRoute = wrap({
    path: '/public-reports/:reportSlug/',
    title: 'View Report',
    navbarVisibility: false,
    component: lazy(() => import('#views/PublicReportView')),
    componentProps: {
    },
    visibility: 'is-anything',
});

const newReportRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/reports/new/',
    title: 'Edit Report',
    navbarVisibility: false,
    component: lazy(() => import('#views/ReportEdit')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
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
    parent: { path: projectRoute.path },
    path: '/analysis-module/',
    title: 'Analysis',
    navbarVisibility: true,
    component: lazy(() => import('#views/AnalysisModule')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (user, project, skipProjectPermissionCheck) => {
        // const accessAnalysisModule =
        // !!user?.accessibleFeatures?.some((f) => f.key === 'ANALYSIS');
        const accessAnalysisModule = true;
        if (!accessAnalysisModule) {
            return false;
        }

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
    parent: { path: projectRoute.path },
    path: '/analysis/:analysisId(\\d+)/pillar/:pillarAnalysisId(\\d+)/',
    title: 'Pillar Analysis',
    navbarVisibility: false,
    component: lazy(() => import('#views/PillarAnalysis')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (user, project, skipProjectPermissionCheck) => {
        // const accessAnalysisModule =
        // !!user?.accessibleFeatures?.some((f) => f.key === 'ANALYSIS');
        const accessAnalysisModule = true;
        if (!accessAnalysisModule) {
            return false;
        }
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
    component: lazy(() => import('#views/Sources')),
    componentProps: {
    },
    visibility: 'is-authenticated',
});

const analysisDashboard = wrap({
    parent: { path: analysis.path },
    path: '/dashboard/',
    title: 'Dashboard',
    navbarVisibility: true,
    component: lazy(() => import('#views/AnalysisDashboard')),
    componentProps: {
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
    },
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project) {
            return false;
        }
        return project.isVisualizationEnabled;
    },
});

const assessments = wrap({
    parent: { path: taggingRoute.path },
    path: '/assessments/',
    title: 'Assessments',
    navbarVisibility: true,
    component: lazy(() => import('#views/Assessments')),
    componentProps: {
    },
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project) {
            return false;
        }
        return project.isAssessmentEnabled;
    },
    visibility: 'is-authenticated',
});

const aryDashboard = wrap({
    parent: { path: taggingRoute.path },
    path: '/assessment-dashboard/',
    title: 'Assessments Dashboard',
    navbarVisibility: true,
    component: lazy(() => import('#views/AryDashboard')),
    componentProps: {
    },
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project) {
            return false;
        }
        return project.isAssessmentEnabled;
    },
    visibility: 'is-authenticated',
});

const newAssessmentEditRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/assessments/:assessmentId(\\d+)/',
    title: 'Edit Assessment',
    navbarVisibility: false,
    component: lazy(() => import('#views/EditAry')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project) {
            return false;
        }
        // NOTE: using permission for LEAD as we don't have one for assessment
        return project.isAssessmentEnabled && (
            project.allowedPermissions.includes('CREATE_LEAD')
            || project.allowedPermissions.includes('UPDATE_LEAD')
        );
    },
});

const createNewAssessmentRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/assessments/new/',
    title: 'Create Assessment',
    navbarVisibility: false,
    component: lazy(() => import('#views/EditAry')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project) {
            return false;
        }
        // NOTE: using permission for LEAD as we don't have one for assessment
        return project.isAssessmentEnabled && (
            project.allowedPermissions.includes('CREATE_LEAD')
            || project.allowedPermissions.includes('UPDATE_LEAD')
        );
    },
});

const exportRoute = wrap({
    parent: { path: taggingRoute.path },
    path: '/export/',
    title: 'Export',
    navbarVisibility: true,
    component: lazy(() => import('#views/Export')),
    componentProps: {
    },
    visibility: 'is-authenticated',
});
const analysisExportRoute = wrap({
    parent: { path: analysis.path },
    path: '/export/',
    title: 'Export',
    navbarVisibility: true,
    component: lazy(() => import('#views/AssessmentExport')),
    componentProps: {
    },
    visibility: 'is-authenticated',
});
const exportCreateRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/export/new-entry/',
    title: 'New Entry Export',
    navbarVisibility: false,
    component: lazy(() => import('#views/NewExport')),
    componentProps: {},
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project || project.allowedPermissions.length <= 0) {
            return false;
        }
        return project.allowedPermissions.includes('CREATE_EXPORT');
    },
});

const newAssessmentExportCreateRoute = wrap({
    parent: { path: projectRoute.path },
    path: '/export/new-assessment/',
    title: 'New Export',
    navbarVisibility: false,
    component: lazy(() => import('#views/NewAssessmentExport')),
    componentProps: {},
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (!project || project.allowedPermissions.length <= 0) {
            return false;
        }
        return project.allowedPermissions.includes('CREATE_EXPORT');
    },
});

const documentViewer = wrap({
    path: '/document-preview/:leadHash/',
    title: 'Document Preview',
    navbarVisibility: true,
    component: lazy(() => import('#views/DocumentViewer')),
    componentProps: {
    },
    visibility: 'is-anything',
});

const documentViewerRedirect = wrap({
    path: '/permalink/leads-uuid/:leadHash/',
    title: 'Document Viewer',
    navbarVisibility: false,
    component: lazy(() => import('#redirects/DocumentViewer')),
    componentProps: {
    },
    visibility: 'is-anything',
});

const entryEditRedirect = wrap({
    path: '/permalink/projects/:projectId/leads/:leadId/entries/:entryId/',
    title: 'Edit Entry',
    navbarVisibility: false,
    component: lazy(() => import('#redirects/EntryEdit')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
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

const projectRedirect = wrap({
    path: '/permalink/projects/:projectId/',
    title: 'Project',
    navbarVisibility: false,
    component: lazy(() => import('#redirects/Project')),
    componentProps: {
    },
    visibility: 'is-authenticated',
    checkPermissions: (_, project, skipProjectPermissionCheck) => {
        if (skipProjectPermissionCheck) {
            return true;
        }
        if (
            !project
            || project.allowedPermissions.length <= 0
        ) {
            return false;
        }
        // NOTE: should also check if users can edit lead
        // either in route or inside page
        return (
            project.allowedPermissions.includes('VIEW_ALL_LEAD')
            || project.allowedPermissions.includes('VIEW_ONLY_UNPROTECTED_LEAD')
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
    analysisExport: analysisExportRoute,
    pillarAnalysis,
    explore,
    publicExplore,
    project: projectRoute,
    analyticalFrameworkEdit: analyticalFrameworkEditRoute,
    analyticalFrameworkCreate: analyticalFrameworkCreateRoute,
    projectCreate: projectCreateRoute,
    projectEdit: projectEditRoute,
    termsOfService,
    extensionPrivacyPolicy,
    sources,
    analysisDashboard,
    fourHundredFour,
    dashboard,
    aryDashboard,
    export: exportRoute,
    exportCreate: exportCreateRoute,
    reportEdit: reportEditRoute,
    publicReportView: publicReportViewRoute,
    newReport: newReportRoute,
    entryEdit: entryEditRoute,
    newAssessmentEdit: newAssessmentEditRoute,
    createNewAssessment: createNewAssessmentRoute,
    assessments,
    assessmentExportCreate: newAssessmentExportCreateRoute,
    entryEditRedirect,
    documentViewerRedirect,
    projectRedirect,
    documentViewer,
};
export default routes;
