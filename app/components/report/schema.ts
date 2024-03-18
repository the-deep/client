import {
    type PartialForm,
    type ObjectSchema,
    type ArraySchema,
    type PurgeNull,
    requiredCondition,
    defaultEmptyArrayType,
    defaultUndefinedType,
    lessThanOrEqualToCondition,
} from '@togglecorp/toggle-form';

import {
    AnalysisReportInputType,
    AnalysisReportImageContentStyleType,
    AnalysisReportTextContentStyleType,
    AnalysisReportHeadingContentStyleType,
    AnalysisReportBackgroundStyleType,
    AnalysisReportBorderStyleType,
    AnalysisReportPaddingStyleType,
    AnalysisReportContainerStyleType,
    AnalysisReportTextStyleType,
    AnalysisReportKpiItemConfigurationType,
} from '#generated/types';

// NOTE: New DeepReplace is not compatible with old that is present in other
// parts of DEEP
type DeepNonNullable<T> = T extends object ? (
    T extends (infer K)[] ? (
        DeepNonNullable<K>[]
    ) : (
        { [P in keyof T]-?: DeepNonNullable<T[P]> }
    )
) : NonNullable<T>;

export type DeepReplace<T, A, B> = (
    DeepNonNullable<T> extends DeepNonNullable<A>
        ? B
        : (
            T extends (infer Z)[]
                ? DeepReplace<Z, A, B>[]
                : (
                    T extends object
                        ? { [K in keyof T]: DeepReplace<T[K], A, B> }
                        : T
                )
        )
)
type InitialFormType = PartialForm<PurgeNull<AnalysisReportInputType>, 'clientId'>;
type InitialReportContainerType = NonNullable<InitialFormType['containers']>[number];
type InitialContentDataType = NonNullable<InitialReportContainerType['contentData']>[number];

type InitialKpiItemType = PurgeNull<AnalysisReportKpiItemConfigurationType>;

type FinalReportContainerType = Omit<InitialReportContainerType, 'clientId'> & { clientId: string };
type FinalContentDataType = Omit<InitialContentDataType, 'clientId'> & { clientId: string };
export type FinalKpiItemType = Omit<InitialKpiItemType, 'clientId'> & { clientId: string };

export type PartialFormType = DeepReplace<
    DeepReplace<
        DeepReplace<
            InitialFormType,
            InitialReportContainerType,
            FinalReportContainerType
        >,
        InitialContentDataType,
        FinalContentDataType
    >,
    InitialKpiItemType,
    FinalKpiItemType
>;

export type ReportContainerType = NonNullable<PartialFormType['containers']>[number];
export type ContentDataType = NonNullable<ReportContainerType['contentData']>[number];

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

// Styling common schemas

// Background
export type BackgroundStyleFormType = PartialForm<PurgeNull<AnalysisReportBackgroundStyleType>>;
type BackgroundStyleFormSchema = ObjectSchema<BackgroundStyleFormType, PartialFormType>;
type BackgroundStyleFormSchemaFields = ReturnType<BackgroundStyleFormSchema['fields']>;

const backgroundStyleSchema: BackgroundStyleFormSchema = {
    fields: (): BackgroundStyleFormSchemaFields => ({
        color: [defaultUndefinedType],
        opacity: [defaultUndefinedType],
    }),
};

// Border
export type BorderStyleFormType = PartialForm<PurgeNull<AnalysisReportBorderStyleType>>;
type BorderStyleFormSchema = ObjectSchema<BorderStyleFormType, PartialFormType>;
type BorderStyleFormSchemaFields = ReturnType<BorderStyleFormSchema['fields']>;

const borderStyleSchema: BorderStyleFormSchema = {
    fields: (): BorderStyleFormSchemaFields => ({
        color: [defaultUndefinedType],
        opacity: [defaultUndefinedType],
        style: [defaultUndefinedType],
        width: [
            defaultUndefinedType,
            lessThanOrEqualToCondition(72),
        ],
    }),
};

// Padding
export type PaddingStyleFormType = PartialForm<PurgeNull<AnalysisReportPaddingStyleType>>;
type PaddingStyleFormSchema = ObjectSchema<PaddingStyleFormType, PartialFormType>;
type PaddingStyleFormSchemaFields = ReturnType<PaddingStyleFormSchema['fields']>;

const paddingStyleSchema: PaddingStyleFormSchema = {
    fields: (): PaddingStyleFormSchemaFields => ({
        left: [defaultUndefinedType, lessThanOrEqualToCondition(72)],
        right: [defaultUndefinedType, lessThanOrEqualToCondition(72)],
        bottom: [defaultUndefinedType, lessThanOrEqualToCondition(72)],
        top: [defaultUndefinedType, lessThanOrEqualToCondition(72)],
    }),
};

// Container style
export type ContainerStyleFormType = PartialForm<PurgeNull<AnalysisReportContainerStyleType>>;

