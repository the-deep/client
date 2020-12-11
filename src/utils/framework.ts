import { isDefined, doesObjectHaveNoData, compareString } from '@togglecorp/fujs';
import _ts from '#ts';
import {
    FrameworkFields,
    MiniFrameworkElement,
    Matrix2dWidgetElement,
    Matrix2dFlatSectorElement,
    Matrix2dFlatSubsectorElement,
    Matrix2dFlatDimensionElement,
    Matrix2dFlatSubdimensionElement,
    Matrix1dWidgetElement,
    MatrixTocElement,
    ScaleWidget,
    WidgetElement,
    ConditionalWidget,
    Entry,
    TocCountMap,
    ReportStructureVariant,
} from '#typings';

export const SECTOR_FIRST: ReportStructureVariant = 'sectorFirst';
export const DIMENSION_FIRST: ReportStructureVariant = 'dimensionFirst';

interface Matrix2dData {
    sectors: {
        id: number;
        title: string;
    }[];
    dimensions: {
        id: number;
        title: string;
        subdimensions: {
            id: string;
            title: string;
        }[];
    }[];
}

// NOTE: This function generates dimension first level
const transformMatrix2dLevels = ({
    dimensions: widgetDim,
    sectors: widgetSec,
}: Matrix2dData) => {
    const dimensionFirstLevels = widgetDim.map((d) => {
        const subDims = d.subdimensions;

        const sublevels = subDims.map((sd) => {
            const sectors = widgetSec.map(s => ({
                id: `${s.id}-${d.id}-${sd.id}`,
                title: s.title,
            }));
            return ({
                id: `${d.id}-${sd.id}`,
                title: sd.title,
                sublevels: sectors,
            });
        });

        return ({
            id: d.id,
            title: d.title,
            sublevels,
        });
    });

    return dimensionFirstLevels;
};

interface Level {
    id: string | number;
    title: string;
    sublevels?: Level[];
}

interface LevelOutput {
    key: Level['id'];
    title: Level['title'];
    selected: boolean;
    draggable: boolean;
    nodes?: LevelOutput[];
}

interface WidgetData {
    data: {
        value: string;
    };
}

interface ConditionalAttribute {
    selectedWidgetKey?: string;
    [key: string]: WidgetData | string | undefined;
}

const contextualWidgetTypes = [
    'selectWidget',
    'multiselectWidget',
    'scaleWidget',
    'geoWidget',
    'timeWidget',
    'dateWidget',
    'organigramWidget',
    'dateRangeWidget',
    'timeRangeWidget',
];

function isWidgetData(arg: unknown): arg is WidgetData {
    return arg?.data?.value !== undefined;
}

export function mapReportLevelsToNodes(levels: Level[]): LevelOutput[] {
    return levels.map(level => ({
        key: level.id,
        title: level.title,
        selected: true,
        draggable: true,
        nodes: level.sublevels && mapReportLevelsToNodes(level.sublevels),
    }));
}

export const createReportStructure = (
    analysisFramework: FrameworkFields,
    reportStructureVariant: ReportStructureVariant = SECTOR_FIRST,
) => {
    if (!analysisFramework) {
        return undefined;
    }

    const { exportables, widgets } = analysisFramework;
    if (!exportables || !widgets) {
        return undefined;
    }

    const nodes = [];
    exportables.forEach((exportableUntyped) => {
        const exportable = exportableUntyped as {
            id: number;
            widgetKey: string;
            data?: {
                report?: {
                    levels?: Level[];
                };
            };
        };
        const levels = exportable.data && exportable.data.report &&
            exportable.data.report.levels;
        const widget = widgets.find(w => w.key === exportable.widgetKey);

        if (!levels || !widget) {
            return;
        }

        if (widget.widgetId === 'matrix2dWidget' && reportStructureVariant === DIMENSION_FIRST) {
            if (!widget.properties) {
                return;
            }
            const matrix2dProperties = widget.properties.data as Matrix2dData;
            const newLevels = transformMatrix2dLevels(matrix2dProperties);
            nodes.push({
                title: widget.title,
                key: String(exportable.id),
                selected: true,
                draggable: true,
                nodes: mapReportLevelsToNodes(newLevels),
            });
        } else {
            nodes.push({
                title: widget.title,
                key: String(exportable.id),
                selected: true,
                draggable: true,
                nodes: mapReportLevelsToNodes(levels),
            });
        }
    });

    nodes.push({
        title: _ts('export', 'uncategorizedTitle'),
        key: 'uncategorized',
        selected: true,
        draggable: true,
    });

    return nodes;
};

