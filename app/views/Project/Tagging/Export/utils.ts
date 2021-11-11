import { isDefined } from '@togglecorp/fujs';
import _ts from '#ts';

import { Matrix2dProperties } from '#types/newAnalyticalFramework';
import {
    Level,
    ReportStructure,
} from '#types';
import { AnalysisFramework } from './types';

export const SECTOR_FIRST = 'sectorFirst' as const;
export const DIMENSION_FIRST = 'rowFirst' as const;

export function getWidgets(framework: AnalysisFramework | undefined | null) {
    if (!framework) {
        return undefined;
    }
    const primaryWidgets = framework.primaryTagging?.map((v) => v.widgets)
        .flat().filter(isDefined);
    const secondaryWidgets = framework.secondaryTagging;
    const allWidgets = [
        ...(primaryWidgets || []),
        ...(secondaryWidgets || []),
    ];

    return allWidgets;
}

function createId<T extends string | number>(...args: [T, T, ...T[]]) {
    return args.join('-');
}

// NOTE: This function generates row first level
const transformLevelsRowFirst = (
    matrix2dProperties: Matrix2dProperties,
    includeSubColumn: boolean,
) => {
    const rowFirstLevels = matrix2dProperties.rows.map((row) => {
        const sublevels = row.subRows.map((subRow) => {
            const columns = matrix2dProperties.columns.map((column) => (
                {
                    id: createId(column.clientId, row.clientId, subRow.clientId),
                    title: column.label,
                    sublevels: includeSubColumn
                        ? column.subColumns.map((subColumn) => ({
                            id: createId(
                                column.clientId,
                                subColumn.clientId,
                                row.clientId,
                                subRow.clientId,
                            ),
                            title: subColumn.label,
                        }))
                        : undefined,
                }));

            return ({
                id: createId(row.clientId, subRow.clientId),
                title: subRow.label,
                sublevels: columns,
            });
        });

        return ({
            id: row.clientId,
            title: row.label,
            sublevels,
        });
    });

    return rowFirstLevels;
};

const transformLevelsColumnFirst = (matrix2dProperties: Matrix2dProperties) => {
    const sectorFirstLevels = matrix2dProperties.columns.map((column) => {
        let sublevels: Level[] = [];
        if (column.subColumns) {
            sublevels = column.subColumns.map((subColumn) => {
                const rows = matrix2dProperties.rows.map((row) => {
                    const subRowsLevel = row.subRows.map((subRow) => ({
                        id: createId(
                            column.clientId,
                            subColumn.clientId,
                            row.clientId,
                            subRow.clientId,
                        ),
                        title: subRow.label,
                    }));
                    return ({
                        id: createId(column.clientId, subColumn.clientId, row.clientId),
                        title: row.label,
                        sublevels: subRowsLevel,
                    });
                });
                return ({
                    id: createId(column.clientId, subColumn.clientId),
                    title: subColumn.label,
                    sublevels: rows,
                });
            });
        } else {
            sublevels = matrix2dProperties.rows.map((row) => {
                const subRowsLevel = row.subRows.map((subRow) => ({
                    id: createId(column.clientId, row.clientId, subRow.clientId),
                    title: subRow.label,
                }));
                return ({
                    id: createId(column.clientId, row.clientId),
                    title: row.label,
                    sublevels: subRowsLevel,
                });
            });
        }

        return ({
            id: column.clientId,
            title: column.label,
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
    analysisFramework: AnalysisFramework | null | undefined,
) => {
    if (!analysisFramework) {
        return [];
    }

    const { exportables } = analysisFramework;
    const widgets = getWidgets(analysisFramework);
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

        if (widget.widgetId === 'MATRIX2D' && reportStructureVariant === DIMENSION_FIRST) {
            if (!widget.properties) {
                return;
            }
            const newLevels = transformLevelsRowFirst(widget.properties, includeSubColumn);
            nodes.push({
                title: widget.title,
                key: String(exportable.id),
                selected: true,
                draggable: true,
                nodes: mapReportLevelsToNodes(newLevels),
            });
        } else if (includeSubColumn && widget.widgetId === 'MATRIX2D' && reportStructureVariant === SECTOR_FIRST) {
            if (!widget.properties) {
                return;
            }
            const newLevels = transformLevelsColumnFirst(widget.properties);
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
