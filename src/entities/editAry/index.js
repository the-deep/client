import {
    requiredCondition,
    dateCondition,
} from '@togglecorp/faram';
import {
    sum,
    median,
    bucket,
    decodeDate,
    isNotDefined,
    isDefined,
    listToMap,
    unique, // FIXME: check if this works
} from '@togglecorp/fujs';
import {
    getObjectChildren,
} from '#rsu/common';

const emptyObject = {};

// WIDGET SPECIFIC BEHAVIOR

const widgetSpecificProps = {
    number: {
        separator: ' ',
    },
};

const getOptions = (sourceType, sources, options) => {
    switch (sourceType) {
        case 'countries':
            return sources.countries;
        case 'organizations':
            return sources.organizations;
        default:
            return options;
    }
};

export const getProps = (data, sources) => {
    const {
        fieldType,
        id: key,
        options,
        placeholder,
        title,
        tooltip,
        sourceType,
    } = data;

    const id = String(key);
    const commonProps = {
        faramElementName: id,
        key: id,
        label: title,
        options: getOptions(sourceType, sources, options),
        placeholder,
        title: tooltip,
    };

    const specificProps = widgetSpecificProps[fieldType];

    return {
        ...commonProps,
        ...specificProps,
    };
};

export const isDroppableWidget = (sourceType, fieldType) => (
    sourceType === 'organizations' && fieldType === 'multiselect'
);


// ASSESSMENT SPECIFIC BEHAVIOR

export const MIN_SECTORS_SELECTION_FOR_CROSS_SECTOR = 3;

// Metadata

const METADATA_GROUPS__STAKEHOLDER = 2;
const METADATA_FIELDS__FAMILY = 21;
const METADATA_FIELDS__COORDINATION = 6;

const SECTOR_FIELDS__PROTECTION = 9;

const COORDINATION__JOINT = '1';
// const COORDINATION__HARMONIZED = '2';

const FAMILY__HNO = '7';

export const isStakeholderColumn = field => (
    field && field.id === METADATA_GROUPS__STAKEHOLDER
);

export const shouldShowHNO = (basicInformation) => {
    const familyValue = basicInformation[METADATA_FIELDS__FAMILY];
    return familyValue === FAMILY__HNO;
};

export const shouldShowProtectionInfo = sectors => (
    sectors.some(sector => sector === String(SECTOR_FIELDS__PROTECTION))
);

export const shouldShowCNA = (basicInformation) => {
    const coordinationValue = basicInformation[METADATA_FIELDS__COORDINATION];
    return (
        coordinationValue === COORDINATION__JOINT
        // || coordinationValue === COORDINATION__HARMONIZED
        && !shouldShowHNO(basicInformation)
    );
};

// Methodology

const FOCUSES__CROSS_SECTOR = '12';
const FOCUSES__HUMANITARIAN_ACCESS = '8';

const METHODOLOGY_FIELDS__DATA_COLLECTION_TECHNIQUE = 1;
const DATA_COLLECTION_TECHNIQUE_OPTIONS__SECONDARY_DATA_REVIEW = '1';

export const isDataCollectionTechniqueColumn = field => (
    field && field.id === METHODOLOGY_FIELDS__DATA_COLLECTION_TECHNIQUE
);

export const isSecondaryDataReviewSelected = methodologyRow => (
    methodologyRow[METHODOLOGY_FIELDS__DATA_COLLECTION_TECHNIQUE] ===
    DATA_COLLECTION_TECHNIQUE_OPTIONS__SECONDARY_DATA_REVIEW
);

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

// Questionnaire

const CNA__USE_CRITERIA = 21;
const HNO__USE_CRITERIA = 6;

export const isUseCriteria = (method, sectorId) => (
    (method === 'cna' && sectorId === CNA__USE_CRITERIA)
    || (method === 'hno' && sectorId === HNO__USE_CRITERIA)
);

// Schema

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

export const filterPlannedAssessmentMetadataGroups = (groups = []) => {
    const plannedGroups = groups.map((group) => {
        const { fields } = group;
        const newFields = fields.filter(
            f => f.showInPlannedAssessment,
        );
        return {
            ...group,
            fields: newFields,
        };
    })
        .filter(group => group.fields.length > 0);

    return plannedGroups;
};

