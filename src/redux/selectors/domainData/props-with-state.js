import { createSelector } from 'reselect';
import { compareString } from '@togglecorp/fujs';

import { activeUserSelector } from '../auth';
import {
    groupIdFromRoute,
    countryIdFromRoute,
    projectIdFromRoute,

    questionnaireIdFromRoute,
    afIdFromRoute,
    ceIdFromRoute,
    wordCategoryIdFromRoute,
} from './props';
import {
    leadFilterOptionsSelector,
    entryFilterOptionsSelector,
    projectsSelector,
    regionsSelector,
    geoOptionsSelector,
    regionsForAllProjectsSelector,
    analysisFrameworksSelector,
    questionnairesSelector,
    adminLevelsSelector,
    groupsSelector,
    usersSelector,
    categoryEditorsSelector,
    aryTemplatesSelector,
    regionsListSelector,

    projectRolesSelector,
} from './state';


const emptyList = [];
const emptyObject = {};


// active user
const currentUserSelector = createSelector(
    activeUserSelector,
    usersSelector,
    (activeUser, users) => (users[activeUser.userId] || emptyObject),
);

// countryIdFromRoute
export const countryDetailSelector = createSelector(
    regionsListSelector,
    countryIdFromRoute,
    (regions, activeCountry) => (
        regions.find(
            country => country.id === activeCountry,
        ) || emptyObject
    ),
);

// countryIdFromRoute
export const regionDetailForRegionSelector = createSelector(
    regionsSelector,
    countryIdFromRoute,
    (regions, regionId) => (regions[regionId] || emptyObject),
);

// countryIdFromRoute
export const adminLevelForRegionSelector = createSelector(
    adminLevelsSelector,
    countryIdFromRoute,
    (adminLevels, regionId) => (
        adminLevels[regionId] || emptyList
    ),
);

// groupIdFromRoute
export const groupSelector = createSelector(
    groupsSelector,
    groupIdFromRoute,
    (userGroups, userGroupId) => (userGroups[userGroupId] || emptyObject),
);

// groupIdFromRoute
export const userGroupProjectSelector = createSelector(
    projectsSelector,
    groupIdFromRoute,
    (projects, userGroupId) => (
        Object.keys(projects)
            .reduce(
                (acc, projectId) => {
                    const { userGroups } = projects[projectId] || emptyObject;
                    const hasUserGroup = userGroups && userGroups.find(
                        userGroup => (userGroup.id === userGroupId),
                    );
                    if (hasUserGroup) {
                        return [
                            ...acc,
                            projects[projectId],
                        ];
                    }
                    return acc;
                },
                emptyList,
            )
    ),
);

// activeUser
export const currentUserInformationSelector = createSelector(
    currentUserSelector,
    user => (user.information || emptyObject),
);

// NOTE: this doesn't depend on props though
export const currentUserProjectsSelector = createSelector(
    projectsSelector,
    projects => Object.keys(projects).map(
        projectId => projects[projectId],
    ).sort(
        (a, b) => compareString(
            a.title,
            b.title,
        ),
    ),
);

export const currentUserLeadChangeableProjectsSelector = createSelector(
    currentUserProjectsSelector,
    projectRolesSelector,
    (projects, roles) => projects.filter((project) => {
        const role = roles[project.role];
        if (!role) {
            return false;
        }
        const { leadPermissions } = role;
        return leadPermissions.create || leadPermissions.modify;
    }),
);

// activeUser
export const currentUserAdminProjectsSelector = createSelector(
    currentUserProjectsSelector,
    projects => projects.filter(project => project),
);

// activeUser, projectIdFromRoute
export const currentUserActiveProjectSelector = createSelector(
    currentUserProjectsSelector,
    projectIdFromRoute,
    (currentUserProjects, activeProject) => (
        currentUserProjects.find(project => project.id === activeProject) || emptyObject
    ),
);

// projectIdFromRoute
export const leadFilterOptionsForProjectSelector = createSelector(
    projectIdFromRoute,
    leadFilterOptionsSelector,
    (activeProject, leadFilterOptions) => (leadFilterOptions[activeProject] || emptyObject),
);

// projectIdFromRoute
export const entryFilterOptionsForProjectSelector = createSelector(
    projectIdFromRoute,
    entryFilterOptionsSelector,
    (activeProject, entryFilterOptions) => (entryFilterOptions[activeProject] || emptyObject),
);

