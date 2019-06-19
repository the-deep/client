import { createSelector } from 'reselect';
import {
    requiredCondition,
    dateCondition,
} from '@togglecorp/faram';
import {
    sum,
    median,
    mapToList,
    bucket,
    isTruthy,
    decodeDate,
    isNotDefined,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import {
    unique,
    getObjectChildren,
} from '#rsu/common';

import {
    leadIdFromRouteSelector,
    leadGroupIdFromRouteSelector,
} from '../route';
import {
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,
    assessmentScoreScalesSelector,
    assessmentScoreBucketsSelector,
    assessmentFocusesSelector,
    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,
    aryTemplateQuestionnaireListSelector,
} from '../domainData/props-with-state';

const emptyObject = {};
const emptyList = [];

// HELPERS

const getNamespacedId = (leadId, leadGroupId) => {
    if (isTruthy(leadGroupId)) {
        return `lead-group-${leadGroupId}`;
    } else if (isTruthy(leadId)) {
        return `lead-${leadId}`;
    }
    return undefined;
};

export const MIN_SECTORS_SELECTION_FOR_CROSS_SECTOR = 3;

const FOCUSES__CROSS_SECTOR = '12';
const FOCUSES__HUMANITARIAN_ACCESS = '8';

const METADATA_FIELDS__FAMILY = 21;
const FAMILY__HNO = '7';

const METADATA_FIELDS__COORDINATION = 6;
const COORDINATION__JOINT = '1';
const COORDINATION__HARMONIZED = '2';

const METHODOLOGY_FIELDS__DATA_COLLECTION_TECHNIQUE = 1;
const DATA_COLLECTION_TECHNIQUE_OPTIONS__SECONDARY_DATA_REVIEW = '1';

export const isDataCollectionTechniqueColumn = field => (
    field && field.id === METHODOLOGY_FIELDS__DATA_COLLECTION_TECHNIQUE
);

export const isSecondaryDataReviewSelected = methodologyRow => (
    methodologyRow[METHODOLOGY_FIELDS__DATA_COLLECTION_TECHNIQUE] ===
    DATA_COLLECTION_TECHNIQUE_OPTIONS__SECONDARY_DATA_REVIEW
);

export const shouldShowHNO = (basicInformation) => {
    const familyValue = basicInformation[METADATA_FIELDS__FAMILY];
    return familyValue === FAMILY__HNO;
};

export const shouldShowCNA = (basicInformation) => {
    const coordinationValue = basicInformation[METADATA_FIELDS__COORDINATION];
    return (
        (coordinationValue === COORDINATION__HARMONIZED
            || coordinationValue === COORDINATION__JOINT)
        && !shouldShowHNO(basicInformation)
    );
};

export const shouldShowHumanitarianAccess = (focuses, selectedFocuses) => {
    const index = selectedFocuses.findIndex(
        focus => String(focus) === FOCUSES__HUMANITARIAN_ACCESS,
    );
    return index !== -1;
};

export const shouldShowCrossSector = (focuses, selectedFocuses) => {
    const index = selectedFocuses.findIndex(
        focus => String(focus) === FOCUSES__CROSS_SECTOR,
    );
    return index !== -1;
};

// ARY VIEW SELECTORS

const editArySelector = ({ siloDomainData }) => (
    siloDomainData.editAry || emptyObject
);

const editAryFromRouteSelector = createSelector(
    editArySelector,
    leadGroupIdFromRouteSelector,
    leadIdFromRouteSelector,
    (view, leadGroupId, leadId) => {
        const id = getNamespacedId(leadId, leadGroupId);
        return view[id] || emptyObject;
    },
);

export const editAryServerIdSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.serverId,
);

export const editAryVersionIdSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.versionId,
);

export const editAryHasErrorsSelector = createSelector(
    editAryFromRouteSelector,
    ary => !!ary.hasErrors,
);

export const editAryIsPristineSelector = createSelector(
    editAryFromRouteSelector,
    ary => !!ary.isPristine,
);

export const editAryFaramErrorsSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.faramErrors || emptyObject,
);

export const editAryFaramValuesSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.faramValues || emptyObject,
);

export const editAryEntriesSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.entries || emptyList,
);

export const editAryLeadSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.lead || emptyObject,
);

