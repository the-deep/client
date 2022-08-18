import {
    ObjectSchema,
    ArraySchema,
    forceNullType,
    requiredCondition,
    requiredStringCondition,
    requiredListCondition,
    defaultUndefinedType,
    PartialForm,
} from '@togglecorp/toggle-form';

import { FrameworkInput } from './types';

type FormType = FrameworkInput & {
    isVisualizationEnabled?: boolean;
    modifiedAt?: string;
};
// NOTE: they will be handled internally
// FIXME: should previewImage be added here?
export type PartialFormType = PartialForm<FormType, 'primaryTagging' | 'secondaryTagging' | 'previewImage' | 'predictionTagsMapping'>;

export type WidgetsType = NonNullable<PartialFormType['secondaryTagging']>;
export type SectionsType = NonNullable<PartialFormType['primaryTagging']>;
export type PropertiesType = NonNullable<PartialFormType['properties']>;
export type StatsConfigType = NonNullable<NonNullable<PartialFormType['properties']>['statsConfig']>;
export type PredictionTagMappingsType = NonNullable<PartialFormType['predictionTagsMapping']>;

export type PartialWidgetsType = WidgetsType;
export type PartialSectionsType = SectionsType;
export type PartialPredictionTagMappingsType = PredictionTagMappingsType;

// NOTE: These are not partials widget types even if it's on the name
type PartialWidgetType = WidgetsType[number];
type PartialSectionType = SectionsType[number];
type PartialPredictionTagMappingType = PredictionTagMappingsType[number];

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type PredictionTagMappingSchema = ObjectSchema<PartialPredictionTagMappingType, PartialFormType>;
type PredictionTagMappingSchemaFields = ReturnType<PredictionTagMappingSchema['fields']>;
const predictionTagMappingSchema: PredictionTagMappingSchema = {
    fields: (): PredictionTagMappingSchemaFields => ({
        association: [],
        tag: [],

        widget: [],
        widgetType: [],
        clientId: [],
        id: [defaultUndefinedType],
    }),
};

type PredictionTagMappingsSchema = ArraySchema<PartialPredictionTagMappingType, PartialFormType>;
type PredictionTagMappingsSchemaMember = ReturnType<PredictionTagMappingsSchema['member']>;
const predictionTagMappingsSchema: PredictionTagMappingsSchema = {
    keySelector: (col) => col.clientId,
    member: (): PredictionTagMappingsSchemaMember => predictionTagMappingSchema,
};

type WidgetSchema = ObjectSchema<PartialWidgetType, PartialFormType>;
type WidgetSchemaFields = ReturnType<WidgetSchema['fields']>;
const widgetSchema: WidgetSchema = {
    fields: (): WidgetSchemaFields => ({
        clientId: [],
        id: [defaultUndefinedType],
        key: [],
        order: [],
        // FIXME: Define proper schema
        properties: [],
        version: [],
        title: [],
        widgetId: [],
        width: [],
        conditional: [],
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

type FrameworkPropertiesSchema = ObjectSchema<PropertiesType, PartialFormType>;
type FrameworkPropertiesSchemaFields = ReturnType<FrameworkPropertiesSchema['fields']>;

type StatsConfigSchema = ObjectSchema<StatsConfigType, PartialFormType>;
type StatsConfigSchemaFields = ReturnType<StatsConfigSchema['fields']>;

export const defaultFormValues: PartialFormType = {
    title: '',
    isPrivate: false,
    isVisualizationEnabled: false,
    assistedTaggingEnabled: true,
    modifiedAt: undefined,
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
            assistedTaggingEnabled: [],
            modifiedAt: [],
            properties: [forceNullType],

            primaryTagging: sectionsSchema,
            secondaryTagging: widgetsSchema,

            predictionTagsMapping: predictionTagMappingsSchema,
        };

        if (value?.isVisualizationEnabled) {
            baseSchema = {
                ...baseSchema,
                properties: {
                    fields: (): FrameworkPropertiesSchemaFields => ({
                        statsConfig: {
                            fields: (): StatsConfigSchemaFields => ({
                                widget1d: [requiredListCondition],
                                widget2d: [requiredListCondition],
                                geoWidget: [requiredCondition],
                                severityWidget: [requiredCondition],
                                reliabilityWidget: [requiredCondition],
                                multiselectWidgets: [requiredCondition],
                                organigramWidgets: [requiredCondition],
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
