import _ts from '#ts';
import {
    FrameworkElement,
    Matrix2dFlatSectorElement,
    Matrix2dFlatSubsectorElement,
    Matrix2dFlatDimensionElement,
    Matrix2dFlatSubdimensionElement,
    Matrix2dWidgetElement,
} from '#typings';

export const SECTOR_FIRST = 'sectorFirst';
export const DIMENSION_FIRST = 'dimensionFirst';


// NOTE: This function generates dimension first level
export const transformMatrix2dLevels = ({
    sectors: widgetSec,
    dimensions: widgetDim,
} = {}) => {
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

export const mapReportLevelsToNodes = levels => levels.map(level => ({
    key: level.id,
    title: level.title,
    selected: true,
    draggable: true,
    nodes: level.sublevels && mapReportLevelsToNodes(level.sublevels),
}));

export const createReportStructure = (
    analysisFramework,
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
    exportables.forEach((exportable) => {
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
            const newLevels = transformMatrix2dLevels(widget.properties.data);
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

export const getMatrix2dStructures = (framework: FrameworkElement) => {
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
