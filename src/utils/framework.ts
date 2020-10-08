import _ts from '#ts';
import {
    FrameworkElement,
    FrameworkFields,
    MiniFrameworkElement,
    Matrix2dWidgetElement,
    Matrix2dFlatSectorElement,
    Matrix2dFlatSubsectorElement,
    Matrix2dFlatDimensionElement,
    Matrix2dFlatSubdimensionElement,
    Matrix1dWidgetElement,
    MatrixTocElement,
} from '#typings';

export const SECTOR_FIRST = 'sectorFirst';
export const DIMENSION_FIRST = 'dimensionFirst';

interface Matrix2dData {
    sectors: {
        id: number | string;
        title: string;
    }[];
    dimensions: {
        id: number | string;
        title: string;
        subdimensions: {
            id: number | string;
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
    analysisFramework: FrameworkElement,
    reportStructureVariant = SECTOR_FIRST,
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

export const getMatrix1dToc = (framework: FrameworkFields | undefined): MatrixTocElement[] => {
    if (!framework) {
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
            id,
            title,
            properties,
        } = widget as Matrix1dWidgetElement;

        const { data } = properties;
        if (!data) {
            return ({
                id,
                title,
            });
        }

        const { rows } = data;
        const transformedRows = rows.map((row) => {
            const { key, title: rowTitle, cells } = row;

            const transformedCells = cells.map(({
                key: cellKey,
                value,
            }) => ({ id: cellKey, title: value }));

            return ({
                id: key,
                title: rowTitle,
                children: transformedCells,
            });
        });

        return ({
            id,
            title,
            children: transformedRows,
        });
    });

    return toc;
};

export const getMatrix2dToc = (framework: FrameworkFields | undefined): MatrixTocElement[] => {
    if (!framework) {
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
            id,
            title,
            properties,
        } = widget as Matrix2dWidgetElement;

        const { data } = properties;
        if (!data) {
            return ({
                id,
                title,
            });
        }
        const { dimensions, sectors } = data;
        const transformedDimensions = dimensions.map((dimension) => {
            const { id: dimensionId, title: dimensionTitle, subdimensions } = dimension;

            const transformedSubDimensions = subdimensions.map(
                ({
                    id: subDimensionId,
                    title: subDimensionTitle,
                }) => ({ id: subDimensionId, title: subDimensionTitle }),
            );

            return ({
                id: dimensionId,
                title: dimensionTitle,
                children: transformedSubDimensions,
            });
        });

        const transformedSectors = sectors.map((sector) => {
            const { id: sectorId, title: sectorTitle, subsectors } = sector;

            const transformedSubSectors = subsectors.map(
                ({
                    id: subSectorId,
                    title: subSectorTitle,
                }) => ({ id: subSectorId, title: subSectorTitle }),
            );

            return ({
                id: sectorId,
                title: sectorTitle,
                children: transformedSubSectors,
            });
        });

        return {
            id,
            title,
            children: [
                {
                    id: 'dimensions',
                    title: 'Dimensions',
                    children: transformedDimensions,
                },
                {
                    id: 'sectors',
                    title: 'Sectors',
                    children: transformedSectors,
                },
            ],
        };
    });

    return toc;
};
