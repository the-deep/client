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
    AnalysisReportBarChartStyleType,
    AnalysisReportHeadingContentStyleType,
    AnalysisReportBackgroundStyleType,
    AnalysisReportBorderStyleType,
    AnalysisReportPaddingStyleType,
    AnalysisReportContainerStyleType,
    AnalysisReportTextStyleType,
    AnalysisReportLineLayerStyleType,
    AnalysisReportGridLineStyleType,
    AnalysisReportTickStyleType,
    AnalysisReportBarStyleType,
    AnalysisReportHorizontalAxisType,
    AnalysisReportKpiItemStyleConfigurationType,
    AnalysisReportVerticalAxisType,
    AnalysisReportCategoricalLegendStyleType,
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
type InitialVerticalAxisType = PurgeNull<AnalysisReportVerticalAxisType>;

type FinalReportContainerType = Omit<InitialReportContainerType, 'clientId'> & { clientId: string };
type FinalContentDataType = Omit<InitialContentDataType, 'clientId'> & { clientId: string };
export type FinalKpiItemType = Omit<InitialKpiItemType, 'clientId'> & { clientId: string };
export type FinalVerticalAxisType = Omit<InitialVerticalAxisType, 'clientId'> & { clientId: string };

export type PartialFormType = DeepReplace<
    DeepReplace<
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
    >,
    InitialVerticalAxisType,
    FinalVerticalAxisType
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

// Line Layer Style
export type LineLayerStyleFormType = PartialForm<PurgeNull<AnalysisReportLineLayerStyleType>>;
type LineLayerStyleFormSchema = ObjectSchema<LineLayerStyleFormType, PartialFormType>;
type LineLayerStyleFormSchemaFields = ReturnType<LineLayerStyleFormSchema['fields']>;

const lineLayerStyleSchema: LineLayerStyleFormSchema = {
    fields: (): LineLayerStyleFormSchemaFields => ({
        strokeType: [],
        dashSpacing: [],
        stroke: [],
        strokeWidth: [],
    }),
};

// Bar
export type BarStyleFormType = PartialForm<PurgeNull<AnalysisReportBarStyleType>>;
type BarStyleFormSchema = ObjectSchema<BarStyleFormType, PartialFormType>;
type BarStyleFormSchemaFields = ReturnType<BarStyleFormSchema['fields']>;

const barStyleSchema: BarStyleFormSchema = {
    fields: (): BarStyleFormSchemaFields => ({
        border: borderStyleSchema,
    }),
};

// Horizontal Axis
export type HorizontalAxisFormType = PartialForm<PurgeNull<AnalysisReportHorizontalAxisType>>;
type HorizontalAxisFormSchema = ObjectSchema<HorizontalAxisFormType, PartialFormType>;
type HorizontalAxisFormSchemaFields = ReturnType<HorizontalAxisFormSchema['fields']>;

const horizontalAxisSchema: HorizontalAxisFormSchema = {
    fields: (): HorizontalAxisFormSchemaFields => ({
        field: [requiredCondition],
        type: [requiredCondition],
    }),
};

// GridLine
type GridLineStyleFormType = PartialForm<PurgeNull<AnalysisReportGridLineStyleType>>;
type GridLineStyleFormSchema = ObjectSchema<GridLineStyleFormType, PartialFormType>;
type GridLineStyleFormSchemaFields = ReturnType<GridLineStyleFormSchema['fields']>;

const gridLineStyleSchema: GridLineStyleFormSchema = {
    fields: (): GridLineStyleFormSchemaFields => ({
        lineColor: [defaultUndefinedType],
        lineWidth: [defaultUndefinedType],
        lineOpacity: [defaultUndefinedType],
    }),
};

// Tick
type TickStyleFormType = PartialForm<PurgeNull<AnalysisReportTickStyleType>>;
type TickStyleFormSchema = ObjectSchema<TickStyleFormType, PartialFormType>;
type TickStyleFormSchemaFields = ReturnType<TickStyleFormSchema['fields']>;

const tickStyleSchema: TickStyleFormSchema = {
    fields: (): TickStyleFormSchemaFields => ({
        lineColor: [defaultUndefinedType],
        lineWidth: [defaultUndefinedType],
        lineOpacity: [defaultUndefinedType],
    }),
};

// Legend
type CategoricalLegendStyleFormType = PartialForm<PurgeNull<
    AnalysisReportCategoricalLegendStyleType
>>;
type CategoricalLegendStyleFormSchema = ObjectSchema<
    CategoricalLegendStyleFormType, PartialFormType
>;
type CategoricalLegendStyleFormSchemaFields = ReturnType<CategoricalLegendStyleFormSchema['fields']>;

