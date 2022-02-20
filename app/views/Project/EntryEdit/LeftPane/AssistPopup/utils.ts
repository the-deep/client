import {
    listToGroupList,
    listToMap,
    isDefined,
    mapToMap,
} from '@togglecorp/fujs';
import {
    Matrix1dMappingItem,
    Matrix1dWidget,
    Matrix2dMappingItem,
    Matrix2dWidget,
    MappingItem,
} from '#types/newAnalyticalFramework';
import {
    Matrix1dWidgetAttribute,
    Matrix2dWidgetAttribute,
} from '#types/newEntry';
import { DeepReplace } from '#utils/types';

// TODO: Also return default value in case of no matches
export function filterMatrix1dMappings(
    mappingItem: MappingItem,
): mappingItem is Matrix1dMappingItem {
    return mappingItem.widgetType === 'MATRIX1D';
}

export function createMatrix1dAttr(
    mapping: Matrix1dMappingItem[] | undefined,
    widget: Matrix1dWidget,
): Matrix1dWidgetAttribute | undefined {
    if (!mapping || mapping.length < 1) {
        return undefined;
    }
    const mappingGroupedByRows = listToGroupList(
        mapping,
        (m) => m.mapping.rowKey,
        (m) => m.mapping.subRowKey,
    );

    const value = mapToMap(
        mappingGroupedByRows,
        (m) => m,
        (d) => listToMap(d, (k) => k, () => true),
    );

    return {
        id: widget.id,
        clientId: widget.clientId,
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'MATRIX1D',
        data: { value },
    };
}

interface SubRowMap {
    type: 'SUB_ROW';
    rowKey: string;
    subRowKey: string;
}

type ColumnMap = {
    type: 'COLUMN';
    columnKey: string;
} | {
    type: 'SUB_COLUMN';
    columnKey: string;
    subColumnKey: string;
};

export function filterColumn(
    mappingItem: Matrix2dMappingItem,
): mappingItem is DeepReplace<Matrix2dMappingItem, SubRowMap, never> {
    return mappingItem.mapping.type === 'COLUMN' || mappingItem.mapping.type === 'SUB_COLUMN';
}

export function filterSubRows(
    mappingItem: Matrix2dMappingItem,
): mappingItem is DeepReplace<Matrix2dMappingItem, ColumnMap, never> {
    return mappingItem.mapping.type === 'SUB_ROW';
}

export function filterMatrix2dMappings(
    mappingItem: MappingItem,
): mappingItem is Matrix2dMappingItem {
    return mappingItem.widgetType === 'MATRIX2D';
}

export function createMatrix2dAttr(
    mapping: Matrix2dMappingItem[] | undefined,
    widget: Matrix2dWidget,
): Matrix2dWidgetAttribute | undefined {
    if (!mapping || mapping.length < 1) {
        return undefined;
    }
    const columns = mapping.filter(filterColumn);
    const rows = mapping.filter(filterSubRows);

    if (columns.length === 0 && rows.length === 0) {
        return undefined;
    }

    const groupedCols = listToGroupList(
        columns,
        (col) => col.mapping.columnKey,
        (col) => col.mapping.subColumnKey,
    );

    const transformedCols = mapToMap(
        groupedCols,
        (colKey) => colKey,
        (subColumns) => subColumns.filter(isDefined),
    );

    const groupedSubRows = listToGroupList(
        rows,
        (col) => col.mapping.rowKey,
        (col) => col.mapping.subRowKey,
    );

    const value = mapToMap(
        groupedSubRows,
        (rowKey) => rowKey,
        (subRows) => listToMap(
            subRows,
            (k) => k,
            () => transformedCols,
        ),
    );

    return {
        id: widget.id,
        clientId: widget.clientId,
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'MATRIX2D',
        data: { value },
    };
}
