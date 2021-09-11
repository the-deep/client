import {
    ObjectSchema,
    ArraySchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { EntryInput } from './types';

type FormType = {
    entries: EntryInput[];
}

export type PartialFormType = PartialForm<FormType, 'clientId' | 'widgetType' | 'widget' | 'data' | 'entryType' | 'lead'>;

export type PartialEntryType = NonNullable<PartialFormType['entries']>[number];

type PartialAttributeType = NonNullable<PartialEntryType['attributes']>[number];

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type AttributeSchema = ObjectSchema<PartialAttributeType>;
type AttributeSchemaFields = ReturnType<AttributeSchema['fields']>;
const attributeSchema: AttributeSchema = {
    fields: (): AttributeSchemaFields => ({
        id: [],
        // NOTE: this one is not needed on server
        widgetType: [],
        clientId: [],
        widget: [],
        data: [],
    }),
};

type AttributesSchema = ArraySchema<PartialAttributeType>;
type AttributesSchemaMember = ReturnType<AttributesSchema['member']>;
const attributesSchema: AttributesSchema = {
    keySelector: (col) => col.clientId,
    member: (): AttributesSchemaMember => attributeSchema,
};

type EntrySchema = ObjectSchema<PartialEntryType>;
type EntrySchemaFields = ReturnType<EntrySchema['fields']>;
const entrySchema: EntrySchema = {
    fields: (): EntrySchemaFields => ({
        id: [],
        lead: [],
        // order
        // informationDate
        entryType: [],
        image: [],
        // imageRaw
        // leadImage: [],
        tabularField: [],
        excerpt: [],
        droppedExcerpt: [],
        // highlightHidden: [],
        attributes: attributesSchema, // FIXME: lot of things here
        clientId: [],
    }),
};

type EntriesSchema = ArraySchema<PartialEntryType>;
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
