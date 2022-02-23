import {
    listToGroupList,
    listToMap,
    isDefined,
    mapToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    Matrix1dMappingItem,
    Matrix1dWidget,
    Matrix2dMappingItem,
    Matrix2dWidget,
    ScaleMappingItem,
    ScaleWidget,
    SelectMappingItem,
    SingleSelectWidget,
    MultiSelectMappingItem,
    MultiSelectWidget,
    MappingItem,
} from '#types/newAnalyticalFramework';
import {
    Matrix1dWidgetAttribute,
    Matrix2dWidgetAttribute,
    ScaleWidgetAttribute,
    SingleSelectWidgetAttribute,
    MultiSelectWidgetAttribute,
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
        (m) => m.association.rowKey,
        (m) => m.association.subRowKey,
    );

    const value = mapToMap(
        mappingGroupedByRows,
        (m) => m,
        (d) => listToMap(d, (k) => k, () => true),
    );

    return {
        id: widget.id,
        clientId: randomString(),
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
    return mappingItem.association.type === 'COLUMN' || mappingItem.association.type === 'SUB_COLUMN';
}

export function filterSubRows(
    mappingItem: Matrix2dMappingItem,
): mappingItem is DeepReplace<Matrix2dMappingItem, ColumnMap, never> {
    return mappingItem.association.type === 'SUB_ROW';
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
        (col) => col.association.columnKey,
        (col) => col.association.subColumnKey,
    );

    const transformedCols = mapToMap(
        groupedCols,
        (colKey) => colKey,
        (subColumns) => subColumns.filter(isDefined),
    );

    const groupedSubRows = listToGroupList(
        rows,
        (col) => col.association.rowKey,
        (col) => col.association.subRowKey,
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
        clientId: randomString(),
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'MATRIX2D',
        data: { value },
    };
}

export function filterScaleMappings(
    mappingItem: MappingItem,
): mappingItem is ScaleMappingItem {
    return mappingItem.widgetType === 'SCALE';
}

export function createScaleAttr(
    mapping: ScaleMappingItem[] | undefined,
    widget: ScaleWidget,
): {
    attr: ScaleWidgetAttribute | undefined;
    hints: string[];
} {
    if (!mapping || mapping.length < 1) {
        return {
            attr: undefined,
            hints: [],
        };
    }

    if (mapping.length === 1) {
        return {
            attr: {
                id: widget.id,
                clientId: randomString(),
                widget: widget.id,
                widgetVersion: widget.version,
                widgetType: 'SCALE' as const,
                data: {
                    value: mapping[0].association.optionKey,
                },
            },
            hints: [],
        };
    }

    return ({
        attr: undefined,
        hints: mapping.map((m) => m.association.optionKey),
    });
}

export function filterSelectMappings(
    mappingItem: MappingItem,
): mappingItem is SelectMappingItem {
    return mappingItem.widgetType === 'SELECT';
}

export function createSelectAttr(
    mapping: SelectMappingItem[] | undefined,
    widget: SingleSelectWidget,
): {
    attr: SingleSelectWidgetAttribute | undefined;
    hints: string[];
} {
    const defaultAttr = {
        id: widget.id,
        clientId: randomString(),
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'SELECT' as const,
        data: widget.properties?.defaultValue ? {
            value: widget.properties?.defaultValue,
        } : undefined,
    };

    if (!mapping || mapping.length < 1) {
        return {
            attr: widget.properties?.defaultValue ? defaultAttr : undefined,
            hints: [],
        };
    }

    if (mapping.length === 1) {
        return {
            attr: {
                ...defaultAttr,
                data: {
                    value: mapping[0].association.optionKey,
                },
            },
            hints: [],
        };
    }

    return ({
        attr: defaultAttr,
        hints: mapping.map((m) => m.association.optionKey),
    });
}

export function filterMultiSelectMappings(
    mappingItem: MappingItem,
): mappingItem is MultiSelectMappingItem {
    return mappingItem.widgetType === 'MULTISELECT';
}

export function createMultiSelectAttr(
    mapping: MultiSelectMappingItem[] | undefined,
    widget: MultiSelectWidget,
): MultiSelectWidgetAttribute | undefined {
    const defaultAttr = {
        id: widget.id,
        clientId: randomString(),
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'MULTISELECT' as const,
        data: widget.properties?.defaultValue ? {
            value: widget.properties?.defaultValue,
        } : undefined,
    };

    if (!mapping || mapping.length < 1) {
        return widget.properties?.defaultValue ? defaultAttr : undefined;
    }

    return ({
        ...defaultAttr,
        data: {
            value: mapping.map((m) => m.association.optionKey),
        },
    });
}
