import { isDefined } from '@togglecorp/fujs';
import _ts from '#ts';

import {
    Matrix2dProperties,
    Level,
} from '#types/newAnalyticalFramework';
import {
    ReportStructure,
    AnalysisFramework,
} from './types';

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
function transformLevelsRowFirst(
    matrix2dProperties: Matrix2dProperties,
    includeSubColumn: boolean,
): Level[] {
    const rowFirstLevels = matrix2dProperties.rows.map((row) => {
        const sublevels = row.subRows.map((subRow) => {
            const columns = matrix2dProperties.columns.map((column) => (
                {
                    id: createId(column.key, row.key, subRow.key),
                    title: column.label,
                    sublevels: includeSubColumn
                        ? column.subColumns.map((subColumn) => ({
                            id: createId(
                                column.key,
                                subColumn.key,
                                row.key,
                                subRow.key,
                            ),
                            title: subColumn.label,
                        }))
                        : undefined,
                }));

            return ({
                id: createId(row.key, subRow.key),
                title: subRow.label,
                sublevels: columns,
            });
        });

        return ({
            id: row.key,
            title: row.label,
            sublevels,
        });
    });

    return rowFirstLevels;
}

function transformLevelsColumnFirst(
    matrix2dProperties: Matrix2dProperties,
): Level[] {
    const sectorFirstLevels = matrix2dProperties.columns.map((column) => {
        let sublevels: Level[] = [];
        // NOTE: Subcolumns always is an empty list
        if (column.subColumns.length > 0) {
            sublevels = column.subColumns.map((subColumn) => {
                const rows = matrix2dProperties.rows.map((row) => {
                    const subRowsLevel = row.subRows.map((subRow) => ({
                        id: createId(
                            column.key,
                            subColumn.key,
                            row.key,
                            subRow.key,
                        ),
                        title: subRow.label,
                    }));
                    return ({
                        id: createId(column.key, subColumn.key, row.key),
                        title: row.label,
                        sublevels: subRowsLevel,
                    });
                });
                return ({
                    id: createId(column.key, subColumn.key),
                    title: subColumn.label,
                    sublevels: rows,
                });
            });
        } else {
            sublevels = matrix2dProperties.rows.map((row) => {
                const subRowsLevel = row.subRows.map((subRow) => ({
                    id: createId(column.key, row.key, subRow.key),
                    title: subRow.label,
                }));
                return ({
                    id: createId(column.key, row.key),
                    title: row.label,
                    sublevels: subRowsLevel,
                });
            });
        }

        return ({
            id: column.key,
            title: column.label,
            sublevels,
        });
    });

    return sectorFirstLevels;
}

function mapReportLevelsToNodes(levels: Level[]): ReportStructure[] {
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
): ReportStructure[] => {
    if (!analysisFramework || !analysisFramework.exportables) {
        return [];
    }

    const { exportables } = analysisFramework;

    const widgets = getWidgets(analysisFramework);
    if (!widgets) {
        return [];
    }

    // FIXME: we are creating exportable for Matrix2d,
    // if we create exportable for Matrix1d we can just not read exportable on
    // client at all
    const nodes = exportables.map((exportable) => {
        if (exportable.widgetType === 'MATRIX2D') {
            const widget = widgets.find((w) => w.key === exportable.widgetKey);
            if (!widget || widget.widgetId !== exportable.widgetType || !widget.properties) {
                return undefined;
            }
            const { properties } = widget;

            let newLevels = exportable?.data?.report?.levels;
            if (reportStructureVariant === DIMENSION_FIRST) {
                newLevels = transformLevelsRowFirst(properties, includeSubColumn);
            } else if (includeSubColumn) {
                newLevels = transformLevelsColumnFirst(properties);
            }

            if (!newLevels) {
                return undefined;
            }

            return {
                title: widget.title,
                key: String(exportable.id),
                selected: true,
                draggable: true,
                nodes: mapReportLevelsToNodes(newLevels),
            };
        }
        if (exportable.widgetType === 'MATRIX1D') {
            const widget = widgets.find((w) => w.key === exportable.widgetKey);
            if (!widget || widget.widgetId !== exportable.widgetType) {
                return undefined;
            }
            const newLevels = exportable?.data?.report?.levels;
            if (!newLevels) {
                return undefined;
            }
            return {
                title: widget.title,
                key: String(exportable.id),
                selected: true,
                draggable: true,
                nodes: mapReportLevelsToNodes(newLevels),
            };
        }
        return undefined;
    }).filter(isDefined);

    nodes.push({
        title: _ts('export', 'uncategorizedTitle'),
        key: 'uncategorized',
        selected: true,
        draggable: true,
        // FIXME: added line below, check if this works
        nodes: [],
    });

    return nodes;
};
