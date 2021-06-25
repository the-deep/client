const notLoggedIn = ({ isLoggedIn }) => !isLoggedIn;
/*
const notProjectMember = ({ isLoggedIn, setupPermissions }) => (
    !isLoggedIn || !setupPermissions.view
);
*/
const notProjectAdmin = ({ isLoggedIn, setupPermissions }) => (
    !isLoggedIn || !setupPermissions.modify
);
/*
const notDev = ({ isLoggedIn, isDevMode }) => (
    !isLoggedIn || !isDevMode
);
*/
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

const notAnalysisModuleViewable = ({ isLoggedIn, accessAnalysisModule }) => (
    !isLoggedIn || !accessAnalysisModule
);


const notQuestionnaireEditable = ({ isLoggedIn, accessQuestionnaire, setupPermissions }) => (
    !isLoggedIn || !setupPermissions.modify || !accessQuestionnaire
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

    discoverProjects: { hide: notLoggedIn },
    home: { hide: notLoggedIn },
    dashboard: { hide: notLoggedIn },

    projects: { hide: notLoggedIn },
    editProject: { hide: notProjectAdmin },
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
    editAry: { hide: notAssessmentViewable },
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

    analysisModule: { hide: notAnalysisModuleViewable },
    tagging: { hide: notLeadViewable },

    exploreDeep: {},
    projectDenied: {},
    fourHundredThree: {},
    fourHundredFour: {},
};

export default acl;