export const createMetadataSchema = (aryTemplateMetadata = [], plannedAssessment = false) => {
    if (plannedAssessment) {
        const aryTemplateFilteredMetadata = filterPlannedAssessmentMetadataGroups(
            aryTemplateMetadata,
        );
        return {
            fields: {
                basicInformation: {
                    fields: listToMap(
                        aryTemplateFilteredMetadata
                            .map(group => group.fields)
                            .flat(),
                        field => field.id,
                        field => createFieldSchema(field),
                    ),
                },
            },
        };
    }

    return {
        fields: {
            basicInformation: {
                fields: listToMap(
                    aryTemplateMetadata
                        .map(group => group.fields)
                        .flat(),
                    field => field.id,
                    field => createFieldSchema(field),
                ),
            },
            additionalDocuments: {
                fields: {
                    executiveSummary: [],
                    assessmentData: [],
                    questionnaire: [],
                    misc: [],
                },
            },
        },
    };
};

export const createMethodologySchema = (
    aryTemplateMethodology = [],
    plannedAssessment = false,
    showProtectionInfo = false,
) => {
    if (plannedAssessment) {
        return {
            fields: {
                // focuses: [],
                sectors: [],
                locations: [],
                affectedGroups: [],
            },
        };
    }

    const schemaFields = {
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
                            aryTemplateMethodology
                                .map(group => group.fields)
                                .flat()
                                // Only show data collection technique
                                .filter(isDataCollectionTechniqueColumn),
                            field => field.id,
                            field => createFieldSchema(field),
                        ),
                    },
                },
                default: {
                    fields: {
                        key: [],
                        ...listToMap(
                            aryTemplateMethodology
                                .map(group => group.fields)
                                .flat(),
                            field => field.id,
                            field => createFieldSchema(field),
                        ),
                    },
                },
            },
            /*
            validation: (value) => {
                const errors = [];
                if (!value || value.length < 1) {
                    // FIXME: Use strings
                    errors.push('There should be at least one item.');
                }
                return errors;
            },
            */
        },

        focuses: [],
        sectors: [],
        locations: [],
        affectedGroups: [],

        objectives: [],
        dataCollectionTechniques: [],
        sampling: [],
        limitations: [],
        protectionInfo: [],
    };

    if (showProtectionInfo) {
        return {
            fields: {
                ...schemaFields,
                protectionInfo: [],
            },
        };
    }

    return {
        fields: {
            ...schemaFields,
        },
    };
};

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
                    (sector) => {
                        if (isUseCriteria(method, sector.id)) {
                            return 'use-criteria';
                        }
                        return `sector-${sector.id}`;
                    },
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

export const createSchema = (
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
    showProtectionInfo,
) => {
    const schema = { fields: {
        metadata: createMetadataSchema(aryTemplateMetadata),
        methodology: createMethodologySchema(aryTemplateMethodology, false, showProtectionInfo),
        summary: createSummarySchema(focuses, selectedSectors, selectedFocuses),
        score: createScoreSchema(scorePillars, scoreMatrixPillars, selectedSectors),
    } };

    if (showHNO || showCNA) {
        schema.fields.questionnaire = { fields: {} };
        if (showHNO) {
            schema.fields.questionnaire.fields.hno = createQuestionnaireSchema(aryTemplateQuestionnaire, 'hno');
        }
        if (showCNA) {
            schema.fields.questionnaire.fields.cna = createQuestionnaireSchema(aryTemplateQuestionnaire, 'cna');
        }
    }

    return schema;
};

const createScoreComputeSchema = (
    scorePillars = [],
    scoreMatrixPillars = [],
    scoreScales = [],
    scoreBuckets = [],
) => {
    if (scoreScales.length <= 0) {
        return {};
    }
    return {
        fields: {
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
        },
    };
};

const createQuestionnaireComputeSchema = (aryTemplateQuestionnaire, method) => {
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
                (sector) => {
                    if (isUseCriteria(method, sector.id)) {
                        return 'use-criteria';
                    }
                    return `sector-${sector.id}`;
                },
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

export const createComputeSchema = (
    scorePillars = [],
    scoreMatrixPillars = [],
    scoreScales = [],
    scoreBuckets = [],
    aryTemplateQuestionnaire,
    showHNO,
    showCNA,
) => {
    const schema = {
        fields: {
            score: createScoreComputeSchema(
                scorePillars,
                scoreMatrixPillars,
                scoreScales,
                scoreBuckets,
            ),
        },
    };

    if (showHNO || showCNA) {
        schema.fields.questionnaire = { fields: {} };
        if (showHNO) {
            schema.fields.questionnaire.fields.hno = createQuestionnaireComputeSchema(
                aryTemplateQuestionnaire,
                'hno',
            );
        }
        if (showCNA) {
            schema.fields.questionnaire.fields.cna = createQuestionnaireComputeSchema(
                aryTemplateQuestionnaire,
                'cna',
            );
        }
    }

    return schema;
};
