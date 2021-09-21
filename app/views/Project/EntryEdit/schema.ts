import {
    ObjectSchema,
    ArraySchema,
    PartialForm,
    defaultUndefinedType,
    greaterThanOrEqualToCondition,
    lessThanOrEqualToCondition,
} from '@togglecorp/toggle-form';
import {
    isDefined,
} from '@togglecorp/fujs';

import { Widget } from '#types/newAnalyticalFramework';

import { EntryInput } from './types';

type FormType = {
    entries: EntryInput[];
}

type getType<T, Q> = T extends Q ? T : never;

export type PartialFormType = PartialForm<FormType, 'clientId' | 'widgetType' | 'widget' | 'data' | 'entryType' | 'lead'>;

export type PartialEntryType = NonNullable<PartialFormType['entries']>[number];

export type PartialAttributeType = NonNullable<PartialEntryType['attributes']>[number];

type NumberAttributeType = getType<PartialAttributeType, { widgetType: 'NUMBER' }>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type AttributeSchema = ObjectSchema<PartialAttributeType, PartialFormType>;
type AttributeSchemaFields = ReturnType<AttributeSchema['fields']>;

const getAttributeSchema = (widgets: Partial<Record<string, Widget>>): AttributeSchema => ({
    fields: (value): AttributeSchemaFields => {
        const basicValidation = {
            id: [defaultUndefinedType],
            clientId: [],
            widget: [],
            data: [],

            // NOTE: widgetType this one is not needed on server
            widgetType: [],
        };
        if (!value) {
            return basicValidation;
        }
        const widget = widgets[value?.widgetType];
        if (!widget) {
            return basicValidation;
        }
        if (widget.widgetId === 'NUMBER' && value.widgetType !== widget.widgetId) {
            type NumberAttributeDataSchema = ObjectSchema<NonNullable<NumberAttributeType['data']>, PartialFormType>;
            type NumberAttributeDataSchemaFields = ReturnType<NumberAttributeDataSchema['fields']>;
            const validations: NumberAttributeDataSchemaFields['value'] = [];
            if (isDefined(widget.properties.maxValue)) {
                validations.push(lessThanOrEqualToCondition(widget.properties.maxValue));
            }
            if (isDefined(widget.properties.minValue)) {
                validations.push(greaterThanOrEqualToCondition(widget.properties.minValue));
            }

            return {
                ...basicValidation,
                data: {
                    fields: (): NumberAttributeDataSchemaFields => ({
                        value: validations,
                    }),
                },
            };
        }
        return basicValidation;
    },
});

type AttributesSchema = ArraySchema<PartialAttributeType, PartialFormType>;
type AttributesSchemaMember = ReturnType<AttributesSchema['member']>;
const getAttributesSchema = (widgets: Partial<Record<string, Widget>>): AttributesSchema => ({
    keySelector: (col) => col.clientId,
    member: (): AttributesSchemaMember => getAttributeSchema(widgets),
});

type EntrySchema = ObjectSchema<PartialEntryType, PartialFormType>;
type EntrySchemaFields = ReturnType<EntrySchema['fields']>;
export const getEntrySchema = (widgets: Partial<Record<string, Widget>>): EntrySchema => ({
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
        attributes: getAttributesSchema(widgets),
        clientId: [],
    }),
});

type EntriesSchema = ArraySchema<PartialEntryType, PartialFormType>;
type EntriesSchemaMember = ReturnType<EntriesSchema['member']>;
const getEntriesSchema = (widgets: Partial<Record<string, Widget>>): EntriesSchema => ({
    keySelector: (col) => col.clientId,
    member: (): EntriesSchemaMember => getEntrySchema(widgets),
});

const getSchema = (widgets: Partial<Record<string, Widget>>): FormSchema => ({
    fields: (): FormSchemaFields => ({
        entries: getEntriesSchema(widgets),
    }),
});

export const defaultFormValues: PartialFormType = {
    entries: [],
};

export default getSchema;
