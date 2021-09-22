import {
    ObjectSchema,
    requiredStringCondition,
    requiredCondition,
    PartialForm,
    urlCondition,
    defaultUndefinedType,
    defaultEmptyArrayType,
} from '@togglecorp/toggle-form';

import {
    LeadEmmTriggerInputType,
    EmmEntityInputType,
    LeadInputType,
} from '#generated/types';
import { EnumFix } from '#utils/types';

import {
    KeyValueElement,
} from '#types';

export interface EmmEntityOption {
    key: number;
    label: string;
    totalCount: number;
}

export type EmmTrigger = LeadEmmTriggerInputType;

export type EmmEntity = EmmEntityInputType;

export type Lead = EnumFix<LeadInputType, 'priority'>;

export type PartialFormType = PartialForm<
    Lead,
    'emmEntities' | 'emmTriggers' | 'confidentiality' | 'attachment' | 'mimeType'
>;
export type FormSchema = ObjectSchema<PartialFormType>;
export type FormSchemaFields = ReturnType<FormSchema['fields']>;

export interface Priority {
    key: number;
    value: string;
}

export interface LeadOptions {
    status: KeyValueElement[];
    projects: {
        id: number;
        title: string;
    }[];
    members: {
        id: number;
        displayName: string;
    }[];
    leadGroups: {
        id: number;
        title: string;
    }[];
    priority: Priority[];
    confidentiality: KeyValueElement[];
    organizations: {
        id: number;
        title: string;
        shortName: string;
        mergedAs: {
            id: number;
            title: string;
        };
    }[];
    hasEmmLeads: boolean;
    emmEntities?: EmmEntityOption[];
    emmRiskFactors?: EmmEntityOption[];
    emmKeywords?: EmmEntityOption[];
}

export const schema:FormSchema = {
    fields: (value): FormSchemaFields => {
        let baseSchema: FormSchemaFields = {
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
