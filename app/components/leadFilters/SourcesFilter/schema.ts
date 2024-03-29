import {
    ObjectSchema,
    ArraySchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import {
    ProjectDetailTypeLeadsArgs,
} from '#generated/types';

import { SourcesFilterFields } from './types';

export type FormType = ProjectDetailTypeLeadsArgs & { projectId: string };
type FormTypeInternal = SourcesFilterFields;

export type PartialFormType = PartialForm<FormTypeInternal, 'filterKey'>;
export type PartialEntriesFilterDataType = NonNullable<PartialFormType['entriesFilterData']>;

type PartialFrameworkFilterType = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type FrameworkFilterSchema = ObjectSchema<PartialFrameworkFilterType, PartialFormType>;
type FrameworkFilterFields = ReturnType<FrameworkFilterSchema['fields']>;
const frameworkFilterSchema: FrameworkFilterSchema = {
    fields: (): FrameworkFilterFields => ({
        filterKey: [],
        value: [],
        valueList: [],
        valueGte: [],
        valueLte: [],
        includeSubRegions: [],
        useAndOperator: [],
        useExclude: [],
    }),
};
type FrameworkFiltersSchema = ArraySchema<PartialFrameworkFilterType, PartialFormType>;
type FrameworkFiltersMember = ReturnType<FrameworkFiltersSchema['member']>;

const frameworkFiltersSchema: FrameworkFiltersSchema = {
    keySelector: (d) => d.filterKey,
    member: (): FrameworkFiltersMember => frameworkFilterSchema,
};

type EntriesFilterDataSchema = ObjectSchema<PartialEntriesFilterDataType, PartialFormType>;
type EntriesFilterDataFields = ReturnType<EntriesFilterDataSchema['fields']>;
const entriesFilterDataSchema: EntriesFilterDataSchema = {
    fields: (): EntriesFilterDataFields => ({
        controlled: [],
        hasComment: [],
        createdAtLte: [],
        createdAtGte: [],
        createdBy: [],
        entryTypes: [],
        search: [],
        filterableData: frameworkFiltersSchema,
    }),
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        statuses: [],
        createdAtGte: [],
        createdAtLte: [],
        publishedOnGte: [],
        publishedOnLte: [],
        assignees: [],
        search: [],
        priorities: [],
        createdBy: [],
        authoringOrganizationTypes: [],
        confidentiality: [],
        sourceOrganizations: [],
        authorOrganizations: [],
        entriesFilterData: entriesFilterDataSchema,
        hasEntries: [],
        hasAssessment: [],
        isAssessment: [],
    }),
};
export default schema;
