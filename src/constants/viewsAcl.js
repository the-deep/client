/*
const notProjectMember = ({ isLoggedIn, setupPermissions }) => (
    !isLoggedIn || !setupPermissions.view
);
*/
/*
const notDev = ({ isLoggedIn, isDevMode }) => (
    !isLoggedIn || !isDevMode
);
*/
const notLoggedIn = ({ isLoggedIn }) => !isLoggedIn;
const notAdmin = ({ isLoggedIn, isAdmin }) => (
    !isLoggedIn || !isAdmin
);
const notDevAndAdmin = ({ isLoggedIn, isDevMode, isAdmin }) => (
    !isLoggedIn || (!isDevMode && !isAdmin)
);

const notLeadViewable = ({ isLoggedIn, leadPermissions }) => (
    !isLoggedIn || !leadPermissions.view
);
const notLeadEditable = ({ isLoggedIn, leadPermissions }) => (
    !isLoggedIn || !(leadPermissions.create || leadPermissions.modify)
);

const notLeadVizViewable = ({ isLoggedIn, leadPermissions, isBeta }) => (
    !isLoggedIn || !leadPermissions.view || isBeta
);

const notClusteringViewable = ({ isLoggedIn, leadPermissions }) => (
    !isLoggedIn || !leadPermissions.view
);

const notEntriesViewable = ({ isLoggedIn, hasAnalysisFramework, entryPermissions }) => (
    !isLoggedIn || !hasAnalysisFramework || !entryPermissions.view
);
const notEntriesEditable = ({ isLoggedIn, hasAnalysisFramework, entryPermissions }) => (
    !isLoggedIn || !hasAnalysisFramework || !(
        entryPermissions.create || entryPermissions.modify || entryPermissions.delete
    )
);

const notAssessmentViewable = ({ isLoggedIn, hasAssessmentTemplate, assessmentPermissions }) => (
    !isLoggedIn || !hasAssessmentTemplate || !assessmentPermissions.view
);

const notQuestionnaireViewable = ({ isLoggedIn, accessQuestionnaire }) => (
    !isLoggedIn || !accessQuestionnaire
);

const notAnalysisModuleViewable = ({ isLoggedIn, accessAnalysisModule, entryPermissions }) => (
    !isLoggedIn || !accessAnalysisModule || !entryPermissions.view
);

const notAnalysisModuleEditable = ({ isLoggedIn, accessAnalysisModule, entryPermissions }) => (
    !isLoggedIn || !accessAnalysisModule || !(
        entryPermissions.create || entryPermissions.modify || entryPermissions.delete
    )
);

const notQuestionnaireEditable = ({ isLoggedIn, accessQuestionnaire, setupPermissions }) => (
    !isLoggedIn || !setupPermissions.modify || !accessQuestionnaire
);

const notNewUiViewable = ({ accessNewUi }) => (
    !accessNewUi
);

const notNewUiViewableAndProjectAdmin = ({ isLoggedIn, setupPermissions, accessNewUi }) => (
    !accessNewUi || !isLoggedIn || !setupPermissions.modify
);

const notNewUiViewableAndLoggedIn = ({ isLoggedIn, accessNewUi }) => (
    !accessNewUi || !isLoggedIn
);

const notNewUiViewableAndLeadViewable = ({ accessNewUi, isLoggedIn, leadPermissions }) => (
    !accessNewUi || !isLoggedIn || !leadPermissions.view
);

const notNewUiViewableAndExportable = ({
    accessNewUi, isLoggedIn, hasAnalysisFramework, exportPermissions,
}) => (
    !isLoggedIn
    || !accessNewUi
    || !hasAnalysisFramework
    || !(exportPermissions.create || exportPermissions.create_only_unprotected)
);

const notExportCreatable = ({ isLoggedIn, hasAnalysisFramework, exportPermissions }) => (
    !isLoggedIn
    || !hasAnalysisFramework
    || !(exportPermissions.create || exportPermissions.create_only_unprotected)
);

// NOTE: route related to a project should either have
// projectPermissions.view or any other permissions
const acl = {
    browserExtension: {},
    login: {},
    register: {},
    passwordReset: {},
    projectDenied: {},
    fourHundredThree: {},
    fourHundredFour: {},
    entryCommentRedirect: {},
    entryEditRedirect: {},

    discoverProjects: { hide: notLoggedIn },
    home: { hide: notLoggedIn },
    dashboard: { hide: notLoggedIn },

    projects: { hide: notLoggedIn },
    editProject: { hide: notNewUiViewableAndProjectAdmin },
    newProject: { hide: notNewUiViewableAndLoggedIn },
    connectors: { hide: notLoggedIn },

    leadsViz: { hide: notLeadVizViewable },
    clusterViz: { hide: notClusteringViewable },
    leads: { hide: notLeadViewable },
    leadGroups: { hide: notLeadViewable },
    addLeads: { hide: notLeadEditable },

    entries: { hide: notEntriesViewable },
    editEntries: { hide: notEntriesEditable },

    arys: { hide: notAssessmentViewable },
    plannedArys: { hide: notAssessmentViewable },
    editAry: { hide: false }, // TODO pull permission from server
    editLeadGroupAssessment: { hide: notAssessmentViewable },

    export: { hide: notExportCreatable },
    userExports: { hide: notExportCreatable },

    countries: { hide: notLoggedIn },
    userProfile: { hide: notLoggedIn },
    userGroup: { hide: notLoggedIn },

    analysisFramework: { hide: notLoggedIn },
    categoryEditor: { hide: notLoggedIn },
    stringManagement: { hide: notDevAndAdmin },
    landingPage: { hide: notLoggedIn },
    adminPanel: { hide: notAdmin },

    // FIXME: have it's own permission model
    projectQuestionnaires: { hide: notQuestionnaireViewable },
    questionnaireBuilder: { hide: notQuestionnaireEditable },
    frameworkQuestions: { hide: notQuestionnaireViewable },

    tagging: { hide: notNewUiViewableAndLeadViewable },
    taggingDashboard: { hide: notNewUiViewableAndLoggedIn },
    taggingExport: { hide: notNewUiViewableAndExportable },

    exploreDeep: { notNewUiViewable },
    analysisModule: { hide: notAnalysisModuleViewable },
    pillarAnalysis: { hide: notAnalysisModuleEditable },

    analyticalFramework: { hide: notNewUiViewableAndLoggedIn },
    myProfile: { hide: notNewUiViewableAndLoggedIn },
    newUserGroup: { hide: notNewUiViewableAndLoggedIn },
};

export default acl;
