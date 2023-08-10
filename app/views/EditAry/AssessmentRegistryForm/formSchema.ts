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
} from '#generated/types';
import {
    DeepMandatory,
} from '#utils/types';

export type BasicProjectOrganization = PurgeNull<ProjectOrganizationGqInputType>;
type AssessmentRegistryType = DeepMandatory<PurgeNull<AssessmentRegistryCreateInputType>, 'clientId'>;

export type PartialFormType = PartialForm<AssessmentRegistryType, 'clientId' | 'question' | 'sector'>;

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

export const initialValue: PartialFormType = {
    methodologyAttributes: [
        { clientId: randomString() },
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
            leadOrganizations: [defaultEmptyArrayType],
            internationalPartners: [defaultEmptyArrayType],
            donors: [defaultEmptyArrayType],
            nationalPartners: [defaultEmptyArrayType],
            governments: [defaultEmptyArrayType],

            // NOTE: uncomment on other form
            sectors: [],
            protectionInfoMgmts: [defaultEmptyArrayType],
            focuses: [],
            affectedGroups: [],
            locations: [defaultEmptyArrayType],
            limitations: [requiredCondition],
            objectives: [requiredCondition],
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
