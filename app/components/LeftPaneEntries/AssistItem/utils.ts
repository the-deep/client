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
    OrganigramMappingsItem,
    Matrix2dWidget,
    ScaleMappingsItem,
    ScaleWidget,
    SelectMappingsItem,
    SingleSelectWidget,
    MultiSelectMappingsItem,
    MultiSelectWidget,
    OrganigramWidget,
    GeoLocationWidget,
    getWidgetVersion,
} from '#types/newAnalyticalFramework';
import {
} from '#types/newEntry';

import {
    getType,
    DeepReplace,
} from '#utils/types';

import { GeoArea } from '#components/GeoMultiSelectInput';
import { Widget } from '#components/entry/types';
import {
    PartialAttributeType,
} from '#components/entry/schema';

type Matrix1dWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MATRIX1D' }>;
type Matrix2dWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MATRIX2D' }>;
type ScaleWidgetAttribute = getType<PartialAttributeType, { widgetType: 'SCALE' }>;
type SingleSelectWidgetAttribute = getType<PartialAttributeType, { widgetType: 'SELECT' }>;
type MultiSelectWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MULTISELECT' }>;
type OrganigramWidgetAttribute = getType<PartialAttributeType, { widgetType: 'ORGANIGRAM' }>;
type GeoLocationWidgetAttribute = getType<PartialAttributeType, { widgetType: 'GEO' }>;

export function createMatrix1dAttr(
    mappings: Matrix1dMappingsItem[] | undefined,
    widget: Matrix1dWidget,
): Matrix1dWidgetAttribute | undefined {
    if (!mappings || mappings.length <= 0) {
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

export function createMatrix2dAttr(
    mappings: Matrix2dMappingsItem[] | undefined,
    widget: Matrix2dWidget,
): Matrix2dWidgetAttribute | undefined {
    if (!mappings || mappings.length <= 0) {
        return undefined;
    }
    const columns = mappings.filter(filterColumn);
    const rows = mappings.filter(filterSubRows);

    if (columns.length === 0 || rows.length === 0) {
        return undefined;
    }

    const groupedCols = listToGroupList(
        columns,
        (col) => col.association.columnKey,
        // NOTE: We need empty array for Columns while we need non-empty array for sub columns
        (col) => (col.association.type === 'SUB_COLUMN' ? col.association.subColumnKey : undefined),
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

export function createScaleAttr(
    mappings: ScaleMappingsItem[] | undefined,
    widget: ScaleWidget,
): {
    attr: ScaleWidgetAttribute | undefined;
    hints: string[] | undefined;
} {
    if (!mappings || mappings.length <= 0) {
        return {
            attr: undefined,
            hints: undefined,
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
            hints: mappings.map((m) => m.association.optionKey),
        };
    }

    return ({
        attr: undefined,
        hints: mappings.map((m) => m.association.optionKey),
    });
}

export function createSelectAttr(
    mappings: SelectMappingsItem[] | undefined,
    widget: SingleSelectWidget,
): {
    attr: SingleSelectWidgetAttribute | undefined;
    hints: string[] | undefined;
} {
    if (!mappings || mappings.length <= 0) {
        return {
            attr: undefined,
            hints: undefined,
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
            hints: mappings.map((m) => m.association.optionKey),
        };
    }

    return ({
        attr: undefined,
        hints: mappings.map((m) => m.association.optionKey),
    });
}

export function createMultiSelectAttr(
    mappings: MultiSelectMappingsItem[] | undefined,
    widget: MultiSelectWidget,
): MultiSelectWidgetAttribute | undefined {
    if (!mappings || mappings.length <= 0) {
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

export function createOrganigramAttr(
    mappings: OrganigramMappingsItem[] | undefined,
    widget: OrganigramWidget,
): OrganigramWidgetAttribute | undefined {
    if (!mappings || mappings.length <= 0) {
        return undefined;
    }

    return ({
        clientId: randomString(),
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'ORGANIGRAM' as const,
        data: {
            value: mappings.map((m) => m.association.optionKey),
        },
    });
}

export function createGeoAttr(
    locations: GeoArea[] | undefined,
    widget: GeoLocationWidget,
): GeoLocationWidgetAttribute | undefined {
    if (!locations || locations.length <= 0) {
        return undefined;
    }

    return ({
        clientId: randomString(),
        widget: widget.id,
        widgetVersion: widget.version,
        widgetType: 'GEO' as const,
        data: {
            // NOTE: We are reducing the amount of suggestions from geo areas
            value: locations.map((location) => location.id).slice(0, 3),
        },
    });
}

export function createDefaultAttributes(
    allWidgets: Widget[],
) {
    const defaultAttributes = allWidgets.map((item) => {
        let attr: PartialAttributeType | undefined;
        const clientId = randomString();
        const widget = item.id;

        if (item.widgetId === 'TEXT' && item.properties?.defaultValue) {
            attr = {
                clientId,
                widget,
                widgetType: item.widgetId,
                widgetVersion: getWidgetVersion(item.widgetId),
                data: {
                    value: item.properties.defaultValue,
                },
            };
        } else if (item.widgetId === 'NUMBER' && item.properties?.defaultValue) {
            attr = {
                clientId,
                widget,
                widgetType: item.widgetId,
                widgetVersion: getWidgetVersion(item.widgetId),
                data: {
                    value: item.properties.defaultValue,
                },
            };
        } else if (item.widgetId === 'DATE' && item.properties?.defaultValue) {
            attr = {
                clientId,
                widget,
                widgetType: item.widgetId,
                widgetVersion: getWidgetVersion(item.widgetId),
                data: {
                    value: item.properties.defaultValue,
                },
            };
        } else if (item.widgetId === 'TIME' && item.properties?.defaultValue) {
            attr = {
                clientId,
                widget,
                widgetType: item.widgetId,
                widgetVersion: getWidgetVersion(item.widgetId),
                data: {
                    value: item.properties.defaultValue,
                },
            };
        } else if (item.widgetId === 'SCALE' && item.properties?.defaultValue) {
            attr = {
                clientId,
                widget,
                widgetType: item.widgetId,
                widgetVersion: getWidgetVersion(item.widgetId),
                data: {
                    value: item.properties.defaultValue,
                },
            };
        }
        return attr;
    }).filter(isDefined);

    return defaultAttributes;
}
