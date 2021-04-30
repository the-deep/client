import {
    ObjectSchema,
    PartialForm,
    ArraySchema,
    idCondition,
    requiredCondition,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import { AnalysisPillars } from '#typings';

export type FormType = Pick<AnalysisPillars, 'mainStatement' | 'informationGap' | 'analyticalStatements'>;
type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

export type AnalyticalStatementType = NonNullable<NonNullable<FormType['analyticalStatements']>>[number];
export type AnalyticalEntryType = NonNullable<NonNullable<AnalyticalStatementType['analyticalEntries']>>[number];

type AnalyticalEntrySchema = ObjectSchema<PartialForm<AnalyticalEntryType>>;
type AnalyticalEntrySchemaFields = ReturnType<AnalyticalEntrySchema['fields']>;
const analyticalEntrySchema: AnalyticalEntrySchema = {
    fields: (): AnalyticalEntrySchemaFields => ({
        id: [idCondition],
        uuid: [],
        order: [],
        entry: [requiredCondition],
    }),
};

type AnalyticalEntriesSchema = ArraySchema<PartialForm<AnalyticalEntryType>>;
type AnalyticalEntriesSchemaMember = ReturnType<AnalyticalEntriesSchema['member']>;
const analyticalEntriesSchema: AnalyticalEntriesSchema = {
    keySelector: col => col.uuid,
    member: (): AnalyticalEntriesSchemaMember => analyticalEntrySchema,
};


type AnalyticalStatementSchema = ObjectSchema<PartialForm<AnalyticalStatementType>>;
type AnalyticalStatementSchemaFields = ReturnType<AnalyticalStatementSchema['fields']>;
const analyticalStatementSchema: AnalyticalStatementSchema = {
    fields: (): AnalyticalStatementSchemaFields => ({
        id: [idCondition],
        uuid: [],
        order: [],
        statement: [requiredStringCondition],
        analyticalEntries: analyticalEntriesSchema,
    }),
};

type AnalyticalStatementsSchema = ArraySchema<PartialForm<AnalyticalStatementType>>;
type AnalyticalStatementsSchemaMember = ReturnType<AnalyticalStatementsSchema['member']>;
const analyticalStatementsSchema: AnalyticalStatementsSchema = {
    keySelector: col => col.uuid,
    member: (): AnalyticalStatementsSchemaMember => analyticalStatementSchema,
};

export const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        mainStatement: [],
        informationGap: [],
        analyticalStatements: analyticalStatementsSchema,
    }),
};

export const defaultFormValues: PartialForm<FormType> = {};
