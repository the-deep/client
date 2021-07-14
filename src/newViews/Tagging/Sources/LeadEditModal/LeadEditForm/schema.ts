import {
    ObjectSchema,
    requiredStringCondition,
    requiredCondition,
    PartialForm,
} from '@togglecorp/toggle-form';

import {
    KeyValueElement,
    LeadSourceType,
    EmmEntity,
} from '#typings';

export interface Lead {
    title: string;
    // TODO: Handle case where assignee can be multiple
    assignee: number;
    project: number;
    confidentiality: string;
    priority: number;
    publishedOn: string;
    sourceType: LeadSourceType;
    source: number;
    authors?: [number];

    text?: string;
    url?: string;
    website?: string;
}

export type PartialFormType = PartialForm<Lead>;
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
    leadGroup: KeyValueElement[];
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
    emmEntities?: EmmEntity[];
    emmRiskFactors?: EmmEntity[];
    emmKeywords?: EmmEntity[];
}

export const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        assignee: [requiredCondition],
        source: [requiredCondition],
        authors: [],
        url: [],
        priority: [requiredCondition],
    }),
};