const emptyObject = {
    sectorList: [],
    dimensionList: [],
    subsectorList: [],
    subdimensionList: [],
};

const emptyArray: MatrixTocElement[] = [];

export const getMatrix2dStructures = (framework: MiniFrameworkElement | undefined) => {
    if (!framework) {
        return emptyObject;
    }

    const {
        widgets,
    } = framework;

    const matrix2dList = widgets.filter(d => d.widgetId === 'matrix2dWidget');

    if (matrix2dList.length === 0) {
        return emptyObject;
    }

    const sectorList: Matrix2dFlatSectorElement[] = [];
    let subsectorList: Matrix2dFlatSubsectorElement[] = [];
    const dimensionList: Matrix2dFlatDimensionElement[] = [];
    let subdimensionList: Matrix2dFlatSubdimensionElement[] = [];

    matrix2dList.forEach((matrix2d) => {
        const {
            properties: {
                data: {
                    sectors,
                    dimensions,
                } = {
                    sectors: [],
                    dimensions: [],
                },
            },
        } = matrix2d as Matrix2dWidgetElement;


        let currentSubsectorList: Matrix2dFlatSubsectorElement[] = [];
        let currentSubdimensionList: Matrix2dFlatSubdimensionElement[] = [];

        sectors.forEach((sector) => {
            sectorList.push({
                id: sector.id,
                title: sector.title,
                matrix2dId: matrix2d.id,
                matrix2dTitle: matrix2d.title,
            });

            currentSubsectorList = [
                ...currentSubsectorList,
                ...sector.subsectors.map(subsector => ({
                    id: subsector.id,
                    title: subsector.title,
                    sectorId: sector.id,
                    sectorTitle: sector.title,
                    matrix2dId: matrix2d.id,
                    matrix2dTitle: matrix2d.title,
                })),
            ];
        });

        subsectorList = [
            ...subsectorList,
            ...currentSubsectorList,
        ];

        dimensions.forEach((dimension) => {
            dimensionList.push({
                id: dimension.id,
                title: dimension.title,
                matrix2dId: matrix2d.id,
                matrix2dTitle: matrix2d.title,
            });

            currentSubdimensionList = [
                ...currentSubdimensionList,
                ...dimension.subdimensions.map(subdimension => ({
                    id: subdimension.id,
                    title: subdimension.title,
                    dimensionId: dimension.id,
                    dimensionTitle: dimension.title,
                    matrix2dId: matrix2d.id,
                    matrix2dTitle: matrix2d.title,
                })),
            ];
        });

        subdimensionList = [
            ...subdimensionList,
            ...currentSubdimensionList,
        ];
    });

    return {
        sectorList,
        dimensionList,
        subsectorList,
        subdimensionList,
    };
};

export const getMatrix1dToc = (
    framework: FrameworkFields | undefined,
    tocCount: TocCountMap,
): MatrixTocElement[] => {
    if (!framework || doesObjectHaveNoData(framework)) {
        return emptyArray;
    }

    const {
        widgets,
    } = framework;

    const matrix1dList = widgets.filter(d => d.widgetId === 'matrix1dWidget');

    if (matrix1dList.length === 0) {
        return emptyArray;
    }

    const toc = matrix1dList.map((widget) => {
        const {
            key,
            title,
            properties,
        } = widget as Matrix1dWidgetElement;

        const { data } = properties;

        if (!data) {
            return undefined;
        }

        const { rows } = data;
        const transformedRows = rows.map((row) => {
            const { key: rowKey, title: rowTitle, cells } = row;

            const transformedCells = cells.map(({
                key: cellKey,
                value,
            }) => {
                const count = tocCount?.[key]?.[cellKey];

                return ({
                    id: cellKey,
                    key,
                    title: value,
                    verified: count?.verifiedCount,
                    unverified: count?.unverifiedCount,
                    uniqueId: `${key}-${cellKey}`,
                });
            });

            const count = tocCount?.[key]?.[rowKey];

            return ({
                id: rowKey,
                key,
                title: rowTitle,
                verified: count?.verifiedCount,
                unverified: count?.unverifiedCount,
                children: transformedCells,
                uniqueId: `${key}-${rowKey}`,
            });
        });

        return ({
            id: key,
            title,
            children: transformedRows,
            uniqueId: key,
        });
    });

    return toc.filter(isDefined);
};

