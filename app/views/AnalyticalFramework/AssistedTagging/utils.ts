import {
    Matrix2dWidget,
    Matrix2dMappingsItem,
    Matrix1dWidget,
    Matrix1dMappingsItem,
    ScaleWidget,
    SingleSelectWidget,
    MultiSelectWidget,
    ScaleMappingsItem,
    SelectMappingsItem,
    MultiSelectMappingsItem,
    OrganigramWidget,
    OrganigramMappingsItem,
} from '#types/newAnalyticalFramework';

import { getOrganigramFlatOptions } from './WidgetTagList/OrganigramTagInput/utils';

type ConvertToPossibleMapping<T> = Omit<T, 'tag' | 'clientId' | 'id'> & { label: string };

export type Matrix2dPossibleMapping = ConvertToPossibleMapping<Matrix2dMappingsItem>;
export type Matrix1dPossibleMapping = ConvertToPossibleMapping<Matrix1dMappingsItem>;
export type ScalePossibleMapping = ConvertToPossibleMapping<ScaleMappingsItem>;
export type SelectPossibleMapping = ConvertToPossibleMapping<SelectMappingsItem>;
export type MultiSelectPossibleMapping = ConvertToPossibleMapping<MultiSelectMappingsItem>;
export type OrganigramPossibleMapping = ConvertToPossibleMapping<OrganigramMappingsItem>;

export function getMatrix2dPossibleMappings(
    widget: Matrix2dWidget | undefined,
): Matrix2dPossibleMapping[] {
    const columns = widget?.properties?.columns?.map((column): Matrix2dPossibleMapping => ({
        label: column.label,
        widget: widget.id,
        widgetType: 'MATRIX2D' as const,
        association: {
            type: 'COLUMN' as const,
            columnKey: column.key,
        },
    })) ?? [];

    const subColumns: Matrix2dPossibleMapping[] = widget?.properties?.columns
        ?.map((column) => (
            column.subColumns.map((cell) => ({
                label: cell.label,
                widget: widget.id,
                widgetType: 'MATRIX2D' as const,
                association: {
                    type: 'SUB_COLUMN' as const,
                    subColumnKey: cell.key,
                    columnKey: column.key,
                },
            }))
        )).flat() ?? [];

    const subRows: Matrix2dPossibleMapping[] = widget?.properties?.rows
        ?.map((row) => (
            row.subRows.map((cell) => ({
                label: cell.label,
                widget: widget.id,
                widgetType: 'MATRIX2D' as const,
                association: {
                    type: 'SUB_ROW' as const,
                    subRowKey: cell.key,
                    rowKey: row.key,
                },
            }))
        )).flat() ?? [];

    return [
        ...columns,
        ...subColumns,
        ...subRows,
    ];
}

export function getMatrix1dPossibleMappings(
    widget: Matrix1dWidget | undefined,
): Matrix1dPossibleMapping[] {
    const subRows = widget?.properties?.rows
        ?.map((row) => (
            row.cells.map((cell) => ({
                label: cell.label,
                widget: widget.id,
                widgetType: 'MATRIX1D' as const,
                association: {
                    subRowKey: cell.key,
                    rowKey: row.key,
                },
            }))
        )).flat() ?? [];

    return subRows;
}

export function getOptionTypePossibleMappings(
    widget: ScaleWidget | MultiSelectWidget | SingleSelectWidget | undefined,
): (ScalePossibleMapping | SelectPossibleMapping | MultiSelectPossibleMapping)[] {
    const subRows = widget?.properties?.options
        ?.map((option) => ({
            label: option.label,
            widget: widget.id,
            widgetType: widget.widgetId,
            association: {
                optionKey: option.key,
            },
        })) ?? [];

    return subRows;
}

export function getOrganigramPossibleMappings(
    widget: OrganigramWidget | undefined,
): OrganigramPossibleMapping[] {
    if (!widget) {
        return [];
    }
    const flatOptions = getOrganigramFlatOptions(widget.properties?.options) ?? [];
    const options = flatOptions
        ?.map((option) => ({
            label: option.label,
            widget: widget.id,
            widgetType: 'ORGANIGRAM' as const,
            association: {
                optionKey: option.key,
            },
        })) ?? [];

    return options;
}
