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

import { getOrganigramFlatOptions } from '#views/AnalyticalFramework/utils';

type Possible<T> = Omit<T, 'tag' | 'clientId'> & { label: string };

export type Matrix2dPossibleMapping = Possible<Matrix2dMappingsItem>;
export type Matrix1dPossibleMapping = Possible<Matrix1dMappingsItem>;
export type ScalePossibleMapping = Possible<ScaleMappingsItem>;
export type SelectPossibleMapping = Possible<SelectMappingsItem>;
export type MultiSelectPossibleMapping = Possible<MultiSelectMappingsItem>;
export type OrganigramPossibleMapping = Possible<OrganigramMappingsItem>;

export function getMatrix2dPossibleMappings(
    widget: Matrix2dWidget | undefined,
): Matrix2dPossibleMapping[] {
    const columns = widget?.properties?.columns?.map((column) => ({
        label: column.label,
        widget: widget.id,
        widgetType: 'MATRIX2D' as const,
        association: {
            type: 'COLUMN' as const,
            columnKey: column.key,
        },
    })) ?? [];

    const subRows = widget?.properties?.rows
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

    const subColumns = widget?.properties?.columns
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

    return [
        ...columns,
        ...subRows,
        ...subColumns,
    ] as Matrix2dPossibleMapping[];
}

export function getMatrix1dPossibleMappings(widget: Matrix1dWidget): Matrix1dPossibleMapping[] {
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

    return subRows as Matrix1dPossibleMapping[];
}

export function getOptionTypePossibleMappings(
    widget: ScaleWidget | MultiSelectWidget | SingleSelectWidget,
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

    return subRows as (ScalePossibleMapping | SelectPossibleMapping | MultiSelectPossibleMapping)[];
}

export function getOrganigramPossibleMappings(
    widget: OrganigramWidget,
): OrganigramPossibleMapping[] {
    const flatOptions = getOrganigramFlatOptions(widget?.properties?.options) ?? [];
    const options = flatOptions
        ?.map((option) => ({
            label: option.label,
            widget: widget.id,
            widgetType: 'ORGANIGRAM' as const,
            association: {
                optionKey: option.key,
            },
        })) ?? [];

    return options as OrganigramPossibleMapping[];
}
