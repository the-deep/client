import {
    ArraySchema,
    ObjectSchema,
    requiredStringCondition,
    requiredCondition,
    PartialForm,
    urlCondition,
    defaultUndefinedType,
    defaultEmptyArrayType,
} from '@togglecorp/toggle-form';

import { LeadInputType } from '#generated/types';

import {
    DeepMandatory,
    EnumFix,
} from '#utils/types';

export type Lead = EnumFix<LeadInputType, 'priority' | 'confidentiality'>;

type BulkLead = DeepMandatory<Lead, 'clientId'>;
type FormType = {
    leads: BulkLead[];
}

export type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'emmEntities' | 'emmTriggers' | 'confidentiality' | 'attachment' | 'mimeType'
>

export type PartialLeadType = NonNullable<PartialFormType['leads']>[number];

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type LeadsSchema = ArraySchema<PartialLeadType, PartialFormType>;
type LeadsSchemaMember = ReturnType<LeadsSchema['member']>;

export type LeadFormSchema = ObjectSchema<PartialLeadType, PartialFormType>;
export type LeadFormSchemaFields = ReturnType<LeadFormSchema['fields']>;

export const leadSchema:LeadFormSchema = {
    fields: (value): LeadFormSchemaFields => {
        let baseSchema: LeadFormSchemaFields = {
            clientId: [],
            id: [defaultUndefinedType],
            assignee: [requiredCondition],
            authors: [defaultEmptyArrayType],
            confidentiality: [requiredCondition],
            isAssessmentLead: [],
            leadGroup: [],
            priority: [requiredCondition],
            publishedOn: [requiredCondition],
            source: [requiredCondition],
            sourceType: [requiredCondition],
            title: [requiredStringCondition],
            emmEntities: [defaultEmptyArrayType],
            emmTriggers: [defaultEmptyArrayType],

            connectorLead: [],
            // NOTE: We are not adding forceNullType here, as it is not the behavior in server
            /*
            url: [forceNullType],
            website: [forceNullType],
            text: [forceNullType],
            attachment: [forceNullType],
            */
        };
        if (value?.sourceType === 'WEBSITE') {
            baseSchema = {
                ...baseSchema,
                url: [requiredCondition, urlCondition],
                website: [requiredCondition],
            };
        } else if (value?.sourceType === 'TEXT') {
            baseSchema = {
                ...baseSchema,
                text: [requiredStringCondition],
            };
        } else {
            baseSchema = {
                ...baseSchema,
                attachment: [requiredCondition],
            };
        }
        return baseSchema;
    },
};

const leadsSchema: LeadsSchema = {
    keySelector: (col) => col.clientId,
    member: (): LeadsSchemaMember => leadSchema,
};

export const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        leads: leadsSchema,
    }),
};

export const defaultFormValues: PartialFormType = {
    leads: [],
};

export default schema;