const categoricalLegendStyleSchema: CategoricalLegendStyleFormSchema = {
    fields: (): CategoricalLegendStyleFormSchemaFields => ({
        position: [defaultUndefinedType],
        shape: [defaultUndefinedType],
        heading: textStyleSchema,
        label: textStyleSchema,
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

// Bar Chart
export type BarChartStyleFormType = PartialForm<PurgeNull<AnalysisReportBarChartStyleType>>;
type BarChartStyleFormSchema = ObjectSchema<BarChartStyleFormType, PartialFormType>;
type BarChartStyleFormSchemaFields = ReturnType<BarChartStyleFormSchema['fields']>;

const barChartStyleSchema: BarChartStyleFormSchema = {
    fields: (): BarChartStyleFormSchemaFields => ({
        title: textStyleSchema,
        subTitle: textStyleSchema,
        legend: categoricalLegendStyleSchema,
        bar: barStyleSchema,
        horizontalAxisTitle: textStyleSchema,
        verticalAxisTitle: textStyleSchema,
        horizontalAxisTickLabel: textStyleSchema,
        verticalAxisTickLabel: textStyleSchema,

        verticalGridLine: gridLineStyleSchema,
        horizontalGridLine: gridLineStyleSchema,
        verticalTick: tickStyleSchema,
        horizontalTick: tickStyleSchema,
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

export type BarChartConfigType = NonNullable<ContentConfigType['barChart']>;
type BarChartConfigSchema = ObjectSchema<BarChartConfigType, PartialFormType>;
type BarChartConfigSchemaFields = ReturnType<BarChartConfigSchema['fields']>;

export type KpiConfigType = NonNullable<ContentConfigType['kpi']>;
type KpiConfigSchema = ObjectSchema<KpiConfigType, PartialFormType>;
type KpiConfigSchemaFields = ReturnType<KpiConfigSchema['fields']>;

type KpiItemSchema = ObjectSchema<PartialForm<FinalKpiItemType, 'clientId'>, PartialFormType>;
type KpiItemSchemaFields = ReturnType<KpiItemSchema['fields']>;

type KpiItemFormSchema = ArraySchema<PartialForm<FinalKpiItemType, 'clientId'>, PartialFormType>;
type KpiItemFormSchemaMember = ReturnType<KpiItemFormSchema['member']>;

type KpiItemStyleFormType = PartialForm<PurgeNull<AnalysisReportKpiItemStyleConfigurationType>>;
type KpiItemStyleFormSchema = ObjectSchema<KpiItemStyleFormType, PartialFormType>;
type KpiItemStyleFormSchemaFields = ReturnType<KpiItemStyleFormSchema['fields']>;

const kpiItemStyleSchema: KpiItemStyleFormSchema = {
    fields: (): KpiItemStyleFormSchemaFields => ({
        sourceContentStyle: textStyleSchema,
        subtitleContentStyle: textStyleSchema,
        titleContentStyle: textStyleSchema,
        valueContentStyle: textStyleSchema,
    }),
};

type VerticalAxisSchema = ObjectSchema<PartialForm<FinalVerticalAxisType, 'clientId'>, PartialFormType>;
type VerticalAxisSchemaFields = ReturnType<VerticalAxisSchema['fields']>;

type VerticalAxisFormSchema = ArraySchema<PartialForm<FinalVerticalAxisType, 'clientId'>, PartialFormType>;
type VerticalAxisFormSchemaMember = ReturnType<VerticalAxisFormSchema['member']>;

export type UrlConfigType = NonNullable<ContentConfigType['url']>;
type UrlConfigSchema = ObjectSchema<UrlConfigType, PartialFormType>;
type UrlConfigSchemaFields = ReturnType<UrlConfigSchema['fields']>;

export type MapConfigType = NonNullable<ContentConfigType['map']>;
type MapConfigSchema = ObjectSchema<MapConfigType, PartialFormType>;
type MapConfigSchemaFields = ReturnType<MapConfigSchema['fields']>;

export type MapLayerType = PartialForm<NonNullable<MapConfigType['layers']>[number], 'clientId'>;
type MapLayerSchema = ObjectSchema<MapLayerType, PartialFormType>;
type MapLayerSchemaFields = ReturnType<MapLayerSchema['fields']>;

type MapLayerFormSchema = ArraySchema<MapLayerType, PartialFormType>;
type MapLayerFormSchemaMember = ReturnType<MapLayerFormSchema['member']>;

export type MapLayerConfigType = NonNullable<MapLayerType['layerConfig']>;
type MapLayerConfigSchema = ObjectSchema<MapLayerConfigType, PartialFormType>;
type MapLayerConfigSchemaFields = ReturnType<MapLayerConfigSchema['fields']>;

// Mapbox Layer
export type MapboxLayerConfigType = NonNullable<MapLayerConfigType['mapboxLayer']>;
type MapboxLayerConfigSchema = ObjectSchema<MapboxLayerConfigType, PartialFormType>;
type MapboxLayerConfigSchemaFields = ReturnType<MapboxLayerConfigSchema['fields']>;

const mapboxLayerConfigSchema: MapboxLayerConfigSchema = {
    fields: (): MapboxLayerConfigSchemaFields => ({
        mapboxStyle: [],
        accessToken: [],
    }),
};

// Line Layer
export type LineLayerConfigType = NonNullable<MapLayerConfigType['lineLayer']>;
type LineLayerConfigSchema = ObjectSchema<LineLayerConfigType, PartialFormType>;
type LineLayerConfigSchemaFields = ReturnType<LineLayerConfigSchema['fields']>;

// Line Layer
export type LineLayerStyleConfigType = NonNullable<NonNullable<MapLayerConfigType['lineLayer']>['style']>;
type LineLayerStyleConfigSchema = ObjectSchema<LineLayerStyleConfigType, PartialFormType>;
type LineLayerStyleConfigSchemaFields = ReturnType<LineLayerStyleConfigSchema['fields']>;

const lineLayerStyleConfigSchema: LineLayerStyleConfigSchema = {
    fields: (): LineLayerStyleConfigSchemaFields => ({
        line: lineLayerStyleSchema,
    }),
};

const lineLayerConfigSchema: LineLayerConfigSchema = {
    fields: (): LineLayerConfigSchemaFields => ({
        contentReferenceId: [requiredCondition],
        style: lineLayerStyleConfigSchema,
    }),
};

// Polygon Layer
export type PolygonLayerConfigType = NonNullable<MapLayerConfigType['polygonLayer']>;
type PolygonLayerConfigSchema = ObjectSchema<PolygonLayerConfigType, PartialFormType>;
type PolygonLayerConfigSchemaFields = ReturnType<PolygonLayerConfigSchema['fields']>;

const polygonLayerConfigSchema: PolygonLayerConfigSchema = {
    fields: (): PolygonLayerConfigSchemaFields => ({
        contentReferenceId: [requiredCondition],
        labelColumn: [],
    }),
};

// Symbol Layer
export type SymbolLayerConfigType = NonNullable<MapLayerConfigType['symbolLayer']>;
type SymbolLayerConfigSchema = ObjectSchema<SymbolLayerConfigType, PartialFormType>;
type SymbolLayerConfigSchemaFields = ReturnType<SymbolLayerConfigSchema['fields']>;

export type SymbolLayerStyleConfigType = NonNullable<NonNullable<MapLayerConfigType['symbolLayer']>['style']>;
type SymbolLayerStyleConfigSchema = ObjectSchema<SymbolLayerStyleConfigType, PartialFormType>;
type SymbolLayerStyleConfigSchemaFields = ReturnType<SymbolLayerStyleConfigSchema['fields']>;

const symbolLayerStyleConfigSchema: SymbolLayerStyleConfigSchema = {
    fields: (): SymbolLayerStyleConfigSchemaFields => ({
        symbol: textStyleSchema,
        label: textStyleSchema,
    }),
};

const symbolLayerConfigSchema: SymbolLayerConfigSchema = {
    fields: (): SymbolLayerConfigSchemaFields => ({
        contentReferenceId: [requiredCondition],
        labelPropertyKey: [requiredCondition],
        scaleType: [],
        showLabels: [],
        symbol: [requiredCondition],
        style: symbolLayerStyleConfigSchema,
    }),
};

// Heatmap Layer
export type HeatMapLayerConfigType = NonNullable<MapLayerConfigType['heatmapLayer']>;
type HeatMapLayerConfigSchema = ObjectSchema<HeatMapLayerConfigType, PartialFormType>;
type HeatMapLayerConfigSchemaFields = ReturnType<HeatMapLayerConfigSchema['fields']>;

const heatMapLayerConfigSchema: HeatMapLayerConfigSchema = {
    fields: (): HeatMapLayerConfigSchemaFields => ({
        contentReferenceId: [requiredCondition],
        blur: [],
        radius: [],
        weighted: [],
        weightPropertyKey: [requiredCondition],
        scaleDataMax: [],
    }),
};

const mapLayerMemberItem = (): MapLayerFormSchemaMember => ({
    fields: (layerValue): MapLayerSchemaFields => {
        let layerConfigSchema: MapLayerConfigSchemaFields = {
            mapboxLayer: [defaultUndefinedType],
            lineLayer: [defaultUndefinedType],
            polygonLayer: [defaultUndefinedType],
            symbolLayer: [defaultUndefinedType],
        };

        if (layerValue?.type === 'MAPBOX_LAYER') {
            layerConfigSchema = {
                ...layerConfigSchema,
                mapboxLayer: mapboxLayerConfigSchema,
            };
        } else if (layerValue?.type === 'LINE_LAYER') {
            layerConfigSchema = {
                ...layerConfigSchema,
                lineLayer: lineLayerConfigSchema,
            };
        } else if (layerValue?.type === 'POLYGON_LAYER') {
            layerConfigSchema = {
                ...layerConfigSchema,
                polygonLayer: polygonLayerConfigSchema,
            };
        } else if (layerValue?.type === 'SYMBOL_LAYER') {
            layerConfigSchema = {
                ...layerConfigSchema,
                symbolLayer: symbolLayerConfigSchema,
            };
        } else if (layerValue?.type === 'HEAT_MAP_LAYER') {
            layerConfigSchema = {
                ...layerConfigSchema,
                heatmapLayer: heatMapLayerConfigSchema,
            };
        }

        const baseLayerSchema: MapLayerSchemaFields = ({
            clientId: [requiredCondition],
            name: [requiredCondition],
            order: [requiredCondition],
            type: [requiredCondition],
            visible: [requiredCondition],
            opacity: [],
            layerConfig: {
                fields: () => layerConfigSchema,
            },
        });

        return baseLayerSchema;
    },
});

export type TimelineChartConfigType = NonNullable<ContentConfigType['timelineChart']>;
type TimelineConfigSchema = ObjectSchema<TimelineChartConfigType, PartialFormType>;
type TimelineConfigSchemaFields = ReturnType<TimelineConfigSchema['fields']>;

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
                                    clientReferenceId: [requiredCondition],
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
                                } else if (containerValue?.contentType === 'BAR_CHART') {
                                    configSchema = {
                                        ...configSchema,
                                        barChart: {
                                            fields: (): BarChartConfigSchemaFields => ({
                                                sheet: [],

                                                direction: [requiredCondition],
                                                type: [requiredCondition],

                                                horizontalAxis: horizontalAxisSchema,
                                                verticalAxis: {
                                                    keySelector: (item) => item.clientId,
                                                    member: (): VerticalAxisFormSchemaMember => ({
                                                        fields: (): VerticalAxisSchemaFields => ({
                                                            clientId: [requiredCondition],
                                                            // TODO: Add duplicate check in list
                                                            label: [requiredCondition],
                                                            color: [],
                                                            field: [requiredCondition],
                                                            aggregationType: [defaultUndefinedType],
                                                        }),
                                                    }),
                                                },

                                                horizontalAxisTitle: [],
                                                verticalAxisTitle: [],

                                                title: [],
                                                subTitle: [],

                                                legendHeading: [],

                                                // TODO: Add min max for rotation
                                                horizontalTickLabelRotation: [],
                                                horizontalAxisLineVisible: [],
                                                verticalAxisLineVisible: [],
                                                verticalAxisExtendMaximumValue: [],
                                                verticalAxisExtendMinimumValue: [],
                                                verticalGridLineVisible: [],
                                                horizontalGridLineVisible: [],
                                                verticalTickVisible: [],
                                                horizontalTickVisible: [],

                                                style: barChartStyleSchema,
                                            }),
                                        },
                                    };
                                } else if (containerValue?.contentType === 'MAP') {
                                    configSchema = {
                                        ...configSchema,
                                        map: {
                                            fields: (): MapConfigSchemaFields => ({
                                                layers: {
                                                    keySelector: (item) => item.clientId,
                                                    member: mapLayerMemberItem,
                                                },
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
                                                            style: kpiItemStyleSchema,
                                                        }),
                                                    }),
                                                },
                                                sourceContentStyle: textStyleSchema,
                                                subtitleContentStyle: textStyleSchema,
                                                titleContentStyle: textStyleSchema,
                                                valueContentStyle: textStyleSchema,
                                            }),
                                        },
                                    };
                                } else if (containerValue?.contentType === 'TIMELINE_CHART') {
                                    configSchema = {
                                        ...configSchema,
                                        timelineChart: {
                                            fields: (): TimelineConfigSchemaFields => ({
                                                title: [requiredCondition],
                                                detail: [],
                                                date: [requiredCondition],
                                                category: [],
                                                sheet: [],
                                                source: [],
                                                sourceUrl: [],
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
