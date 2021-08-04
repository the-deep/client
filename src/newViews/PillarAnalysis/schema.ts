import {
    ObjectSchema,
    PartialForm,
    ArraySchema,
    defaultUndefinedType,
    requiredCondition,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import { AnalysisPillars } from '#types';

export type FormType = Pick<AnalysisPillars, 'mainStatement' | 'informationGap' | 'analyticalStatements'>;
export type PartialFormType = PartialForm<FormType, 'clientId'>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

export type AnalyticalStatementType = NonNullable<NonNullable<FormType['analyticalStatements']>>[number];
export type PartialAnalyticalStatementType = PartialForm<
    AnalyticalStatementType, 'clientId'
>;

export type AnalyticalEntryType = NonNullable<NonNullable<AnalyticalStatementType['analyticalEntries']>>[number];
export type PartialAnalyticalEntryType = PartialForm<AnalyticalEntryType, 'clientId'>;

type AnalyticalEntrySchema = ObjectSchema<PartialAnalyticalEntryType>;
type AnalyticalEntrySchemaFields = ReturnType<AnalyticalEntrySchema['fields']>;
const analyticalEntrySchema: AnalyticalEntrySchema = {
    fields: (): AnalyticalEntrySchemaFields => ({
        id: [defaultUndefinedType],
        clientId: [],
        order: [],
        entry: [requiredCondition],
    }),
};

type AnalyticalEntriesSchema = ArraySchema<PartialAnalyticalEntryType>;
type AnalyticalEntriesSchemaMember = ReturnType<AnalyticalEntriesSchema['member']>;
const analyticalEntriesSchema: AnalyticalEntriesSchema = {
    keySelector: col => col.clientId,
    member: (): AnalyticalEntriesSchemaMember => analyticalEntrySchema,
};


type AnalyticalStatementSchema = ObjectSchema<PartialAnalyticalStatementType>;
type AnalyticalStatementSchemaFields = ReturnType<AnalyticalStatementSchema['fields']>;
const analyticalStatementSchema: AnalyticalStatementSchema = {
    fields: (): AnalyticalStatementSchemaFields => ({
        id: [defaultUndefinedType],
        clientId: [],
        order: [],
        statement: [requiredStringCondition],
        includeInReport: [],
        analyticalEntries: analyticalEntriesSchema,
    }),
};

type AnalyticalStatementsSchema = ArraySchema<PartialAnalyticalStatementType>;
type AnalyticalStatementsSchemaMember = ReturnType<AnalyticalStatementsSchema['member']>;
const analyticalStatementsSchema: AnalyticalStatementsSchema = {
    keySelector: col => col.clientId,
    member: (): AnalyticalStatementsSchemaMember => analyticalStatementSchema,
};

export const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        mainStatement: [],
        informationGap: [],
        analyticalStatements: analyticalStatementsSchema,
    }),
};

export const defaultFormValues: PartialFormType = {};