export const editArySelectedSectorsSelector = createSelector(
    editAryFaramValuesSelector,
    (faramValues) => {
        const methodology = faramValues.methodology || emptyObject;
        return methodology.sectors || emptyList;
    },
);

export const editArySelectedFocusesSelector = createSelector(
    editAryFaramValuesSelector,
    (faramValues) => {
        const methodology = faramValues.methodology || emptyObject;
        return methodology.focuses || emptyList;
    },
);

export const editAryShouldShowHNO = createSelector(
    editAryFaramValuesSelector,
    (faramValues) => {
        const {
            metadata: {
                basicInformation = emptyObject,
            } = {},
        } = faramValues;
        return shouldShowHNO(basicInformation);
    },
);

export const editAryShouldShowCNA = createSelector(
    editAryFaramValuesSelector,
    (faramValues) => {
        const {
            metadata: {
                basicInformation = emptyObject,
            } = {},
        } = faramValues;
        return shouldShowCNA(basicInformation);
    },
);

// helpers

const createFieldSchema = (field) => {
    const {
        isRequired,
        fieldType,
        title,
    } = field;
    switch (fieldType) {
        case 'date':
            return isRequired
                ? [requiredCondition, dateCondition]
                : [dateCondition];
        case 'daterange':
            return {
                fields: {
                    from: [dateCondition],
                    to: [dateCondition],
                },
                validation: ({ from, to } = {}) => {
                    const errors = [];
                    if (!from && !to && isRequired) {
                        // FIXME: use strings
                        errors.push(`Either ${title} Start Date or ${title} End Date is required.`);
                    }
                    if (from && to && decodeDate(from) > decodeDate(to)) {
                        // FIXME: use strings
                        errors.push(`Invalid ${title} Range`);
                    }
                    return errors;
                },
            };
        default:
            return isRequired
                ? [requiredCondition]
                : [];
    }
};

const createAdditionalDocumentsSchema = () => ({
    fields: {
        executiveSummary: [],
        assessmentData: [],
        questionnaire: [],
        misc: [],
    },
});

const createBasicInformationSchema = (aryTemplateMetadata = {}) => ({
    fields: listToMap(
        mapToList(aryTemplateMetadata)
            .map(group => group.fields)
            .flat(),
        field => field.id,
        field => createFieldSchema(field),
    ),
});

