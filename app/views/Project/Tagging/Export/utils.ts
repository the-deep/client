import { isDefined, listToMap } from '@togglecorp/fujs';
import _ts from '#ts';

import {
    Matrix2dProperties,
    Level,
    Widget,
} from '#types/newAnalyticalFramework';
import { PartialEntriesFilterDataType } from '#views/Project/Tagging/Sources/SourcesFilter/schema';
import { ExportItem } from './ExportHistory';
import {
    ReportStructure,
    AnalysisFramework,
    ExportReportStructure,
    Node,
    TreeSelectableWidget,
} from './types';

export const SECTOR_FIRST = 'columnFirst' as const;
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

// NOTE: This function is used to generate report levels for matrix2d
// It currently filters out any item that is not part of the item in the 2 filter lists of matrix2d
function mapReportLevelsToNodes(
    levels: Level[],
    rowsSet: Set<string>,
    colsSet: Set<string>,
): ReportStructure[] {
    return levels.map((level) => {
        // NOTE: If there are no filters selected, we show everything
        if (rowsSet.size === 0 && colsSet.size === 0) {
            return ({
                key: level.id,
                title: level.title,
                selected: true,
                draggable: true,
                nodes: level.sublevels && mapReportLevelsToNodes(
                    level.sublevels, rowsSet, colsSet,
                ),
            });
        }

        const splits = level.id.split('-');
        // NOTE: Levels are by default a composite of keys
        // We are checking for any item in the list of keys to include all children
        // of selected root as well
        // Sample level: {rowId}-{subRowId}-{colId}-{subColId}
        // If row/col is selected in filter, we show all child of that row
        const isActiveRowKey = splits.some(
            (split) => rowsSet.has(split),
        );

        const isActiveColKey = splits.some(
            (split) => colsSet.has(split),
        );

        // NOTE: If both row and col filters are applied, we need to apply AND logic
        const isActiveKey = (rowsSet.size > 0 && colsSet.size > 0)
            ? (isActiveRowKey && isActiveColKey)
            : (isActiveRowKey || isActiveColKey);

        if (level.sublevels) {
            const nodes = mapReportLevelsToNodes(
                level.sublevels,
                rowsSet,
                colsSet,
            );

            if (nodes.length > 0 || isActiveKey) {
                return ({
                    key: level.id,
                    title: level.title,
                    selected: true,
                    draggable: true,
                    nodes,
                });
            }
        } else if (isActiveKey) {
            return ({
                key: level.id,
                title: level.title,
                selected: true,
                draggable: true,
                nodes: undefined,
            });
        }

        return undefined;
    }).filter(isDefined);
}

