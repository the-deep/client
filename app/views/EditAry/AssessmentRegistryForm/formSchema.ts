import {
    ArraySchema,
    defaultEmptyArrayType,
    ObjectSchema,
    PartialForm,
    defaultUndefinedType,
    PurgeNull,
    requiredCondition,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';
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

export type PartialFormType = PartialForm<AssessmentRegistryType, 'clientId' | 'question' | 'sector' | 'organization' | 'organizationType'>;

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
type SubDimensionIssuesFormSchemMember = ReturnType<SubDimensionIssuesSchema['member']>;

export type SubPillarMetaInputType = NonNullable<PartialFormType['summaryDimensionMeta']>[number];
type SubPillarMetaSchema = ObjectSchema<SubPillarMetaInputType, PartialFormType>;
type SubPillarMetaSchemaFields = ReturnType<SubPillarMetaSchema['fields']>;
type SubPillarMetasFormSchema = ArraySchema<SubPillarMetaInputType, PartialFormType>;
type SubPillarMetasFormSchemaMember = ReturnType<SubPillarMetasFormSchema['member']>;

export type SubDimensionMetaInputType = NonNullable<PartialFormType['summaryDimensionMeta']>[number];
// TODO
// type SubDimensionMetaSchema = ObjectSchema<SubDimensionMetaInputType, PartialFormType>;
// type SubDimensionMetaSchemaFields = ReturnType<SubDimensionMetaSchema['fields']>;
// type SubDimensionMetasFormSchema = ArraySchema<SubDimensionMetaInputType, PartialFormType>;
// type SubDimensionMetasFormSchemaMember = ReturnType<SubDimensionMetasFormSchema['member']>;

export const initialValue: PartialFormType = {
    methodologyAttributes: [
        { clientId: randomString() },
    ],
    summaryDimensionMeta: [
        { clientId: randomString(), totalPeopleAffected: 0 },
    ],
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
            sectors: [],
            protectionInfoMgmts: [defaultEmptyArrayType],
            focuses: [],
            affectedGroups: [],
            locations: [defaultEmptyArrayType],
            limitations: [requiredCondition],
            objectives: [requiredCondition],
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
                    fields: (): MethodologyAttributesSchemaFields => ({
                        id: [defaultUndefinedType],
                        clientId: [requiredCondition],
                        dataCollectionTechnique: [requiredCondition],
                        samplingApproach: [requiredCondition],
                        samplingSize: [requiredCondition],
                        proximity: [requiredCondition],
                        unitOfAnalysis: [requiredCondition],
                        unitOfReporting: [requiredCondition],
                    }),
                }),
            },
            executiveSummary: [],
            additionalDocuments: [defaultEmptyArrayType],
            scoreRatings: {
                keySelector: (score) => score.clientId,
                member: (): ScoreRatingsFormSchemaMember => ({
                    fields: (): ScoreRatingsSchemaFields => ({
                        clientId: [requiredCondition],
                        rating: [],
                        reason: [],
                        scoreType: [],
                    }),
                }),
            },
            scoreAnalyticalDensity: {
                keySelector: (density) => density.clientId,
                member: (): ScoreAnalyticalDensityFormSchemaMember => ({
                    fields: (): ScoreAnalyticalDensitySchemaFields => ({
                        clientId: [requiredCondition],
                        analysisLevelCovered: [],
                        figureProvided: [],
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
                        clientId: [requiredCondition],
                        summaryIssue: [requiredCondition],
                        text: [requiredCondition],
                        order: [requiredCondition],
                    }),
                }),
            },
            summaryPillarMeta: [requiredCondition],
            summarySubDimensionIssue: {
                keySelector: (issue) => issue.clientId,
                member: (): SubDimensionIssuesFormSchemMember => ({
                    fields: (): SubDimensionIssueSchemaFields => ({
                        clientId: [],
                        sector: [],
                        summaryIssue: [],
                        order: [],
                        text: [],
                    }),
                }),
            },

            // TODO uncomment on dimension
            // summaryDimensionMeta: {
            //     keySelector: (dimensionMeta) => dimensionMeta.clientId,
            //     member: (): SubDimensionMetasFormSchemaMember => ({
            //         fields: (): SubDimensionMetaSchemaFields => ({
            //             clientId: [requiredCondition],
            //             focus: [],
            //             percentageOfPeopleAffected: [],
            //             totalPeopleAffected: [],
            //             percentageOfModerate: [],
            //             percentageOfSevere: [],
            //             percentageOfCritical: [],
            //             percentageInNeed: [],
            //             totalModerate: [],
            //             totalSevere: [],
            //             totalCritical: [],
            //             totalInNeed: [],

            //         }),
            //     }),
            // },
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
