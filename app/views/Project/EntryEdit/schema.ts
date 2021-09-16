import {
    ObjectSchema,
    ArraySchema,
    PartialForm,
    defaultUndefinedType,
} from '@togglecorp/toggle-form';

import { EntryInput } from './types';

type FormType = {
    entries: EntryInput[];
}

export type PartialFormType = PartialForm<FormType, 'clientId' | 'widgetType' | 'widget' | 'data' | 'entryType' | 'lead'>;

export type PartialEntryType = NonNullable<PartialFormType['entries']>[number];

export type PartialAttributeType = NonNullable<PartialEntryType['attributes']>[number];

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type AttributeSchema = ObjectSchema<PartialAttributeType, PartialFormType>;
type AttributeSchemaFields = ReturnType<AttributeSchema['fields']>;
const attributeSchema: AttributeSchema = {
    fields: (): AttributeSchemaFields => ({
        id: [defaultUndefinedType],
        clientId: [],
        widget: [],
        data: [], // FIXME: lot of things here

        // NOTE: widgetType this one is not needed on server
        widgetType: [],
    }),
};

type AttributesSchema = ArraySchema<PartialAttributeType, PartialFormType>;
type AttributesSchemaMember = ReturnType<AttributesSchema['member']>;
const attributesSchema: AttributesSchema = {
    keySelector: (col) => col.clientId,
    member: (): AttributesSchemaMember => attributeSchema,
};

type EntrySchema = ObjectSchema<PartialEntryType, PartialFormType>;
type EntrySchemaFields = ReturnType<EntrySchema['fields']>;
export const entrySchema: EntrySchema = {
    fields: (): EntrySchemaFields => ({
        // NOTE: widgetType this one is not needed on server
        stale: [],
        // NOTE: widgetType this one is not needed on server
        deleted: [],

        id: [defaultUndefinedType],
        lead: [],
        // order
        // informationDate
        entryType: [],
        image: [], // NOTE: to send previously set image
        imageRaw: [defaultUndefinedType], // NOTE: to send url encoded image
        leadImage: [defaultUndefinedType], // NOTE: to send images from lead
        tabularField: [],
        excerpt: [],
        droppedExcerpt: [],
        // highlightHidden: [],
        attributes: attributesSchema,
        clientId: [],
    }),
};

type EntriesSchema = ArraySchema<PartialEntryType, PartialFormType>;
type EntriesSchemaMember = ReturnType<EntriesSchema['member']>;
const entriesSchema: EntriesSchema = {
    keySelector: (col) => col.clientId,
    member: (): EntriesSchemaMember => entrySchema,
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        entries: entriesSchema,
    }),
};

export const defaultFormValues: PartialFormType = {
    entries: [],
};

export default schema;
