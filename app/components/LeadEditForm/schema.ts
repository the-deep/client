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
    KeyValueElement,
} from '#types';

import { MimeTypes } from '#components/LeadPreview/Preview/mimeTypes';

export type LeadSourceType = 'text' | 'disk' | 'website' |
    'dropbox' | 'google-drive' | 'rss-feed' | 'emm' | 'web-api' | 'unknown';

export interface EmmEntityOption {
    key: number;
    label: string;
    totalCount: number;
}

export interface EmmTrigger {
    emmKeyword: string;
    emmRiskFactor?: string;
    count: number;
}

export interface EmmEntity {
    name: string;
}

export interface Lead {
    // TODO: Handle case where assignee can be multiple
    id?: number;
    assignee: number;
    authorRaw?: string;
    authors?: [number];
    confidentiality: 'unprotected' | 'confidential';
    isAssessmentLead: boolean;
    emmEntities?: EmmEntity[];
    emmTriggers?: EmmTrigger[];
    leadGroup?: number;
    priority: number;
    project: number;
    publishedOn: string;
    source: number;
    sourceRaw?: string;
    sourceType: LeadSourceType;
    text?: string;
    title: string;
    url?: string;
    website?: string;
    attachment?: {
        id: number;
        title: string;
        file: string;
        mimeType: MimeTypes;
    };
}

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
            project: [requiredCondition],
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
        if (value?.sourceType === 'website') {
            baseSchema = {
                ...baseSchema,
                url: [requiredCondition, urlCondition],
                website: [requiredCondition],
            };
        } else if (value?.sourceType === 'text') {
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
