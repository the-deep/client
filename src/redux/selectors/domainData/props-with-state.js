import { createSelector } from 'reselect';

import {
    getObjectChildren,
    compareString,
} from '#rsu/common';
import { median, sum, bucket } from '#rsu/stats';
import {
    requiredCondition,
    dateCondition,
} from '#rscg/Faram';
import Baksa from '#components/Baksa';

import { activeUserSelector } from '../auth';
import {
    groupIdFromRoute,
    countryIdFromRoute,
    projectIdFromRoute,

    afIdFromRoute,
    ceIdFromRoute,
    wordCategoryIdFromRoute,
} from './props';
import {
    leadFilterOptionsSelector,
    entryFilterOptionsSelector,
    aryFilterOptionsSelector,
    projectsSelector,
    regionsSelector,
    geoOptionsSelector,
    regionsForAllProjectsSelector,
    projectsOptionsSelector,
    analysisFrameworksSelector,
    adminLevelsSelector,
    groupsSelector,
    usersSelector,
    categoryEditorsSelector,
    aryTemplatesSelector,
    regionsListSelector,
    userExportsSelector,
} from './state';


const emptyList = [];
const emptyObject = {};

// helpers

const createScoreSchema = (scorePillars = [], scoreMatrixPillars = []) => {
    const scoreSchema = {
        fields: {
            pillars: [],
            matrixPillars: [],

            finalScore: [],
        },
    };

    scorePillars.forEach((pillar) => {
        scoreSchema.fields[`${pillar.id}-score`] = [];
    });
    scoreMatrixPillars.forEach((pillar) => {
        scoreSchema.fields[`${pillar.id}-matrix-score`] = [];
    });

    return scoreSchema;
};

const createAdditionalDocumentsSchema = () => {
    const {
        bothPageRequiredCondition,
        validPageRangeCondition,
        validPageNumbersCondition,
        pendingCondition,
    } = Baksa;

    const schema = { fields: {
        executiveSummary: [
            bothPageRequiredCondition,
            validPageRangeCondition,
            validPageNumbersCondition,
            pendingCondition,
        ],
        assessmentData: [pendingCondition],
        questionnaire: [
            bothPageRequiredCondition,
            validPageRangeCondition,
            validPageNumbersCondition,
            pendingCondition,
        ],
    } };
    return schema;
};

const createBasicInformationSchema = (aryTemplateMetadata = {}) => {
    // Dynamic fields from metadataGroup
    const dynamicFields = {};
    Object.keys(aryTemplateMetadata).forEach((key) => {
        aryTemplateMetadata[key].fields.forEach((field) => {
            if (field.fieldType === 'date') {
                dynamicFields[field.id] = [requiredCondition, dateCondition];
            } else {
                dynamicFields[field.id] = [requiredCondition];
            }
        });
    });

    const schema = { fields: dynamicFields };
    return schema;
};

const createMethodologySchema = (aryTemplateMethodology = {}) => {
    const schema = { fields: {
        attributes: {
            keySelector: d => d.key,
            member: { fields: {
                // NOTE: inject here
            } },
            validation: (value) => {
                const errors = [];
                if (!value || value.length < 1) {
                    // FIXME: Use strings
                    errors.push('There should be at least one value');
                }
                return errors;
            },
        },

        sectors: [],
        focuses: [],
        locations: [],
        affectedGroups: [],

        objectives: [],
        dataCollectionTechniques: [],
        sampling: [],
        limitations: [],
    } };

    const dynamicFields = {};
    Object.keys(aryTemplateMethodology).forEach((key) => {
        const methodologyGroup = aryTemplateMethodology[key];
        methodologyGroup.fields.forEach((field) => {
            if (field.fieldType === 'date') {
                dynamicFields[field.id] = [requiredCondition, dateCondition];
            } else {
                dynamicFields[field.id] = [requiredCondition];
            }
        });
    });
    schema.fields.attributes.member.fields = dynamicFields;

    return schema;
};