export const getMatrix2dToc = (
    framework: FrameworkFields | undefined,
    tocCount: TocCountMap,

): MatrixTocElement[] => {
    if (!framework || doesObjectHaveNoData(framework)) {
        return emptyArray;
    }

    const {
        widgets,
    } = framework;

    const matrix2dList = widgets.filter(d => d.widgetId === 'matrix2dWidget');

    if (matrix2dList.length === 0) {
        return emptyArray;
    }

    const toc = matrix2dList.map((widget) => {
        const {
            key,
            title,
            properties,
        } = widget as Matrix2dWidgetElement;

        const { data } = properties;
        if (!data) {
            return undefined;
        }
        const { dimensions, sectors } = data;
        const dimensionKey = `${key}-dimensions`;
        const sectorKey = `${key}-sectors`;
        const transformedDimensions = dimensions.map((dimension) => {
            const { id: dimensionId, title: dimensionTitle, subdimensions } = dimension;

            const transformedSubDimensions = subdimensions.map(
                ({
                    id: subDimensionId,
                    title: subDimensionTitle,
                }) => {
                    const count = tocCount?.[key]?.[subDimensionId];

                    return {
                        id: subDimensionId,
                        key: dimensionKey,
                        title: subDimensionTitle,
                        verified: count?.verifiedCount,
                        unverified: count?.unverifiedCount,
                        uniqueId: `${dimensionKey}-${subDimensionId}`,
                    };
                },
            );

            const count = tocCount?.[key]?.[dimensionId];

            return ({
                id: dimensionId,
                key: dimensionKey,
                title: dimensionTitle,
                verified: count?.verifiedCount,
                unverified: count?.unverifiedCount,
                children: transformedSubDimensions,
                uniqueId: `${dimensionKey}-${dimensionId}`,
            });
        });

        const transformedSectors = sectors.map((sector) => {
            const { id: sectorId, title: sectorTitle, subsectors } = sector;

            const transformedSubSectors = subsectors.map(
                ({
                    id: subSectorId,
                    title: subSectorTitle,
                }) => {
                    const count = tocCount?.[key]?.[subSectorId];

                    return {
                        id: subSectorId,
                        key: sectorKey,
                        title: subSectorTitle,
                        verified: count?.verifiedCount,
                        unverified: count?.unverifiedCount,
                        uniqueId: `${sectorKey}-${subSectorId}`,
                    };
                },
            );

            const count = tocCount?.[key]?.[sectorId];

            return ({
                id: sectorId,
                key: sectorKey,
                title: sectorTitle,
                verified: count?.verifiedCount,
                unverified: count?.unverifiedCount,
                children: transformedSubSectors,
                uniqueId: `${sectorKey}-${sectorId}`,
            });
        });

        return {
            id: key,
            title,
            uniqueId: key,
            children: [
                {
                    id: 'dimensions',
                    title: 'Dimensions',
                    children: transformedDimensions,
                    uniqueId: 'dimensions',
                },
                {
                    id: 'sectors',
                    title: 'Sectors',
                    children: transformedSectors,
                    uniqueId: 'sectors',
                },
            ],
        };
    });

    return toc.filter(isDefined);
};