const createMethodologySchema = (aryTemplateMethodology = {}) => ({
    fields: {
        attributes: {
            keySelector: d => d.key,
            identifier: (value) => {
                if (isSecondaryDataReviewSelected(value)) {
                    return 'secondaryDataReview';
                }
                return 'default';
            },
            member: {
                secondaryDataReview: {
                    fields: {
                        key: [],
                        ...listToMap(
                            mapToList(aryTemplateMethodology)
                                .map(group => group.fields)
                                .flat()
                                // Only show data collection technique
                                .filter(field => (
                                    field.id === METHODOLOGY_FIELDS__DATA_COLLECTION_TECHNIQUE
                                )),
                            field => field.id,
                            field => createFieldSchema(field),
                        ),
                    },
                },
                default: {
                    fields: {
                        key: [],
                        ...listToMap(
                            mapToList(aryTemplateMethodology)
                                .map(group => group.fields)
                                .flat(),
                            field => field.id,
                            field => createFieldSchema(field),
                        ),
                    },
                },
            },
            validation: (value) => {
                const errors = [];
                if (!value || value.length < 1) {
                    // FIXME: Use strings
                    errors.push('There should be at least one Collection Technique');
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
    },
});

const createSummarySchema = (focuses, selectedSectors = [], selectedFocuses = []) => {
    const schemaForSubRow = {
        fields: {
            moderateAssistancePopulation: [],
            severeAssistancePopulation: [],
            assistancePopulation: [],
        },
    };

    const schemaForRow = {
        fields: {
            rank1: schemaForSubRow,
            rank2: schemaForSubRow,
            rank3: schemaForSubRow,
        },
        validation: (subrows = {}) => {
            const errors = [];

            const memory = {};
            Object.keys(subrows).forEach((subrowKey) => {
                const subrow = subrows[subrowKey]; // rank1, rank2, rank3
                if (!subrow) {
                    return;
                }
                Object.keys(subrow).forEach((columnKey) => {
                    const value = subrow[columnKey];
                    if (isNotDefined(value) || value === '') {
                        return;
                    }
                    if (isNotDefined(memory[columnKey])) {
                        memory[columnKey] = [value];
                    } else {
                        memory[columnKey].push(value);
                    }
                });
            });

            let hasDuplicate = false;
            Object.keys(memory).forEach((key) => {
                if (isDefined(memory[key]) && memory[key].length !== unique(memory[key]).length) {
                    hasDuplicate = true;
                }
            });

            if (hasDuplicate) {
                // FIXME: use strings
                errors.push('Value in every column should be unique.');
            }

            return errors;
        },
    };

    const schema = {
        fields: listToMap(
            selectedSectors,
            sector => `sector-${sector}`,
            () => ({
                fields: {
                    outcomes: schemaForRow,
                    underlyingFactors: schemaForRow,
                    affectedGroups: schemaForRow,
                    specificNeedGroups: schemaForRow,
                },
            }),
        ),
    };

    // Cross sector needs at least 3 sector before it can be filled
    if (
        shouldShowCrossSector(focuses, selectedFocuses)
        && selectedSectors.length >= MIN_SECTORS_SELECTION_FOR_CROSS_SECTOR
    ) {
        schema.fields.crossSector = {
            fields: {
                prioritySectors: schemaForRow,
                affectedGroups: schemaForRow,
                specificNeedGroups: schemaForRow,
            },
        };
    }
    if (shouldShowHumanitarianAccess(focuses, selectedFocuses)) {
        schema.fields.humanitarianAccess = {
            fields: {
                priorityIssue: schemaForRow,
                affectedLocation: schemaForRow,
            },
        };
    }

    return schema;
};

const createScoreSchema = (scorePillars = [], scoreMatrixPillars = [], sectors = []) => ({
    fields: {
        pillars: {
            fields: listToMap(
                scorePillars,
                pillar => pillar.id,
                pillar => ({
                    fields: listToMap(
                        pillar.questions,
                        question => question.id,
                        () => [],
                    ),
                }),
            ),
        },

        matrixPillars: {
            fields: listToMap(
                scoreMatrixPillars,
                pillar => pillar.id,
                () => ({
                    fields: listToMap(
                        sectors,
                        sector => sector,
                        () => [],
                    ),
                }),
            ),
        },

        finalScore: [],

        ...listToMap(
            scorePillars,
            pillar => `${pillar.id}-score`,
            () => [],
        ),

        ...listToMap(
            scoreMatrixPillars,
            pillar => `${pillar.id}-matrix-score`,
            () => [],
        ),

    },
});

const createQuestionnaireSchema = (aryTemplateQuestionnaire = [], method) => {
    const sectors = aryTemplateQuestionnaire
        .filter(item => item.method === method);

    const questionIds = sectors
        .map(item => item.subSectors)
        .flat()
        .map(item => item.questions)
        .flat();

    return {
        fields: {
            questions: {
                ...listToMap(
                    sectors,
                    sector => `sector-${sector.id}`,
                    () => [],
                ),
                'minimum-requirements': [],
                'all-quality-criteria': [],
                fields: listToMap(
                    questionIds,
                    item => item.id,
                    () => [],
                ),
            },
        },
    };
};

export const assessmentSchemaSelector = createSelector(
    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,
    aryTemplateQuestionnaireListSelector,

    assessmentFocusesSelector,
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,

    editArySelectedSectorsSelector,
    editArySelectedFocusesSelector,
    editAryShouldShowHNO,
    editAryShouldShowCNA,
    (
        aryTemplateMetadata,
        aryTemplateMethodology,
        aryTemplateQuestionnaire,
        focuses,
        scorePillars,
        scoreMatrixPillars,
        selectedSectors,
        selectedFocuses,
        showHNO,
        showCNA,
    ) => {
        const schema = { fields: {
            metadata: {
                fields: {
                    basicInformation: createBasicInformationSchema(aryTemplateMetadata),
                    additionalDocuments: createAdditionalDocumentsSchema(),
                },
            },
            methodology: createMethodologySchema(aryTemplateMethodology),
            summary: createSummarySchema(focuses, selectedSectors, selectedFocuses),
            score: createScoreSchema(scorePillars, scoreMatrixPillars, selectedSectors),
            questionnaire: {
                fields: {},
            },
        } };

        if (showHNO) {
            schema.fields.questionnaire.fields.hno = createQuestionnaireSchema(aryTemplateQuestionnaire, 'hno');
        }
        if (showCNA) {
            schema.fields.questionnaire.fields.cna = createQuestionnaireSchema(aryTemplateQuestionnaire, 'cna');
        }
        return schema;
    },
);

export const assessmentComputeSchemaSelector = createSelector(
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,
    assessmentScoreScalesSelector,
    assessmentScoreBucketsSelector,
    aryTemplateQuestionnaireListSelector,
    editAryShouldShowHNO,
    editAryShouldShowCNA,
    (
        scorePillars = [],
        scoreMatrixPillars = [],
        scoreScales = [],
        scoreBuckets = [],
        aryTemplateQuestionnaire,
        showHNO,
        showCNA,
    ) => {
        if (scoreScales.length === 0) {
            return {};
        }

        const scoreSchema = {
            ...listToMap(
                scorePillars,
                pillar => `${pillar.id}-score`,
                pillar => (data, score) => {
                    const getScaleVal = v => scoreScales.find(
                        s => String(s.value) === String(v),
                    ).value;

                    const pillarObj = getObjectChildren(score, ['pillars', pillar.id]) || emptyObject;
                    const pillarValues = Object.values(pillarObj)
                        .map(getScaleVal);
                    return sum(pillarValues);
                },
            ),
            ...listToMap(
                scoreMatrixPillars,
                pillar => `${pillar.id}-matrix-score`,
                pillar => (data, score) => {
                    const scoreMatrixScales = Object.values(pillar.scales).reduce(
                        (acc, b) => [...acc, ...Object.values(b)],
                        [],
                    );
                    const getMatrixScaleVal = v => scoreMatrixScales.find(
                        s => String(s.id) === String(v),
                    ).value;

                    const pillarObj = getObjectChildren(score, ['matrixPillars', pillar.id]) || emptyObject;
                    const pillarValues = Object.values(pillarObj)
                        .map(getMatrixScaleVal);
                    return median(pillarValues) * 5;
                },
            ),
            finalScore: (data, score) => {
                const pillarScores = scorePillars.map(
                    p => (getObjectChildren(score, [`${p.id}-score`]) || 0) * p.weight,
                );
                const matrixPillarScores = scoreMatrixPillars.map(
                    p => (getObjectChildren(score, [`${p.id}-matrix-score`]) || 0) * p.weight,
                );

                const average = sum([...pillarScores, ...matrixPillarScores]);
                return bucket(average, scoreBuckets);
            },
        };

        const schema = { fields: {
            score: { fields: scoreSchema },
            questionnaire: { fields: {} },
        } };

        const getSchemaForQuestionnaire = (method) => {
            const sectors = aryTemplateQuestionnaire.filter(
                item => item.method === method && item.subMethod === 'criteria',
            );
            const allQuestions = sectors
                .map(item => item.subSectors)
                .flat()
                .map(item => item.questions)
                .flat();
            const requiredQuestions = allQuestions.filter(item => item.required);

            const getCalculationMethod = questionList => (data, questionnaire, hnoCna = {}) => {
                const { questions = {} } = hnoCna;

                const answers = questionList
                    .map(item => item.id)
                    .map(item => questions[item])
                    .filter(isDefined)
                    .filter(item => !!item.value);

                return 100 * (answers.length / questionList.length);
            };

            return {
                fields: {
                    ...listToMap(
                        sectors,
                        sector => `sector-${sector.id}`,
                        (sector) => {
                            const sectorQuestions = sector.subSectors
                                .map(item => item.questions)
                                .flat();
                            return getCalculationMethod(sectorQuestions);
                        },
                    ),
                    'minimum-requirements': getCalculationMethod(requiredQuestions),
                    'all-quality-criteria': getCalculationMethod(allQuestions),
                },
            };
        };

        if (showHNO) {
            schema.fields.questionnaire.fields.hno = getSchemaForQuestionnaire('hno');
        }
        if (showCNA) {
            schema.fields.questionnaire.fields.cna = getSchemaForQuestionnaire('cna');
        }

        return schema;
    },
);