type ContainerStyleFormSchema = ObjectSchema<ContainerStyleFormType, PartialFormType>;
type ContainerStyleFormSchemaFields = ReturnType<ContainerStyleFormSchema['fields']>;

const containerStyleSchema: ContainerStyleFormSchema = {
    fields: (): ContainerStyleFormSchemaFields => ({
        background: backgroundStyleSchema,
        border: borderStyleSchema,
        padding: paddingStyleSchema,
    }),
};

// Text
type TextStyleFormType = PartialForm<PurgeNull<AnalysisReportTextStyleType>>;
type TextStyleFormSchema = ObjectSchema<TextStyleFormType, PartialFormType>;
type TextStyleFormSchemaFields = ReturnType<TextStyleFormSchema['fields']>;

const textStyleSchema: TextStyleFormSchema = {
    fields: (): TextStyleFormSchemaFields => ({
        color: [defaultUndefinedType],
        family: [defaultUndefinedType],
        size: [defaultUndefinedType, lessThanOrEqualToCondition(108)],
        weight: [defaultUndefinedType],
        align: [defaultUndefinedType],
    }),
};

// Image
export type ImageContentStyleFormType = PartialForm<PurgeNull<AnalysisReportImageContentStyleType>>;
type ImageContentStyleFormSchema = ObjectSchema<ImageContentStyleFormType, PartialFormType>;
type ImageContentStyleFormSchemaFields = ReturnType<ImageContentStyleFormSchema['fields']>;

const imageContentStyleSchema: ImageContentStyleFormSchema = {
    fields: (): ImageContentStyleFormSchemaFields => ({
        caption: textStyleSchema,
        fit: [defaultUndefinedType],
    }),
};

// Text
export type TextContentStyleFormType = PartialForm<PurgeNull<AnalysisReportTextContentStyleType>>;
type TextContentStyleFormSchema = ObjectSchema<TextContentStyleFormType, PartialFormType>;
type TextContentStyleFormSchemaFields = ReturnType<TextContentStyleFormSchema['fields']>;

const textContentStyleSchema: TextContentStyleFormSchema = {
    fields: (): TextContentStyleFormSchemaFields => ({
        content: textStyleSchema,
    }),
};

// Heading
export type HeadingContentStyleFormType = PartialForm<
    PurgeNull<AnalysisReportHeadingContentStyleType>
>;
type HeadingContentStyleFormSchema = ObjectSchema<HeadingContentStyleFormType, PartialFormType>;
type HeadingContentStyleFormSchemaFields = ReturnType<HeadingContentStyleFormSchema['fields']>;

const headingContentStyleSchema: HeadingContentStyleFormSchema = {
    fields: (): HeadingContentStyleFormSchemaFields => ({
        h1: textStyleSchema,
        h2: textStyleSchema,
        h3: textStyleSchema,
        h4: textStyleSchema,
    }),
};

type ReportContainerSchema = ObjectSchema<ReportContainerType, PartialFormType>;
type ReportContainerSchemaFields = ReturnType<ReportContainerSchema['fields']>;

type ReportContainerFormSchema = ArraySchema<ReportContainerType, PartialFormType>;
type ReportContainerFormSchemaMember = ReturnType<ReportContainerFormSchema['member']>;

type ContentDataSchema = ObjectSchema<ContentDataType, PartialFormType>;
type ContentDataSchemaFields = ReturnType<ContentDataSchema['fields']>;

type ContentDataFormSchema = ArraySchema<ContentDataType, PartialFormType>;
type ContentDataFormSchemaMember = ReturnType<ContentDataFormSchema['member']>;

// Overall configuration types
export type ConfigType = NonNullable<PartialFormType['configuration']>;
type ConfigSchema = ObjectSchema<ConfigType, PartialFormType>;
type ConfigSchemaFields = ReturnType<ConfigSchema['fields']>;

// Header
type HeaderStyleFormType = NonNullable<ConfigType['headerStyle']>;
type HeaderStyleFormSchema = ObjectSchema<HeaderStyleFormType, PartialFormType>;
type HeaderStyleFormSchemaFields = ReturnType<HeaderStyleFormSchema['fields']>;

// FIXME: Talk with @tnagorra
const headerStyleSchema: HeaderStyleFormSchema = {
    fields: (): HeaderStyleFormSchemaFields => ({
        background: backgroundStyleSchema,
        // FIXME: Talk with @tnagorra
        // border: borderStyleSchema,
        padding: paddingStyleSchema,
        subTitle: textStyleSchema,
        title: textStyleSchema,
    }),
};
export type BodyStyleConfig = NonNullable<ConfigType['bodyStyle']>;
type BodyStyleConfigSchema = ObjectSchema<BodyStyleConfig, PartialFormType>;
type BodyStyleConfigSchemaFields = ReturnType<BodyStyleConfigSchema['fields']>;

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

export type KpiConfigType = NonNullable<ContentConfigType['kpi']>;
type KpiConfigSchema = ObjectSchema<KpiConfigType, PartialFormType>;
type KpiConfigSchemaFields = ReturnType<KpiConfigSchema['fields']>;

