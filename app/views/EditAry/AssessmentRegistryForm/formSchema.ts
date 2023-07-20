import {
    ArraySchema,
    defaultEmptyArrayType,
    ObjectSchema,
    PartialForm,
    PurgeNull,
    requiredCondition,
} from '@togglecorp/toggle-form';
import {
    AssessmentRegistryCreateInputType,
    ProjectOrganizationGqInputType,
} from '#generated/types';
import {
    DeepMandatory,
    EnumFix,
} from '#utils/types';

export type BasicProjectOrganization = PurgeNull<ProjectOrganizationGqInputType>;
type AssessmentRegistryType = PurgeNull<AssessmentRegistryCreateInputType>;

export type PartialFormType = DeepMandatory<PartialForm<EnumFix<AssessmentRegistryType,
    'bgCrisisType' | 'bgPreparedness' | 'externalSupport' | 'coordinatedJoint'
    | 'detailsType' | 'family' | 'frequency' | 'confidentiality' | 'language'
    | 'dataCollectionTechnique' | 'samplingApproach' | 'proximity' | 'unitOfAnalysis' | 'unitOfReporting'
>>, 'clientId'>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

export type MethodologyAttributesType = NonNullable<PartialFormType['methodologyAttributes']>[number];
type MethodologyAttributesSchema = ObjectSchema<MethodologyAttributesType, PartialFormType>;
type MethodologyAttributesSchemaFields = ReturnType<MethodologyAttributesSchema['fields']>;

type MethodologyAttributesFormSchema = ArraySchema<MethodologyAttributesType, PartialFormType>;
type MethodologyAttributesFormSchemaMember = ReturnType<MethodologyAttributesFormSchema['member']>;

export const initialValue: PartialFormType = {};
export const schema: FormSchema = {
    fields: (): FormSchemaFields => {
        const baseSchema: FormSchemaFields = {
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
            locations: [defaultEmptyArrayType],
            limitations: [requiredCondition],
            objectives: [requiredCondition],
            methodologyAttributes: {
                keySelector: (attribute) => attribute.clientId,
                member: (): MethodologyAttributesFormSchemaMember => ({
                    fields: (): MethodologyAttributesSchemaFields => ({
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
        };

        return baseSchema;
    },
    validation: () => undefined,
};