export const createReportStructure = (
    reportStructureVariant: string = SECTOR_FIRST,
    includeSubColumn: boolean,
    analysisFramework: AnalysisFramework | null | undefined,
    filterData: PartialEntriesFilterDataType['filterableData'],
): ReportStructure[] => {
    if (!analysisFramework || !analysisFramework.exportables) {
        return [];
    }

    const {
        exportables,
        filters,
    } = analysisFramework;

    const filterKeyWidgetIdMap = listToMap(
        filters,
        (d) => d.key,
        (d) => d.widgetKey,
    );

    const widgets = getWidgets(analysisFramework);
    if (!widgets) {
        return [];
    }

    const filterWithWidgetId = filterData?.map((filter) => ({
        widgetKey: filterKeyWidgetIdMap?.[filter.filterKey],
        valueList: filter?.valueList,
    }));

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

            // NOTE: There can two filters for matrix2d
            const appliedValuesList = filterWithWidgetId?.filter(
                (f) => f.widgetKey === exportable.widgetKey,
            ).map((v) => v.valueList).filter(isDefined);

            const rowsSet = new Set(appliedValuesList?.[0]);
            const colsSet = new Set(appliedValuesList?.[1]);

            return {
                title: widget.title,
                key: String(exportable.id),
                selected: true,
                draggable: true,
                nodes: mapReportLevelsToNodes(
                    newLevels,
                    rowsSet,
                    colsSet,
                ),
            };
        }
        if (exportable.widgetType === 'MATRIX1D') {
            const widget = widgets.find((w) => w.key === exportable.widgetKey);
            // NOTE: There can only be one filter for matrix1d
            const appliedFilter = filterWithWidgetId?.find(
                (f) => f.widgetKey === exportable.widgetKey,
            );
            if (!widget || widget.widgetId !== exportable.widgetType) {
                return undefined;
            }
            const newLevels = exportable?.data?.report?.levels;
            if (!newLevels) {
                return undefined;
            }
            const rowsSet = new Set(appliedFilter?.valueList);
            const emptySet = new Set<string>();
            return {
                title: widget.title,
                key: String(exportable.id),
                selected: true,
                draggable: true,
                nodes: mapReportLevelsToNodes(newLevels, rowsSet, emptySet),
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

export function filterContexualWidgets(widgets: Widget[] | undefined) {
    const contextualWidgets = widgets?.filter((v) => (
        v.widgetId === 'SELECT'
        || v.widgetId === 'MULTISELECT'
        || v.widgetId === 'SCALE'
        || v.widgetId === 'GEO'
        || v.widgetId === 'TIME'
        || v.widgetId === 'DATE'
        || v.widgetId === 'ORGANIGRAM'
        || v.widgetId === 'DATE_RANGE'
        || v.widgetId === 'TIME_RANGE'
    ));

    return contextualWidgets;
}

export const createReportStructureForExport = (nodes: Node[]): ExportReportStructure[] => (
    nodes.filter((node) => node.selected)
        .map((node) => ({
            id: node.key,
            ...(node.nodes && { levels: createReportStructureForExport(node.nodes) }),
        }))
);

export const createReportLevels = (nodes: Node[]): Level[] => (
    nodes
        .filter((node) => node.selected)
        .map((node) => ({
            id: node.key,
            title: node.title,
            ...(node.nodes && { sublevels: createReportLevels(node.nodes) }),
        }))
);

export const createWidgetIds = (widgets: TreeSelectableWidget[]) => (
    // FIXME: we should not cast this value, fix this server
    widgets
        .filter((widget) => widget.selected)
        .map((widget) => (widget.id))
);

export const getReportStructureVariant = (
    widgets: Widget[] | undefined,
    reportStructure: ExportItem['extraOptions']['reportStructure'],
) => {
    const isDimensionFirst = widgets?.filter((widget) => widget.widgetId === 'MATRIX2D')
        .some((widget) => {
            const rowKeys = (
                widget.properties as Matrix2dProperties
            )?.rows.map((v) => v.key);
            return reportStructure?.some((rootLevel) => (
                rootLevel?.levels?.some((level) => rowKeys?.includes(level.id))
            ));
        });
    return isDimensionFirst ? DIMENSION_FIRST : SECTOR_FIRST;
};

export const isSubSectorIncluded = (
    reportStructure: ExportItem['extraOptions']['reportStructure'],
) => (
    reportStructure?.some((rootLevel) => (
        rootLevel?.levels?.some((l) => (
            l?.levels?.some((m) => (
                m?.levels?.some((n) => (
                    n?.levels?.some((o) => (
                        isDefined(o?.id)
                    ))
                ))
            ))
        ))
    )) ?? false
);

export function sortReportStructure(
    data: Node[] | undefined,
    sortedData: ExportItem['extraOptions']['reportStructure'],
): Node[] {
    const newData = sortedData?.map((sd) => {
        const out = data?.find((d) => d.key === sd.id);
        if (out) {
            return { ...out, nodes: sortReportStructure(out.nodes, sd.levels) };
        }
        return data ?? [];
    });

    return newData as Node[];
}

export function selectAndSortWidgets(
    data: Widget[] | undefined,
    sortedDataKeys: string[] | null | undefined,
) {
    const selectedWidgets = sortedDataKeys
        ?.reduce((acc, v) => {
            const textWidget = data?.find((tw) => tw.id === v);
            if (textWidget) {
                return [...acc, { ...textWidget, selected: true }];
            }
            return acc;
        }, [] as TreeSelectableWidget[]);
    const remainingWidgets = data
        ?.filter((v) => !sortedDataKeys?.includes(v.id))
        .map((v) => ({
            ...v,
            selected: false,
        }));
    const widgetList = [
        ...(selectedWidgets ?? []),
        ...(remainingWidgets ?? []),
    ];

    return widgetList;
}
