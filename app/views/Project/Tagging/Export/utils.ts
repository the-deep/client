import _ts from '#ts';
import {
    FrameworkFields,
    Matrix2dWidgetElement,
    Level,
    ReportStructure,
} from '#types';

export const SECTOR_FIRST = 'sectorFirst' as const;
export const DIMENSION_FIRST = 'rowFirst' as const;

function createId<T extends string | number>(...args: [T, T, ...T[]]) {
    return args.join('-');
}

// NOTE: This function generates row first level
const transformLevelsRowFirst = (
    {
        rows: widgetDim,
        columns: widgetSec,
    }: Matrix2dWidgetElement['properties'],
    includeSubColumn: boolean,
) => {
    const rowFirstLevels = widgetDim.map((d) => {
        const subDims = d.subRows;

        const sublevels = subDims.map((sd) => {
            const columns = widgetSec.map((s) => {
                const { subColumns } = s;
                return ({
                    id: createId(s.clientId, d.clientId, sd.clientId),
                    title: s.label,
                    sublevels: includeSubColumn
                        ? subColumns.map((ss) => ({
                            id: createId(s.clientId, ss.clientId, d.clientId, sd.clientId),
                            title: ss.label,
                        }))
                        : undefined,
                });
            });
            return ({
                id: createId(d.clientId, sd.clientId),
                title: sd.label,
                sublevels: columns,
            });
        });

        return ({
            id: d.clientId,
            title: d.label,
            sublevels,
        });
    });

    return rowFirstLevels;
};

const transformLevelsColumnFirst = ({
    rows: widgetDim,
    columns: widgetSec,
}: Matrix2dWidgetElement['properties']) => {
    const sectorFirstLevels = widgetSec.map((s) => {
        const { subColumns } = s;
        let sublevels: Level[] = [];
        if (subColumns) {
            sublevels = subColumns.map((ss) => {
                const rows = widgetDim.map((d) => {
                    const { subRows } = d;
                    const subRowsLevel = subRows.map((sd) => ({
                        id: createId(s.clientId, ss.clientId, d.clientId, sd.clientId),
                        title: sd.label,
                    }));
                    return ({
                        id: createId(s.clientId, ss.clientId, d.clientId),
                        title: d.label,
                        sublevels: subRowsLevel,
                    });
                });
                return ({
                    id: createId(s.clientId, ss.clientId),
                    title: ss.label,
                    sublevels: rows,
                });
            });
        } else {
            sublevels = widgetDim.map((d) => {
                const { subRows } = d;
                const subRowsLevel = subRows.map((sd) => ({
                    id: createId(s.clientId, d.clientId, sd.clientId),
                    title: sd.label,
                }));
                return ({
                    id: createId(s.clientId, d.clientId),
                    title: d.label,
                    sublevels: subRowsLevel,
                });
            });
        }

        return ({
            id: s.clientId,
            title: s.label,
            sublevels,
        });
    });

    return sectorFirstLevels;
};

export function mapReportLevelsToNodes(levels: Level[]): ReportStructure[] {
    return levels.map((level) => ({
        key: level.id,
        title: level.title,
        selected: true,
        draggable: true,
        nodes: level.sublevels && mapReportLevelsToNodes(level.sublevels),
    }));
}

export const createReportStructure = (
    reportStructureVariant: string = SECTOR_FIRST,
    includeSubColumn: boolean,
    analysisFramework?: FrameworkFields,
) => {
    if (!analysisFramework) {
        return [];
    }

    const { exportables, widgets } = analysisFramework;
    if (!exportables || !widgets) {
        return [];
    }

    const nodes = [];
    exportables.forEach((exportable) => {
        const levels = exportable.data && exportable.data.report
            && exportable.data.report.levels;
        const widget = widgets.find((w) => w.key === exportable.widgetKey);

        if (!levels || !widget) {
            return;
        }

        if (widget.widgetId === 'matrix2dWidget' && reportStructureVariant === DIMENSION_FIRST) {
            if (!widget.properties) {
                return;
            }
            const { properties } = widget as Matrix2dWidgetElement;
            // console.warn('data', data);
            const newLevels = transformLevelsRowFirst(properties, includeSubColumn);
            nodes.push({
                title: widget.title,
                key: String(exportable.id),
                selected: true,
                draggable: true,
                nodes: mapReportLevelsToNodes(newLevels),
            });
        } else if (includeSubColumn && widget.widgetId === 'matrix2dWidget' && reportStructureVariant === SECTOR_FIRST) {
            if (!widget.properties) {
                return;
            }
            const { properties } = widget as Matrix2dWidgetElement;
            const newLevels = transformLevelsColumnFirst(properties);
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
                nodes: mapReportLevelsToNodes(levels as Level[]),
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
