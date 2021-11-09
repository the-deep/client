import {
    ObjectSchema,
    ArraySchema,
    PartialForm,
} from '@togglecorp/toggle-form';
import { SourcesFilterFields } from './types';

type FormType = SourcesFilterFields;
export type PartialFormType = PartialForm<FormType, 'filterKey'>;
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
        commentStatus: [],
        controlled: [],
        createdAtGte: [],
        createdAtLte: [],
        createdBy: [],
        entryTypes: [],
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
        exists: [],
        priorities: [],
        customFilters: [],
        authoringOrganizationTypes: [],
        confidentiality: [],
        entriesFilterData: entriesFilterDataSchema,
    }),
};
export default schema;