export function getScaleWidgetsData(framework: FrameworkFields, entry: Entry) {
    if (!framework || !framework.widgets) {
        return [];
    }

    const { widgets } = framework;

    const scaleWidgets = widgets
        .filter(w => w.widgetId === 'scaleWidget')
        .map((w) => {
            const attributeData = entry.attributes[w.id];
            const { properties: { data: { scaleUnits } } } = w as WidgetElement<ScaleWidget>;
            if (isWidgetData(attributeData)) {
                const value = scaleUnits.find(v => v.key === attributeData.data.value);
                return value;
            }
            return undefined;
        })
        .filter(isDefined);

    const scaleWidgetsInsideConditionals = widgets
        .filter(w => w.widgetId === 'conditionalWidget')
        .map((conditional) => {
            const { id } = conditional;
            const {
                widgets: widgetsInsideConditional = [],
            } = (conditional as WidgetElement<ConditionalWidget>).properties.data;

            return widgetsInsideConditional
                .filter(w => w.widget && w.widget.widgetId === 'scaleWidget')
                .map(({ widget }) => {
                    const widgetAttributeData = entry
                        .attributes[id]?.data?.value as ConditionalAttribute;

                    if (!widgetAttributeData?.selectedWidgetKey) {
                        return undefined;
                    }
                    const { selectedWidgetKey } = widgetAttributeData;
                    const attributeData = widgetAttributeData[selectedWidgetKey];

                    if (attributeData && isWidgetData(attributeData)) {
                        const {
                            properties: {
                                data: {
                                    scaleUnits,
                                },
                            },
                        } = widget as WidgetElement<ScaleWidget>;

                        return scaleUnits.find(v => v.key === attributeData.data.value);
                    }
                    return undefined;
                });
        }).flat().filter(isDefined);
    return [
        ...scaleWidgets,
        ...scaleWidgetsInsideConditionals,
    ];
}

export function getTextWidgetsFromFramework(framework: FrameworkFields) {
    if (!framework || !framework.widgets) {
        return [];
    }

    const { widgets } = framework;

    const textWidgets = widgets
        .filter(w => w.widgetId === 'textWidget')
        .map(w => ({
            title: w.title,
            key: w.key,
            id: w.id,
            selected: true,
            draggable: true,
        }));

    const textWidgetsInsideConditionals = widgets
        .filter(w => w.widgetId === 'conditionalWidget')
        .map((conditional) => {
            const {
                title,
                id,
            } = conditional;
            const {
                widgets: widgetsInsideConditional = [],
            } = (conditional as WidgetElement<ConditionalWidget>).properties.data;

            return widgetsInsideConditional
                .filter(w => w.widget && w.widget.widgetId === 'textWidget')
                .map(({ widget }) => (
                    {
                        key: widget.key,
                        id: widget.key,
                        title: `${title} › ${widget.title}`,
                        actualTitle: widget.title,
                        conditionalId: id,
                        isConditional: true,
                        selected: true,
                        draggable: true,
                    }
                ));
        }).flat();

    return [...textWidgets, ...textWidgetsInsideConditionals];
}

export function getContextualWidgetsFromFramework(framework: FrameworkFields) {
    if (!framework || !framework.widgets) {
        return [];
    }

    const { widgets } = framework;

    const isContextualWidget = (id: string) => contextualWidgetTypes.some(w => w === id);

    const contextualWidgets = widgets
        .filter(({ widgetId }) => isContextualWidget(widgetId))
        .sort((a, b) => compareString(a.widgetId, b.widgetId))
        .map(w => ({
            title: w.title,
            key: w.key,
            id: w.id,
            selected: true,
            draggable: true,
        }));

    const contextualWidgetsInsideConditionals = widgets
        .filter(w => w.widgetId === 'conditionalWidget')
        .map((conditional) => {
            const {
                title,
                id,
            } = conditional;
            const {
                widgets: widgetsInsideConditional = [],
            } = (conditional as WidgetElement<ConditionalWidget>).properties.data;

            return widgetsInsideConditional
                .filter(w => w.widget && isContextualWidget(w.widget.widgetId))
                .sort((a, b) => compareString(a.widget.widgetId, b.widget.widgetId))
                .map(({ widget }) => (
                    {
                        key: widget.key,
                        id: widget.key,
                        title: `${title} › ${widget.title}`,
                        actualTitle: widget.title,
                        conditionalId: id,
                        isConditional: true,
                        selected: true,
                        draggable: true,
                    }
                ));
        }).flat();

    return [...contextualWidgets, ...contextualWidgetsInsideConditionals];
}
