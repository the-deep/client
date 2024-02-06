import {
    ArraySchema,
    defaultEmptyArrayType,
    ObjectSchema,
    forceNullType,
    PartialForm,
    defaultUndefinedType,
    PurgeNull,
    requiredCondition,
} from '@togglecorp/toggle-form';
import { randomString, isDefined } from '@togglecorp/fujs';
import {
    AssessmentRegistryCreateInputType,
    ProjectOrganizationGqInputType,
    SummaryIssueSearchQuery,
} from '#generated/types';
import {
    DeepMandatory,
} from '#utils/types';

export interface SubPillarIssueInputType {
    summaryIssue: string;
    order: string;
    text?: string;
}

export type SubPillarIssuesMapType = Record<string, NonNullable<PartialFormType['summarySubPillarIssue']>[number]>;
export type SubDimensionIssuesMapType = Record<string, NonNullable<PartialFormType['summarySubDimensionIssue']>[number]>;
export type SummaryIssueType = NonNullable<NonNullable<SummaryIssueSearchQuery['assessmentRegSummaryIssues']>['results']>[number];

export interface Option {
    id: string;
    label: string;
}

export type BasicProjectOrganization = PurgeNull<ProjectOrganizationGqInputType>;
type AssessmentRegistryType = DeepMandatory<PurgeNull<AssessmentRegistryCreateInputType>, 'clientId'>;

export type PartialFormType = PartialForm<AssessmentRegistryType, 'clientId'>;

export type PartialAdditionalDocument = NonNullable<PartialFormType['additionalDocuments']>[number];

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

export type CnaType = NonNullable<PartialFormType['cna']>[number];
export type ScoreRatingsType = NonNullable<PartialFormType['scoreRatings']>[number];
type ScoreRatingsSchema = ObjectSchema<ScoreRatingsType, PartialFormType>;
type ScoreRatingsSchemaFields = ReturnType<ScoreRatingsSchema['fields']>;

type ScoreRatingsFormSchema = ArraySchema<ScoreRatingsType, PartialFormType>;
type ScoreRatingsFormSchemaMember = ReturnType<ScoreRatingsFormSchema['member']>;

export type ScoreAnalyticalDensityType = NonNullable<PartialFormType['scoreAnalyticalDensity']>[number];
type ScoreAnalyticalDensitySchema = ObjectSchema<ScoreAnalyticalDensityType, PartialFormType>;
type ScoreAnalyticalDensitySchemaFields = ReturnType<ScoreAnalyticalDensitySchema['fields']>;

type ScoreAnalyticalDensityFormSchema = ArraySchema<ScoreAnalyticalDensityType, PartialFormType>;
type ScoreAnalyticalDensityFormSchemaMember = ReturnType<ScoreAnalyticalDensityFormSchema['member']>;

export type MethodologyAttributesType = NonNullable<PartialFormType['methodologyAttributes']>[number];
type MethodologyAttributesSchema = ObjectSchema<MethodologyAttributesType, PartialFormType>;
type MethodologyAttributesSchemaFields = ReturnType<MethodologyAttributesSchema['fields']>;
type MethodologyAttributesFormSchema = ArraySchema<MethodologyAttributesType, PartialFormType>;
type MethodologyAttributesFormSchemaMember = ReturnType<MethodologyAttributesFormSchema['member']>;

type PartialOrganizationType = NonNullable<PartialFormType['stakeholders']>[number];
type OrganizationsSchema = ObjectSchema<PartialOrganizationType, PartialFormType>;
type OrganizationsSchemaFields = ReturnType<OrganizationsSchema['fields']>;
type OrganizationsListSchema = ArraySchema<PartialOrganizationType, PartialFormType>;
type OrganizationsListMember = ReturnType<OrganizationsListSchema['member']>;