// projectIdFromRoute
export const projectDetailsSelector = createSelector(
    projectsSelector,
    projectIdFromRoute,
    (projects, activeProject) => (
        projects[activeProject] || emptyObject
    ),
);

// projectIdFromRoute
export const geoOptionsForProjectSelector = createSelector(
    geoOptionsSelector,
    projectIdFromRoute,
    (geoOptions, activeProject) => geoOptions[activeProject] || emptyObject,
);

// projectIdFromRoute
export const regionsForProjectSelector = createSelector(
    regionsForAllProjectsSelector,
    projectIdFromRoute,
    (regions, activeProject) => regions[activeProject] || emptyObject,
);

// projectIdFromRoute
export const aryTemplateSelector = createSelector(
    aryTemplatesSelector,
    projectIdFromRoute,
    (aryTemplates, projectId) => (
        aryTemplates[projectId] || emptyObject
    ),
);

export const aryTemplateQuestionnaireListSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.questionnaireSector || emptyList
    ),
);

export const aryTemplateMetadataSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.metadataGroups || emptyList
    ),
);

export const aryTemplateMethodologySelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.methodologyGroups || emptyList
    ),
);

export const assessmentSectorsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.sectors || emptyList
    ),
);

export const assessmentFocusesSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.focuses || emptyList
    ),
);

export const assessmentSourcesSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.sources || emptyObject
    ),
);

export const focusesSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.focuses || emptyList
    ),
);

export const affectedGroupsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.affectedGroups || emptyList
    ),
);

export const prioritySectorsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.prioritySectors || emptyList
    ),
);

export const specificNeedGroupsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.specificNeedGroups || emptyList
    ),
);

export const underlyingFactorsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.underlyingFactors || emptyList
    ),
);

export const priorityIssuesSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.priorityIssues || emptyList
    ),
);

export const affectedLocationsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.affectedLocations || emptyList
    ),
);

export const assessmentPillarsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.scorePillars || emptyList
    ),
);

export const assessmentMatrixPillarsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.scoreMatrixPillars || emptyList
    ),
);

export const assessmentScoreScalesSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.scoreScales || emptyList
    ),
);

export const assessmentScoreBucketsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.scoreBuckets || emptyList
    ),
);

export const assessmentMinScaleValueSelector = createSelector(
    assessmentScoreScalesSelector,
    scales => Math.min(...scales.map(s => s.value)),
);

export const assessmentMaxScaleValueSelector = createSelector(
    assessmentScoreScalesSelector,
    scales => Math.max(...scales.map(s => s.value)),
);

export const assessmentMinScaleColorSelector = createSelector(
    assessmentScoreScalesSelector,
    scales => scales.reduce((s1, s2) => ((s1.value < s2.value) ? s1 : s2)).color,
);

export const assessmentMaxScaleColorSelector = createSelector(
    assessmentScoreScalesSelector,
    scales => scales.reduce((s1, s2) => ((s1.value > s2.value) ? s1 : s2)).color,
);

export const assessmentMinFinalScoreSelector = createSelector(
    assessmentScoreBucketsSelector,
    buckets => Math.min(...buckets.map(s => s[2])),
);

export const assessmentMaxFinalScoreSelector = createSelector(
    assessmentScoreBucketsSelector,
    buckets => Math.max(...buckets.map(s => s[2])),
);

// NOTE: this should be the naming convention
export const questionnaireSelector = createSelector(
    questionnairesSelector,
    questionnaireIdFromRoute,
    (questionnaires, questionnaireId) => (
        questionnaires[questionnaireId] || emptyObject
    ),
);

// afIdFromRoute
export const analysisFrameworkDetailSelector = createSelector(
    analysisFrameworksSelector,
    afIdFromRoute,
    (analysisFrameworks, afId) => (
        analysisFrameworks[afId] || emptyObject
    ),
);


// ceIdFromRoute
export const categoryEditorDetailSelector = createSelector(
    categoryEditorsSelector,
    ceIdFromRoute,
    (categoryEditors, ceId) => (
        categoryEditors[ceId] || emptyObject
    ),
);

export const wordCategoryDetailSelector = createSelector(
    categoryEditorsSelector,
    wordCategoryIdFromRoute,
    (wordCategories, wordCategoryId) => (
        wordCategories[wordCategoryId] || emptyObject
    ),
);