// active user
const currentUserSelector = createSelector(
    activeUserSelector,
    usersSelector,
    (activeUser, users) => (users[activeUser.userId] || emptyObject),
);

export const userExportsListSelector = createSelector(
    userExportsSelector,
    projectIdFromRoute,
    (userExports, projectId) => (
        (userExports[projectId] && Object.values(userExports[projectId]).filter(
            userExport => userExport,
        )) || emptyList
    ),
);
// OTHERS

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

// activeUser
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
export const aryFilterOptionsForProjectSelector = createSelector(
    projectIdFromRoute,
    aryFilterOptionsSelector,
    (activeProject, aryFilterOptions) => (aryFilterOptions[activeProject] || emptyObject),
);

// projectIdFromRoute
export const projectDetailsSelector = createSelector(
    projectsSelector,
    projectIdFromRoute,
    (projects, activeProject) => projects[activeProject] || emptyObject,
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
export const projectOptionsSelector = createSelector(
    projectsOptionsSelector,
    projectIdFromRoute,
    (projectsOptions, activeProject) => projectsOptions[activeProject] || emptyObject,
);

// projectIdFromRoute
export const aryTemplateSelector = createSelector(
    aryTemplatesSelector,
    projectIdFromRoute,
    (aryTemplates, projectId) => (
        aryTemplates[projectId] || emptyObject
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

export const assessmentSchemaSelector = createSelector(
    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,
    (
        aryTemplateMetadata,
        aryTemplateMethodology,
        scorePillars,
        scoreMatrixPillars,
    ) => {
        const schema = { fields: {
            metadata: {
                fields: {
                    basicInformation: createBasicInformationSchema(aryTemplateMetadata),
                    additionalDocuments: createAdditionalDocumentsSchema(),
                },
            },
            methodology: createMethodologySchema(aryTemplateMethodology),
            summary: [],
            score: createScoreSchema(scorePillars, scoreMatrixPillars),
        } };
        return schema;
    },
);

export const assessmentComputeSchemaSelector = createSelector(
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,
    assessmentScoreScalesSelector,
    assessmentScoreBucketsSelector,
    (
        scorePillars = [],
        scoreMatrixPillars = [],
        scoreScales = [],
        scoreBuckets = [],
    ) => {
        if (scoreScales.length === 0) {
            return {};
        }

        const scoreSchema = {};

        const getScaleVal = v => scoreScales.find(s => String(s.value) === String(v)).value;

        scorePillars.forEach((pillar) => {
            scoreSchema[`${pillar.id}-score`] = (data, score) => {
                const pillarObj = getObjectChildren(score, ['pillars', pillar.id]) || emptyObject;
                const pillarValues = Object.values(pillarObj).map(v => getScaleVal(v));
                return sum(pillarValues);
            };
        });

        scoreMatrixPillars.forEach((pillar) => {
            const scales = Object.values(pillar.scales).reduce(
                (acc, b) => [...acc, ...Object.values(b)],
                [],
            );
            const getMatrixScaleVal = v => scales.find(s => String(s.id) === String(v)).value;

            scoreSchema[`${pillar.id}-matrix-score`] = (data, score) => {
                const pillarObj = getObjectChildren(score, ['matrixPillars', pillar.id]) || emptyObject;
                const pillarValues = Object.values(pillarObj).map(v => getMatrixScaleVal(v));
                return median(pillarValues) * 5;
            };
        });

        scoreSchema.finalScore = (data, score) => {
            const pillarScores = scorePillars.map(
                p => (getObjectChildren(score, [`${p.id}-score`]) || 0) * p.weight,
            );
            const matrixPillarScores = scoreMatrixPillars.map(
                p => (getObjectChildren(score, [`${p.id}-matrix-score`]) || 0) * p.weight,
            );

            const average = sum([...pillarScores, ...matrixPillarScores]);
            return bucket(average, scoreBuckets);
        };

        return { fields: {
            score: { fields: scoreSchema },
        } };
    },
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