export type SubPillarIssueType = NonNullable<PartialFormType['summarySubPillarIssue']>[number];
type SubPillarIssueSchema = ObjectSchema<SubPillarIssueType, PartialFormType>;
type SubPillarIssueSchemaFields = ReturnType<SubPillarIssueSchema['fields']>;
type SubPillarIssuesFormSchema = ArraySchema<SubPillarIssueType, PartialFormType>;
type SubPillarIssuesFormSchemaMember = ReturnType<SubPillarIssuesFormSchema['member']>;

export type SubDimensionIssueType = NonNullable<PartialFormType['summarySubDimensionIssue']>[number];
type SubDimensionIssueSchema = ObjectSchema<SubDimensionIssueType, PartialFormType>;
type SubDimensionIssueSchemaFields = ReturnType<SubDimensionIssueSchema['fields']>;
type SubDimensionIssuesSchema = ArraySchema<SubDimensionIssueType, PartialFormType>;
type SubDimensionIssuesFormSchemaMember = ReturnType<SubDimensionIssuesSchema['member']>;

export type SubPillarMetaInputType = NonNullable<PartialFormType['summaryPillarMeta']>;
type SubPillarMetaSchema = ObjectSchema<SubPillarMetaInputType, PartialFormType>;
type SubPillarMetaSchemaFields = ReturnType<SubPillarMetaSchema['fields']>;

export type SubDimensionMetaInputType = NonNullable<PartialFormType['summaryDimensionMeta']>[number];

type SubDimensionMetaSchema = ObjectSchema<SubDimensionMetaInputType, PartialFormType>;
type SubDimensionMetaSchemaFields = ReturnType<SubDimensionMetaSchema['fields']>;
type SubDimensionMetasFormSchema = ArraySchema<SubDimensionMetaInputType, PartialFormType>;
type SubDimensionMetasFormSchemaMember = ReturnType<SubDimensionMetasFormSchema['member']>;

export const initialValue: PartialFormType = {
    methodologyAttributes: [
        { clientId: randomString() },
    ],
    summaryDimensionMeta: [],
};

