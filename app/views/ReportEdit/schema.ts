import {
    type PartialForm,
    type ObjectSchema,
    type ArraySchema,
    type PurgeNull,
    requiredCondition,
    defaultEmptyArrayType,
    defaultUndefinedType,
} from '@togglecorp/toggle-form';

import {
    AnalysisReportInputType,
} from '#generated/types';
import { DeepReplace } from '#utils/types';

type InitialFormType = PartialForm<PurgeNull<AnalysisReportInputType>, 'clientId'>;
type InitialReportContainerType = NonNullable<InitialFormType['containers']>[number];
export type ReportContainerType = Omit<InitialReportContainerType, 'clientId'> & { clientId: string };

export type PartialFormType = DeepReplace<
    InitialFormType,
    InitialReportContainerType,
    ReportContainerType
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type ReportContainerSchema = ObjectSchema<ReportContainerType, PartialFormType>;
type ReportContainerSchemaFields = ReturnType<ReportContainerSchema['fields']>;

type ReportContainerFormSchema = ArraySchema<ReportContainerType, PartialFormType>;
type ReportContainerFormSchemaMember = ReturnType<ReportContainerFormSchema['member']>;

export type ContentConfigType = NonNullable<ReportContainerType['contentConfiguration']>;
type ContentConfigSchema = ObjectSchema<ContentConfigType, PartialFormType>;
type ContentConfigSchemaFields = ReturnType<ContentConfigSchema['fields']>;

// Container Configurations
export type HeadingConfigType = NonNullable<ContentConfigType['heading']>;
type HeadingConfigSchema = ObjectSchema<HeadingConfigType, PartialFormType>;
type HeadingConfigSchemaFields = ReturnType<HeadingConfigSchema['fields']>;

export type ImageConfigType = NonNullable<ContentConfigType['image']>;
type ImageConfigSchema = ObjectSchema<ImageConfigType, PartialFormType>;
type ImageConfigSchemaFields = ReturnType<ImageConfigSchema['fields']>;

export type TextConfigType = NonNullable<ContentConfigType['text']>;
type TextConfigSchema = ObjectSchema<TextConfigType, PartialFormType>;
type TextConfigSchemaFields = ReturnType<TextConfigSchema['fields']>;

export type UrlConfigType = NonNullable<ContentConfigType['url']>;
type UrlConfigSchema = ObjectSchema<UrlConfigType, PartialFormType>;
type UrlConfigSchemaFields = ReturnType<UrlConfigSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => {
        const baseSchema: FormSchemaFields = {
            analysis: [requiredCondition],
            isPublic: [],
            slug: [requiredCondition],
            title: [requiredCondition],
            subTitle: [requiredCondition],
            organizations: [defaultEmptyArrayType],
            containers: {
                keySelector: (container) => container.clientId,
                member: (): ReportContainerFormSchemaMember => ({
                    fields: (): ReportContainerSchemaFields => ({
                        id: [defaultUndefinedType],
                        clientId: [requiredCondition],
                        row: [requiredCondition],
                        column: [requiredCondition],
                        width: [requiredCondition],
                        height: [],
                        contentType: [requiredCondition],
                        // TODO: Write better type for content data
                        contentData: [defaultEmptyArrayType],
                        contentConfiguration: {
                            fields: (): ContentConfigSchemaFields => ({
                                heading: {
                                    fields: (): HeadingConfigSchemaFields => ({
                                        content: [],
                                        variant: [requiredCondition],
                                        // TODO: Write style input schemas separately
                                    }),
                                },
                                image: {
                                    fields: (): ImageConfigSchemaFields => ({
                                        altText: [],
                                        caption: [],
                                        // TODO: Write style input schemas separately
                                    }),
                                },
                                text: {
                                    fields: (): TextConfigSchemaFields => ({
                                        content: [],
                                        // TODO: Write style input schemas separately
                                    }),
                                },
                                url: {
                                    fields: (): UrlConfigSchemaFields => ({
                                        url: [],
                                        // TODO: Write style input schemas separately
                                    }),
                                },
                            }),
                        },
                    }),
                }),
            },
        };

        return baseSchema;
    },
};

export default schema;
