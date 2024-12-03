import {
    listToMap,
    randomString,
} from '@togglecorp/fujs';

import {
    Matrix1dWidget,
    Matrix1dValue,
    Matrix2dValue,
    Matrix2dWidget,
} from '#types/newAnalyticalFramework';

import {
    getType,
} from '#utils/types';

import {
    PartialAttributeType,
} from '#components/entry/schema';

type Matrix1dWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MATRIX1D' }>;
type Matrix2dWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MATRIX2D' }>;
/*
type ScaleWidgetAttribute = getType<PartialAttributeType, { widgetType: 'SCALE' }>;
type SingleSelectWidgetAttribute = getType<PartialAttributeType, { widgetType: 'SELECT' }>;
type MultiSelectWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MULTISELECT' }>;
type OrganigramWidgetAttribute = getType<PartialAttributeType, { widgetType: 'ORGANIGRAM' }>;
type GeoLocationWidgetAttribute = getType<PartialAttributeType, { widgetType: 'GEO' }>;
*/

export function isValidObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && !Array.isArray(value) && value !== null && value !== undefined;
}

export function isValidStringArray(value: unknown): value is string[] {
    const isArray = typeof value === 'object' && Array.isArray(value) && value !== null && value !== undefined;
    if (!isArray) {
        return false;
    }
    return value.every((item) => typeof item === 'string');
}

// TODO: Write tests
export function createMatrix1dAttrFromTags(
    unsafeMappings: Matrix1dValue | undefined,
    widget: Matrix1dWidget,
): Matrix1dWidgetAttribute | undefined {
    // NOTE: We are supposed to get Matrix1dValue, but adding one more validation layer
    const mappings = unsafeMappings as unknown;
    if (!mappings || !isValidObject(mappings)) {
        return undefined;
    }

    const cellKeysByRowKey = listToMap(
        widget.properties?.rows,
        (row) => row.key,
        (row) => row.cells.map((cell) => cell.key),
    );

    const rowKeys = widget.properties?.rows?.map((item) => item.key);

    const validRowKeys = Object.keys(mappings).filter((item) => rowKeys?.includes(item));

    const value: Matrix1dValue = listToMap(
        validRowKeys,
        (validRowKey) => validRowKey,
        (validRowKey) => {
            const rowDetails = mappings[validRowKey];
            if (!isValidObject(rowDetails)) {
                return undefined;
            }
            const cellKeys = Object.keys(rowDetails);
            const validCellKeys = cellKeys.filter((item) => (
                cellKeysByRowKey?.[validRowKey].includes(item)
            ));

            return listToMap(validCellKeys, (cellKey) => cellKey, () => true);
        },
    );

    return {
        clientId: randomString(),
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'MATRIX1D',
        data: { value },
    };
}

// TODO: Write tests
export function createMatrix2dAttrFromTags(
    unsafeMappings: Matrix2dValue | undefined,
    widget: Matrix2dWidget,
): Matrix2dWidgetAttribute | undefined {
    // NOTE: We are supposed to get Matrix1dValue, but adding one more validation layer
    const mappings = unsafeMappings as unknown;
    if (!mappings || !isValidObject(mappings)) {
        return undefined;
    }

    const subRowKeysByRowKey = listToMap(
        widget.properties?.rows,
        (row) => row.key,
        (row) => row.subRows.map((subRow) => subRow.key),
    );

    const subColumnKeysByColumnKey = listToMap(
        widget.properties?.columns,
        (row) => row.key,
        (row) => row.subColumns.map((subColumn) => subColumn.key),
    );

    const rowKeys = widget.properties?.rows?.map((item) => item.key);
    const columnKeys = widget.properties?.columns?.map((item) => item.key);

    const validRowKeys = Object.keys(mappings).filter((item) => rowKeys?.includes(item));

    const value: Matrix2dValue = listToMap(
        validRowKeys,
        (validRowKey) => validRowKey,
        (validRowKey) => {
            const rowDetails = mappings[validRowKey];
            if (!isValidObject(rowDetails)) {
                return undefined;
            }
            const subRowKeys = Object.keys(rowDetails);
            const validsubRowKeys = subRowKeys.filter((item) => (
                subRowKeysByRowKey?.[validRowKey].includes(item)
            ));

            return listToMap(
                validsubRowKeys,
                (subRowKey) => subRowKey,
                (subRowKey) => {
                    const subRowData = rowDetails[subRowKey];
                    if (!isValidObject(subRowData)) {
                        return undefined;
                    }
                    const unSafeColumnKeys = Object.keys(subRowData);
                    const validColumnKeys = unSafeColumnKeys.filter(
                        (item) => columnKeys?.includes(item),
                    );

                    return listToMap(
                        validColumnKeys,
                        (columnKey) => columnKey,
                        (columnKey) => {
                            const columnData = subRowData[columnKey];
                            if (!isValidStringArray(columnData)) {
                                return undefined;
                            }
                            return columnData.filter(
                                (item) => subColumnKeysByColumnKey?.[columnKey].includes(item),
                            );
                        },
                    );
                },
            );
        },
    );

    return {
        clientId: randomString(),
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'MATRIX2D',
        data: { value },
    };
}