export const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        let baseSchema: FormSchemaFields = {
            bgCountries: [requiredCondition],
            bgCrisisType: [requiredCondition],
            bgCrisisStartDate: [requiredCondition],
            bgPreparedness: [requiredCondition],
            externalSupport: [requiredCondition],
            coordinatedJoint: [requiredCondition],
            detailsType: [requiredCondition],
            family: [requiredCondition],
            frequency: [requiredCondition],
            confidentiality: [requiredCondition],
            language: [requiredCondition],
            noOfPages: [],
            dataCollectionStartDate: [],
            dataCollectionEndDate: [],
            publicationDate: [],
            sectors: [defaultEmptyArrayType],
            protectionInfoMgmts: [defaultEmptyArrayType],
            focuses: [defaultEmptyArrayType],
            affectedGroups: [defaultEmptyArrayType],
            locations: [defaultEmptyArrayType],
            limitations: [],
            objectives: [],
            stakeholders: {
                keySelector: (org) => org.clientId,
                member: (): OrganizationsListMember => ({
                    fields: (): OrganizationsSchemaFields => ({
                        id: [defaultUndefinedType],
                        clientId: [requiredCondition],
                        organization: [],
                        organizationType: [],
                    }),
                }),
            },
            methodologyAttributes: {
                keySelector: (attribute) => attribute.clientId,
                member: (): MethodologyAttributesFormSchemaMember => ({
                    fields: (methodology): MethodologyAttributesSchemaFields => {
                        if (methodology?.dataCollectionTechnique === 'SECONDARY_DATA_REVIEW') {
                            return ({
                                id: [defaultUndefinedType],
                                clientId: [requiredCondition],
                                dataCollectionTechnique: [requiredCondition],
                                samplingApproach: [forceNullType],
                                samplingSize: [forceNullType],
                                proximity: [forceNullType],
                                unitOfAnalysis: [forceNullType],
                                unitOfReporting: [forceNullType],
                            });
                        }
                        return ({
                            id: [defaultUndefinedType],
                            clientId: [requiredCondition],
                            dataCollectionTechnique: [requiredCondition],
                            samplingApproach: [],
                            samplingSize: [],
                            proximity: [],
                            unitOfAnalysis: [],
                            unitOfReporting: [],
                        });
                    },
                }),
            },
            executiveSummary: [],
            additionalDocuments: [defaultEmptyArrayType],
            scoreRatings: {
                keySelector: (score) => score.clientId,
                member: (): ScoreRatingsFormSchemaMember => ({
                    fields: (scoreValue): ScoreRatingsSchemaFields => {
                        if (isDefined(scoreValue?.rating) || isDefined(scoreValue?.reason)) {
                            return ({
                                id: [defaultUndefinedType],
                                clientId: [requiredCondition],
                                rating: [requiredCondition],
                                reason: [requiredCondition],
                                scoreType: [],
                            });
                        }
                        return ({
                            id: [defaultUndefinedType],
                            clientId: [requiredCondition],
                            rating: [],
                            reason: [],
                            scoreType: [],
                        });
                    },
                }),
            },
            scoreAnalyticalDensity: {
                keySelector: (density) => density.clientId,
                member: (): ScoreAnalyticalDensityFormSchemaMember => ({
                    fields: (): ScoreAnalyticalDensitySchemaFields => ({
                        id: [defaultUndefinedType],
                        clientId: [requiredCondition],
                        analysisLevelCovered: [defaultEmptyArrayType],
                        figureProvided: [defaultEmptyArrayType],
                        sector: [],
                    }),
                }),
            },
            cna: {
                keySelector: (cna) => cna.clientId,
                member: () => ({
                    fields: () => ({
                        id: [defaultUndefinedType],
                        clientId: [requiredCondition],
                        question: [requiredCondition],
                        answer: [requiredCondition],
                    }),
                }),
            },
            summarySubPillarIssue: {
                keySelector: (issue) => issue.clientId,
                member: (): SubPillarIssuesFormSchemaMember => ({
                    fields: (): SubPillarIssueSchemaFields => ({
                        id: [defaultUndefinedType],
                        clientId: [requiredCondition],
                        summaryIssue: [requiredCondition],
                        text: [requiredCondition],
                        order: [requiredCondition],
                    }),
                }),
            },
            summaryPillarMeta: {
                fields: (): SubPillarMetaSchemaFields => ({
                    id: [defaultUndefinedType],
                    totalPeopleAssessed: [],
                    totalDead: [],
                    totalInjured: [],
                    totalMissing: [],
                    percentageOfPeopleFacingHumAccessCons: [],
                    totalPeopleFacingHumAccessCons: [],
                }),
            },
            summarySubDimensionIssue: {
                keySelector: (issue) => issue.clientId,
                member: (): SubDimensionIssuesFormSchemaMember => ({
                    fields: (): SubDimensionIssueSchemaFields => ({
                        id: [defaultUndefinedType],
                        clientId: [requiredCondition],
                        summaryIssue: [requiredCondition],
                        text: [requiredCondition],
                        sector: [requiredCondition],
                        order: [requiredCondition],
                    }),
                }),
            },
            summaryDimensionMeta: {
                keySelector: (dimensionMeta) => dimensionMeta.clientId,
                member: (): SubDimensionMetasFormSchemaMember => ({
                    fields: (): SubDimensionMetaSchemaFields => ({
                        id: [defaultUndefinedType],
                        clientId: [requiredCondition],
                        sector: [requiredCondition],
                        percentageOfPeopleAffected: [],
                        totalPeopleAffected: [],
                        percentageOfModerate: [],
                        percentageOfSevere: [],
                        percentageOfCritical: [],
                        percentageInNeed: [],
                        totalModerate: [],
                        totalSevere: [],
                        totalCritical: [],
                        totalInNeed: [],

                    }),
                }),
            },
        };
        if (value?.sectors?.some((sector) => sector === 'PROTECTION')) {
            baseSchema = {
                ...baseSchema,
                protectionInfoMgmts: [],
            };
        }

        return baseSchema;
    },
    validation: () => undefined,
};
