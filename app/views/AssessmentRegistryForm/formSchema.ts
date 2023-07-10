import {
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
import { EnumFix } from '#utils/types';

export type BasicProjectOrganization = PurgeNull<ProjectOrganizationGqInputType>;

export type PartialFormType = PartialForm<EnumFix<AssessmentRegistryCreateInputType,
    'bgCrisisType'| 'bgPreparedness' | 'externalSupport' | 'coordinatedJoint'
    | 'detailsType' | 'family' | 'frequency' | 'confidentiality' | 'language'
>>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

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
        noOfPages: [requiredCondition],
        dataCollectionStartDate: [],
        dataCollectionEndDate: [],
        publicationDate: [requiredCondition],
        leadOrganizations: [requiredCondition],
        internationalPartners: [requiredCondition],
        donors: [requiredCondition],
        nationalPartners: [requiredCondition],
        governments: [requiredCondition],

        // NOTE: uncomment on other form
        locations: [defaultEmptyArrayType],
        // focuses: [defaultEmptyArrayType],
        // sectors: [defaultEmptyArrayType],
        // protectionInfoMgmts: [defaultEmptyArrayType],
        methodologyAttributes: [defaultEmptyArrayType],
        additionalDocuments: [defaultEmptyArrayType],
        scoreRatings: [defaultEmptyArrayType],
        scoreAnalyticalDensity: [defaultEmptyArrayType],
    }),
    validation: () => undefined,
};
