import { createSelector } from 'reselect';
import {
    requiredCondition,
    dateCondition,
} from '@togglecorp/faram';
import {
    median,
    sum,
    bucket,
    isTruthy,
    decodeDate,
    isNotDefined,
    isDefined,
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
    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,
} from '../domainData/props-with-state';

const emptyObject = {};
const emptyList = [];

// FIXME: copy this to common place
const getNamespacedId = (leadId, leadGroupId) => {
    if (isTruthy(leadGroupId)) {
        return `lead-group-${leadGroupId}`;
    } else if (isTruthy(leadId)) {
        return `lead-${leadId}`;
    }
    return undefined;
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


// helpers

const createFieldSchema = (field, shouldBeOptional) => {
    const {
        isRequired: isRequiredFromField,
        fieldType,
        title,
    } = field;
    const isRequired = isRequiredFromField && !shouldBeOptional;
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
    /*
    const {
        bothPageRequiredCondition,
        validPageRangeCondition,
        validPageNumbersCondition,
        pendingCondition,
    } = Baksa;
    */

    const schema = { fields: {
        executiveSummary: [
            /*
            bothPageRequiredCondition,
            validPageRangeCondition,
            validPageNumbersCondition,
            pendingCondition,
            */
        ],
        assessmentData: [
        /*
        pendingCondition
        */],
        questionnaire: [/*
            bothPageRequiredCondition,
            validPageRangeCondition,
            validPageNumbersCondition,
            pendingCondition,
        */],
        misc: [],
    } };
    return schema;
};

const createBasicInformationSchema = (aryTemplateMetadata = {}) => {
    // Dynamic fields from metadataGroup
    const dynamicFields = {};
    Object.keys(aryTemplateMetadata).forEach((key) => {
        aryTemplateMetadata[key].fields.forEach((field) => {
            dynamicFields[field.id] = createFieldSchema(field);
        });
    });

    const schema = { fields: dynamicFields };
    return schema;
};

export const isDataCollectionTechniqueColumn = field => (
    field.title.toLowerCase().trim() === 'data collection technique'
);

// NOTE:
export const getDataCollectionTechnique = (aryTemplateMethodology) => {
    let dataCollectionTechnique;
    aryTemplateMethodology.some(
        group => group.fields.some((field) => {
            if (isDataCollectionTechniqueColumn(field)) {
                dataCollectionTechnique = field;
                return true;
            }
            return false;
        }),
    );
    return dataCollectionTechnique;
};

// NOTE:
export const isSecondaryDataReviewOption = option => (
    option && option.label.toLowerCase().trim() === 'secondary data review'
);

const createMethodologySchema = (aryTemplateMethodology = {}) => {
    const dataCollectionTechnique = getDataCollectionTechnique(aryTemplateMethodology);

    const schema = { fields: {
        attributes: {
            keySelector: d => d.key,
            identifier: (value = {}) => {
                if (!dataCollectionTechnique) {
                    return 'default';
                }
                const key = value[dataCollectionTechnique.id];
                if (!key) {
                    return 'default';
                }
                const selectedOption = dataCollectionTechnique.options.find(
                    option => option.key === key,
                );
                return isSecondaryDataReviewOption(selectedOption) ? 'secondaryDataReview' : 'default';
            },
            member: {
                secondaryDataReview: {
                    fields: {/* NOTE: injected here */},
                },
                default: {
                    fields: {/* NOTE: injected here */},
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
    } };

    const dynamicFields = {};
    Object.keys(aryTemplateMethodology).forEach((key) => {
        const methodologyGroup = aryTemplateMethodology[key];
        methodologyGroup.fields.forEach((field) => {
            dynamicFields[field.id] = createFieldSchema(field);
        });
    });
    schema.fields.attributes.member.default.fields = dynamicFields;

    const anotherDynamicFields = {};
    Object.keys(aryTemplateMethodology).forEach((key) => {
        const methodologyGroup = aryTemplateMethodology[key];
        methodologyGroup.fields.forEach((field) => {
            const shouldBeOptional = dataCollectionTechnique.id !== anotherDynamicFields.id;
            anotherDynamicFields[field.id] = createFieldSchema(field, shouldBeOptional);
        });
    });
    schema.fields.attributes.member.secondaryDataReview.fields = anotherDynamicFields;

    return schema;
};

const createSummarySchema = (sectors = []) => {
    const schemaForSubRow = {
        fields: {
            moderateAssistancePopulation: [],
            severeAssistancePopulation: [],
            assistancePopulation: [],
        },
    };

    const schemaForRow = {
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
        fields: {
            rank1: schemaForSubRow,
            rank2: schemaForSubRow,
            rank3: schemaForSubRow,
        },
    };

    const schema = {
        fields: {
            crossSector: {
                fields: {
                    prioritySectors: schemaForRow,
                    affectedGroups: schemaForRow,
                    specificNeedGroups: schemaForRow,
                },
            },
            humanitarianAccess: {
                fields: {
                    priorityIssue: schemaForRow,
                    affectedLocation: schemaForRow,
                },
            },
        },
    };
    sectors.forEach((sector) => {
        schema.fields[`sector-${sector}`] = {
            fields: {
                outcomes: schemaForRow,
                underlyingFactors: schemaForRow,
                affectedGroups: schemaForRow,
                specificNeedGroups: schemaForRow,
            },
        };
    });
    return schema;
};


export const assessmentSchemaSelector = createSelector(
    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,
    editArySelectedSectorsSelector,
    (
        aryTemplateMetadata,
        aryTemplateMethodology,
        scorePillars,
        scoreMatrixPillars,
        selectedSectors,
    ) => {
        const schema = { fields: {
            metadata: {
                fields: {
                    basicInformation: createBasicInformationSchema(aryTemplateMetadata),
                    additionalDocuments: createAdditionalDocumentsSchema(),
                },
            },
            methodology: createMethodologySchema(aryTemplateMethodology),
            summary: createSummarySchema(selectedSectors),
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

