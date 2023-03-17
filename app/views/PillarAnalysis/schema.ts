import {
    ObjectSchema,
    PartialForm,
    ArraySchema,
    defaultUndefinedType,
    requiredCondition,
    requiredStringCondition,
    PurgeNull,
} from '@togglecorp/toggle-form';
import {
    AnalysisPillarUpdateInputType,
} from '#generated/types';

export type FormType = PurgeNull<AnalysisPillarUpdateInputType>;
export type PartialFormType = PartialForm<FormType, 'clientId'>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

export type AnalyticalStatementType = NonNullable<NonNullable<FormType['statements']>>[number];
export type PartialAnalyticalStatementType = PartialForm<AnalyticalStatementType, 'clientId'>;

export type AnalyticalEntryType = NonNullable<NonNullable<AnalyticalStatementType['entries']>>[number];
export type PartialAnalyticalEntryType = PartialForm<AnalyticalEntryType, 'clientId'>;

type AnalyticalEntrySchema = ObjectSchema<PartialAnalyticalEntryType, PartialFormType>;
type AnalyticalEntrySchemaFields = ReturnType<AnalyticalEntrySchema['fields']>;
const analyticalEntrySchema: AnalyticalEntrySchema = {
    fields: (): AnalyticalEntrySchemaFields => ({
        id: [defaultUndefinedType],
        clientId: [],
        order: [],
        entry: [requiredCondition],
    }),
};

type AnalyticalEntriesSchema = ArraySchema<PartialAnalyticalEntryType, PartialFormType>;
type AnalyticalEntriesSchemaMember = ReturnType<AnalyticalEntriesSchema['member']>;
const analyticalEntriesSchema: AnalyticalEntriesSchema = {
    keySelector: (col) => col.clientId ?? '',
    member: (): AnalyticalEntriesSchemaMember => analyticalEntrySchema,
};

type AnalyticalStatementSchema = ObjectSchema<PartialAnalyticalStatementType, PartialFormType>;
type AnalyticalStatementSchemaFields = ReturnType<AnalyticalStatementSchema['fields']>;
const analyticalStatementSchema: AnalyticalStatementSchema = {
    fields: (): AnalyticalStatementSchemaFields => ({
        id: [defaultUndefinedType],
        clientId: [],
        order: [requiredCondition],
        clonedFrom: [],
        statement: [requiredStringCondition],
        includeInReport: [requiredCondition],
        entries: analyticalEntriesSchema,
    }),
};

type AnalyticalStatementsSchema = ArraySchema<PartialAnalyticalStatementType, PartialFormType>;
type AnalyticalStatementsSchemaMember = ReturnType<AnalyticalStatementsSchema['member']>;
const analyticalStatementsSchema: AnalyticalStatementsSchema = {
    keySelector: (col) => col.clientId ?? '',
    member: (): AnalyticalStatementsSchemaMember => analyticalStatementSchema,
};

export const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        mainStatement: [],
        informationGap: [],
        statements: analyticalStatementsSchema,
    }),
};

export const defaultFormValues: PartialFormType = {};
