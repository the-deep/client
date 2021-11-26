import {
    ObjectSchema,
    ArraySchema,
    forceNullType,
    requiredCondition,
    requiredStringCondition,
    defaultUndefinedType,
    PartialForm,
} from '@togglecorp/toggle-form';

import { FrameworkInput } from '../types';

type FormType = FrameworkInput & { isVisualizationEnabled?: boolean };
// NOTE: they will be handled internally
export type PartialFormType = PartialForm<FormType, 'primaryTagging' | 'secondaryTagging' | 'previewImage'>;

export type WidgetsType = NonNullable<PartialFormType['secondaryTagging']>;
export type SectionsType = NonNullable<PartialFormType['primaryTagging']>;

export type PartialWidgetsType = WidgetsType;
export type PartialSectionsType = SectionsType;

// NOTE: These are not partials widget types even if it's on the name
type PartialWidgetType = WidgetsType[number];
type PartialSectionType = SectionsType[number];

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type WidgetSchema = ObjectSchema<PartialWidgetType, PartialFormType>;
type WidgetSchemaFields = ReturnType<WidgetSchema['fields']>;
const widgetSchema: WidgetSchema = {
    fields: (): WidgetSchemaFields => ({
        clientId: [],
        id: [defaultUndefinedType],
        key: [],
        order: [],
        properties: [],
        // FIXME: Enable this after this has been implemented on the server side
        // conditional: [],
        title: [],
        widgetId: [],
        version: [],
        width: [],
    }),
};

type WidgetsSchema = ArraySchema<PartialWidgetType, PartialFormType>;
type WidgetsSchemaMember = ReturnType<WidgetsSchema['member']>;
const widgetsSchema: WidgetsSchema = {
    keySelector: (col) => col.clientId,
    member: (): WidgetsSchemaMember => widgetSchema,
};

type SectionSchema = ObjectSchema<PartialSectionType, PartialFormType>;
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

type SectionsSchema = ArraySchema<PartialSectionType, PartialFormType>;
type SectionsSchemaMember = ReturnType<SectionsSchema['member']>;
const sectionsSchema: SectionsSchema = {
    keySelector: (col) => col.clientId,
    member: (): SectionsSchemaMember => sectionSchema,
};

export const defaultFormValues: PartialFormType = {
    title: '',
    isPrivate: false,
    isVisualizationEnabled: false,
};

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        let baseSchema: FormSchemaFields = {
            previewImage: [],
            title: [requiredStringCondition],
            description: [],
            isPrivate: [],
            organization: [],
            isVisualizationEnabled: [],
            properties: [forceNullType],

            primaryTagging: sectionsSchema,
            secondaryTagging: widgetsSchema,
        };

        if (value?.isVisualizationEnabled) {
            baseSchema = {
                ...baseSchema,
                properties: {
                    fields: () => ({
                        stats_config: {
                            fields: () => ({
                                matrix1d: [requiredCondition],
                                matrix2d: [requiredCondition],
                                geo_widget: [requiredCondition],
                                severity_widget: [requiredCondition],
                                reliability_widget: [requiredCondition],
                                affected_groups_widget: [requiredCondition],
                                specific_needs_groups_widgets: [requiredCondition],
                            }),
                        },
                    }),
                },
            };
        }
        return baseSchema;
    },
};
export default schema;