type KpiItemSchema = ObjectSchema<PartialForm<FinalKpiItemType, 'clientId'>, PartialFormType>;
type KpiItemSchemaFields = ReturnType<KpiItemSchema['fields']>;

type KpiItemFormSchema = ArraySchema<PartialForm<FinalKpiItemType, 'clientId'>, PartialFormType>;
type KpiItemFormSchemaMember = ReturnType<KpiItemFormSchema['member']>;

export type UrlConfigType = NonNullable<ContentConfigType['url']>;
type UrlConfigSchema = ObjectSchema<UrlConfigType, PartialFormType>;
type UrlConfigSchemaFields = ReturnType<UrlConfigSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => {
        const baseSchema: FormSchemaFields = {
            analysis: [requiredCondition],
            isPublic: [defaultUndefinedType],
            slug: [requiredCondition],
            title: [requiredCondition],
            subTitle: [requiredCondition],
            organizations: [defaultEmptyArrayType],
            configuration: {
                fields: (): ConfigSchemaFields => ({
                    bodyStyle: {
                        fields: (): BodyStyleConfigSchemaFields => ({
                            gap: [defaultUndefinedType],
                        }),
                    },
                    textContentStyle: textContentStyleSchema,
                    containerStyle: containerStyleSchema,
                    headerStyle: headerStyleSchema,
                    imageContentStyle: imageContentStyleSchema,
                    headingContentStyle: headingContentStyleSchema,
                }),
            },
            containers: {
                keySelector: (container) => container.clientId,
                member: (): ReportContainerFormSchemaMember => ({
                    fields: (containerValue): ReportContainerSchemaFields => ({
                        id: [defaultUndefinedType],
                        clientId: [requiredCondition],
                        row: [requiredCondition],
                        column: [requiredCondition],
                        width: [requiredCondition],
                        height: [defaultUndefinedType],
                        contentType: [requiredCondition],
                        style: containerStyleSchema,
                        contentData: {
                            keySelector: (item) => item.clientId,
                            member: (): ContentDataFormSchemaMember => ({
                                fields: (): ContentDataSchemaFields => ({
                                    clientId: [requiredCondition],
                                    data: [defaultUndefinedType],
                                    id: [defaultUndefinedType],
                                    upload: [requiredCondition],
                                }),
                            }),
                        },
                        contentConfiguration: {
                            fields: (): ContentConfigSchemaFields => {
                                let configSchema: ContentConfigSchemaFields = {
                                    // FIXME: This should be force undefined type
                                    heading: [defaultUndefinedType],
                                    image: [defaultUndefinedType],
                                    text: [defaultUndefinedType],
                                    url: [defaultUndefinedType],
                                };
                                if (containerValue?.contentType === 'HEADING') {
                                    configSchema = {
                                        ...configSchema,
                                        heading: {
                                            fields: (): HeadingConfigSchemaFields => ({
                                                content: [],
                                                variant: [requiredCondition],
                                                style: textContentStyleSchema,
                                            }),
                                        },
                                    };
                                } else if (containerValue?.contentType === 'IMAGE') {
                                    configSchema = {
                                        ...configSchema,
                                        image: {
                                            fields: (): ImageConfigSchemaFields => ({
                                                altText: [],
                                                caption: [],
                                                style: imageContentStyleSchema,
                                            }),
                                        },
                                    };
                                } else if (containerValue?.contentType === 'TEXT') {
                                    configSchema = {
                                        ...configSchema,
                                        text: {
                                            fields: (): TextConfigSchemaFields => ({
                                                content: [],
                                                style: textContentStyleSchema,
                                            }),
                                        },
                                    };
                                } else if (containerValue?.contentType === 'KPI') {
                                    configSchema = {
                                        ...configSchema,
                                        kpi: {
                                            fields: (): KpiConfigSchemaFields => ({
                                                items: {
                                                    keySelector: (item) => item.clientId,
                                                    member: (): KpiItemFormSchemaMember => ({
                                                        fields: (): KpiItemSchemaFields => ({
                                                            clientId: [requiredCondition],
                                                            title: [requiredCondition],
                                                            value: [requiredCondition],
                                                            color: [],
                                                            date: [],
                                                            subtitle: [],
                                                            source: [],
                                                            sourceUrl: [],
                                                        }),
                                                    }),
                                                },
                                                sourceContentStyle: textContentStyleSchema,
                                                subtitleContentStyle: textContentStyleSchema,
                                                titleContentStyle: textContentStyleSchema,
                                                valueContentStyle: textContentStyleSchema,
                                            }),
                                        },
                                    };
                                } else if (containerValue?.contentType === 'URL') {
                                    configSchema = {
                                        ...configSchema,
                                        url: {
                                            fields: (): UrlConfigSchemaFields => ({
                                                url: [],
                                            }),
                                        },
                                    };
                                }
                                return configSchema;
                            },
                        },
                    }),
                }),
            },
        };

        return baseSchema;
    },
};

export default schema;
