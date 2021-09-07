import {
    ObjectSchema,
    ArraySchema,
    requiredStringCondition,
    defaultUndefinedType,
    PartialForm,
} from '@togglecorp/toggle-form';
import { FrameworkInput } from '#types/newAnalyticalFramework';

type FormType = FrameworkInput;
// NOTE: they will be handled internally
export type PartialFormType = PartialForm<FormType, 'primaryTagging' | 'secondaryTagging'>;

export type WidgetsType = NonNullable<PartialFormType['secondaryTagging']>;
export type SectionsType = NonNullable<PartialFormType['primaryTagging']>;

export type PartialWidgetsType = WidgetsType;
export type PartialSectionsType = SectionsType;

type PartialWidgetType = WidgetsType[number];
type PartialSectionType = SectionsType[number];

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type WidgetSchema = ObjectSchema<PartialWidgetType>;
type WidgetSchemaFields = ReturnType<WidgetSchema['fields']>;
const widgetSchema: WidgetSchema = {
    fields: (): WidgetSchemaFields => ({
        clientId: [],
        id: [defaultUndefinedType],
        key: [],
        order: [],
        properties: [],
        title: [],
        widgetId: [],
        width: [],
    }),
};

type WidgetsSchema = ArraySchema<PartialWidgetType>;
type WidgetsSchemaMember = ReturnType<WidgetsSchema['member']>;
const widgetsSchema: WidgetsSchema = {
    keySelector: (col) => col.clientId,
    member: (): WidgetsSchemaMember => widgetSchema,
};

type SectionSchema = ObjectSchema<PartialSectionType>;
type SectionSchemaFields = ReturnType<SectionSchema['fields']>;
const sectionSchema: SectionSchema = {
    fields: (): SectionSchemaFields => ({
        clientId: [],
        id: [defaultUndefinedType],
        order: [],
        title: [],
        tooltip: [],
        widgets: widgetsSchema,
    }),
};

type SectionsSchema = ArraySchema<PartialSectionType>;
type SectionsSchemaMember = ReturnType<SectionsSchema['member']>;
const sectionsSchema: SectionsSchema = {
    keySelector: (col) => col.clientId,
    member: (): SectionsSchemaMember => sectionSchema,
};

export const defaultFormValues: PartialFormType = {
    title: '',
    isPrivate: false,
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        // TODO: does not work right now
        // previewImage: [],

        title: [requiredStringCondition],
        description: [],
        isPrivate: [],
        organization: [],

        primaryTagging: sectionsSchema,
        secondaryTagging: widgetsSchema,
    }),
};
export default schema;
