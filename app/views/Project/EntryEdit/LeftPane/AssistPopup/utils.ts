import {
    listToGroupList,
    listToMap,
    isDefined,
    mapToMap,
    randomString,
} from '@togglecorp/fujs';

import {
    Matrix1dMappingsItem,
    Matrix1dWidget,
    Matrix2dMappingsItem,
    Matrix2dWidget,
    ScaleMappingsItem,
    ScaleWidget,
    SelectMappingsItem,
    SingleSelectWidget,
    MultiSelectMappingsItem,
    MultiSelectWidget,
    MappingsItem,
} from '#types/newAnalyticalFramework';
import {
} from '#types/newEntry';

import { DeepReplace } from '#utils/types';

import {
    getType,
    PartialAttributeType,
} from '../../schema';

type Matrix1dWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MATRIX1D' }>;
type Matrix2dWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MATRIX2D' }>;
type ScaleWidgetAttribute = getType<PartialAttributeType, { widgetType: 'SCALE' }>;
type SingleSelectWidgetAttribute = getType<PartialAttributeType, { widgetType: 'SELECT' }>;
type MultiSelectWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MULTISELECT' }>;

// TODO: Also return default value in case of no matches
export function filterMatrix1dMappings(
    mappingsItem: MappingsItem,
): mappingsItem is Matrix1dMappingsItem {
    return mappingsItem.widgetType === 'MATRIX1D';
}

export function createMatrix1dAttr(
    mappings: Matrix1dMappingsItem[] | undefined,
    widget: Matrix1dWidget,
): Matrix1dWidgetAttribute | undefined {
    if (!mappings || mappings.length < 1) {
        return undefined;
    }
    const mappingsGroupedByRows = listToGroupList(
        mappings,
        (m) => m.association.rowKey,
        (m) => m.association.subRowKey,
    );

    const value = mapToMap(
        mappingsGroupedByRows,
        (m) => m,
        (d) => listToMap(d, (k) => k, () => true),
    );

    return {
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
    mappingsItem: Matrix2dMappingsItem,
): mappingsItem is DeepReplace<Matrix2dMappingsItem, SubRowMap, never> {
    return mappingsItem.association.type === 'COLUMN' || mappingsItem.association.type === 'SUB_COLUMN';
}

export function filterSubRows(
    mappingsItem: Matrix2dMappingsItem,
): mappingsItem is DeepReplace<Matrix2dMappingsItem, ColumnMap, never> {
    return mappingsItem.association.type === 'SUB_ROW';
}

export function filterMatrix2dMappings(
    mappingsItem: MappingsItem,
): mappingsItem is Matrix2dMappingsItem {
    return mappingsItem.widgetType === 'MATRIX2D';
}

export function createMatrix2dAttr(
    mappings: Matrix2dMappingsItem[] | undefined,
    widget: Matrix2dWidget,
): Matrix2dWidgetAttribute | undefined {
    if (!mappings || mappings.length < 1) {
        return undefined;
    }
    const columns = mappings.filter(filterColumn);
    const rows = mappings.filter(filterSubRows);

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
        clientId: randomString(),
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'MATRIX2D',
        data: { value },
    };
}

export function filterScaleMappings(
    mappingsItem: MappingsItem,
): mappingsItem is ScaleMappingsItem {
    return mappingsItem.widgetType === 'SCALE';
}

export function createScaleAttr(
    mappings: ScaleMappingsItem[] | undefined,
    widget: ScaleWidget,
): {
    attr: ScaleWidgetAttribute | undefined;
    hints: string[];
} {
    if (!mappings || mappings.length < 1) {
        return {
            attr: undefined,
            hints: [],
        };
    }

    if (mappings.length === 1) {
        return {
            attr: {
                clientId: randomString(),
                widget: widget.id,
                widgetVersion: widget.version,
                widgetType: 'SCALE' as const,
                data: {
                    value: mappings[0].association.optionKey,
                },
            },
            hints: [],
        };
    }

    return ({
        attr: undefined,
        hints: mappings.map((m) => m.association.optionKey),
    });
}

export function filterSelectMappings(
    mappingsItem: MappingsItem,
): mappingsItem is SelectMappingsItem {
    return mappingsItem.widgetType === 'SELECT';
}

export function createSelectAttr(
    mappings: SelectMappingsItem[] | undefined,
    widget: SingleSelectWidget,
): {
    attr: SingleSelectWidgetAttribute | undefined;
    hints: string[];
} {
    if (!mappings || mappings.length < 1) {
        return {
            attr: undefined,
            hints: [],
        };
    }

    if (mappings.length === 1) {
        return {
            attr: {
                clientId: randomString(),
                widget: widget.id,
                widgetVersion: widget.version,
                widgetType: 'SELECT' as const,
                data: {
                    value: mappings[0].association.optionKey,
                },
            },
            hints: [],
        };
    }

    return ({
        attr: undefined,
        hints: mappings.map((m) => m.association.optionKey),
    });
}

export function filterMultiSelectMappings(
    mappingsItem: MappingsItem,
): mappingsItem is MultiSelectMappingsItem {
    return mappingsItem.widgetType === 'MULTISELECT';
}

export function createMultiSelectAttr(
    mappings: MultiSelectMappingsItem[] | undefined,
    widget: MultiSelectWidget,
): MultiSelectWidgetAttribute | undefined {
    if (!mappings || mappings.length < 1) {
        return undefined;
    }

    return ({
        clientId: randomString(),
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'MULTISELECT' as const,
        data: {
            value: mappings.map((m) => m.association.optionKey),
        },
    });
}
