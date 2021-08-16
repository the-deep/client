import {
    ObjectSchema,
    ArraySchema,
    requiredStringCondition,
    PurgeNull,
} from '@togglecorp/toggle-form';
import {
    AnalysisFrameworkInputType,
} from '#generated/types';

type Intersects<A, B> = A extends B ? true : never;

// eslint-disable-next-line @typescript-eslint/ban-types
export type PartialForm<T, J extends string = 'uuid'> = T extends object ? (
    T extends (infer K)[] ? (
        PartialForm<K, J>[]
    ) : (
        Intersects<J, keyof T> extends true ? (
            { [P in Exclude<keyof T, J>]?: PartialForm<T[P], J> }
            & { [P in (keyof T & J)]: NonNullable<T[P]> }
        ) : (
            { [P in keyof T]?: PartialForm<T[P], J> }
        )
    )
) : T;

type FormType = PurgeNull<AnalysisFrameworkInputType>;
export type WidgetsType = NonNullable<FormType['secondaryTagging']>;
export type SectionsType = NonNullable<FormType['primaryTagging']>;

// NOTE: making primaryTagging and secondaryTagging non partial as it will be handled internally
export type PartialFormType = PartialForm<FormType, 'clientId' | 'widget_id' | 'primaryTagging' | 'secondaryTagging'>;

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
        id: [],
        key: [],
        order: [],
        properties: [],
        title: [],
        widgetId: [],
    }),
};

type WidgetsSchema = ArraySchema<PartialWidgetType>;
type WidgetsSchemaMember = ReturnType<WidgetsSchema['member']>;
const widgetsSchema: WidgetsSchema = {
    // FIXME: this will be mandatory
    keySelector: (col) => col.clientId ?? '',
    member: (): WidgetsSchemaMember => widgetSchema,
};

type SectionSchema = ObjectSchema<PartialSectionType>;
type SectionSchemaFields = ReturnType<SectionSchema['fields']>;
const sectionSchema: SectionSchema = {
    fields: (): SectionSchemaFields => ({
        clientId: [],
        id: [],
        order: [],
        title: [],
        tooltip: [],
        widgets: widgetsSchema,
    }),
};

type SectionsSchema = ArraySchema<PartialSectionType>;
type SectionsSchemaMember = ReturnType<SectionsSchema['member']>;
const sectionsSchema: SectionsSchema = {
    // FIXME: this will be mandatory
    keySelector: (col) => col.clientId ?? '',
    member: (): SectionsSchemaMember => sectionSchema,
};

export const defaultFormValues: PartialFormType = {
    primaryTagging: [],
    secondaryTagging: [],
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
