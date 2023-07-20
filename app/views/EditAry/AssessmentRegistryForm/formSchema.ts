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
    EnumFix,
} from '#utils/types';

export type BasicProjectOrganization = PurgeNull<ProjectOrganizationGqInputType>;
type AssessmentRegistryType = DeepMandatory<PurgeNull<AssessmentRegistryCreateInputType>, 'clientId'>;

export type PartialFormType = PartialForm<EnumFix<AssessmentRegistryType,
    'bgCrisisType' | 'bgPreparedness' | 'externalSupport' | 'coordinatedJoint'
    | 'detailsType' | 'family' | 'frequency' | 'confidentiality' | 'language'
    | 'affectedGroups' | 'sectors' | 'protectionInfoMgmts' | 'focuses'
    | 'dataCollectionTechnique' | 'samplingApproach' | 'proximity' | 'unitOfAnalysis' | 'unitOfReporting'
>, 'clientId' | 'question'>;

export type PartialAdditonalDocument = NonNullable<PartialFormType['additionalDocuments']>[number];
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

<<<<<<< HEAD
export type MethodologyAttributesType = NonNullable<PartialFormType['methodologyAttributes']>[number];
export type CnaType = NonNullable<PartialFormType['cna']>[number];
type MethodologyAttributesSchema = ObjectSchema<MethodologyAttributesType, PartialFormType>;
type MethodologyAttributesSchemaFields = ReturnType<MethodologyAttributesSchema['fields']>;
type MethodologyAttributesFormSchema = ArraySchema<MethodologyAttributesType, PartialFormType>;
type MethodologyAttributesFormSchemaMember = ReturnType<MethodologyAttributesFormSchema['member']>;
=======
export const initialValue: PartialFormType = {};
export const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
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
        executive_summary: [],
>>>>>>> becde54c5 (Add excutive summary textarea)

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
            additionalDocuments: [defaultEmptyArrayType],
            scoreRatings: [defaultEmptyArrayType],
            scoreAnalyticalDensity: [defaultEmptyArrayType],
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
