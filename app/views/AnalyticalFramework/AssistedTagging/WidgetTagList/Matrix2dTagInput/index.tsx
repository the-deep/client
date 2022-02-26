import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    Matrix2dWidget,
    CategoricalMappingsItem,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';

import CheckButton from '../../CheckButton';
import CellGroup from '../../CellGroup';

import styles from './styles.css';

interface ColItem {
    columnKey: string;
    label: string;
}

const colKeySelector = (c: ColItem) => c.columnKey;

interface SubRowItem {
    subRowKey: string;
    subRowLabel: string;
    rowOrder: number;
    subRowOrder: number;
    rowKey: string;
    rowLabel: string;
}

interface SubColumnItem {
    columnKey: string;
    columnLabel: string;
    columnOrder: number;
    subColumnKey: string;
    subColumnLabel: string;
    subColumnOrder: number;
}

const subRowKeySelector = (subRow: SubRowItem) => subRow.subRowKey;
const subRowGroupKeySelector = (item: SubRowItem) => item.rowKey;

const subColumnKeySelector = (subRow: SubColumnItem) => subRow.subColumnKey;
const subColumnGroupKeySelector = (item: SubColumnItem) => item.columnKey;

interface Props {
    className?: string;
    widget: Matrix2dWidget;
    mappings: CategoricalMappingsItem[] | undefined;
    onMappingsChange: (newMappings: CategoricalMappingsItem[], widgetPk: string) => void;
    selectedTag: string | undefined;
}

function Matrix2dTagInput(props: Props) {
    const {
        className,
        widget,
        mappings,
        onMappingsChange,
        selectedTag,
    } = props;

    const sortedColumns = useMemo(() => (
        sortByOrder(widget?.properties?.columns)?.map((column) => ({
            columnKey: column.key,
            label: column.label,
        }))
    ), [widget?.properties?.columns]);

    const sortedSubRows = useMemo(() => (
        sortByOrder(widget?.properties?.rows)?.map((row) => {
            const subRows = row.subRows.map((cell) => ({
                rowKey: row.key,
                rowOrder: row.order,
                rowLabel: row.label,
                subRowKey: cell.key,
                subRowOrder: cell.order,
                subRowLabel: cell.label,
            }));
            return subRows;
        }).flat()
    ), [widget?.properties?.rows]);

    const sortedSubColumns = useMemo(() => (
        sortByOrder(widget?.properties?.columns)?.map((column) => {
            const subColumns = column.subColumns.map((cell) => ({
                columnKey: column.key,
                columnOrder: column.order,
                columnLabel: column.label,
                subColumnKey: cell.key,
                subColumnOrder: cell.order,
                subColumnLabel: cell.label,
            }));
            return subColumns;
        }).flat()
    ), [widget?.properties?.columns]);

    const handleColumnClick = useCallback((columnKey: string) => {
        if (!selectedTag) {
            return;
        }
        const selectedMappingsIndex = mappings?.findIndex((mapping) => {
            if (
                selectedTag === mapping.tagId
                && mapping.widgetType === 'MATRIX2D'
                && mapping.association.type === 'COLUMN'
            ) {
                return mapping.association.columnKey === columnKey;
            }
            return false;
        });

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            const newMappings = [...(mappings ?? [])];
            newMappings.splice(selectedMappingsIndex, 1);

            onMappingsChange(newMappings, widget.id);
        } else {
            onMappingsChange([
                ...(mappings ?? []),
                {
                    tagId: selectedTag,
                    widgetPk: widget.id,
                    widgetType: widget.widgetId,
                    association: {
                        type: 'COLUMN',
                        columnKey,
                    },
                },
            ], widget.id);
        }
    }, [
        onMappingsChange,
        widget,
        mappings,
        selectedTag,
    ]);

    const colRendererParams = useCallback((_: string, column: ColItem) => ({
        children: column.label,
        name: column.columnKey,
        value: mappings?.some((mapping) => {
            if (
                selectedTag === mapping.tagId
                && mapping.widgetType === 'MATRIX2D'
                && mapping.association.type === 'COLUMN'
            ) {
                return mapping.association.columnKey === column.columnKey;
            }
            return false;
        }) ?? false,
        mappedCount: mappings?.filter((mapping) => {
            if (
                mapping.widgetType === 'MATRIX2D'
                && mapping.association.type === 'COLUMN'
            ) {
                return mapping.association.columnKey === column.columnKey;
            }
            return false;
        }).length ?? 0,
        onClick: handleColumnClick,
        disabled: !selectedTag,
    }), [
        handleColumnClick,
        selectedTag,
        mappings,
    ]);

    const handleSubRowClick = useCallback((subRowKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingsIndex = mappings?.findIndex((mapping) => {
            if (
                selectedTag === mapping.tagId
                && mapping.widgetType === 'MATRIX2D'
                && mapping.association.type === 'SUB_ROW'
            ) {
                return mapping.association.subRowKey === subRowKey;
            }
            return false;
        });

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            const newMappings = [...(mappings ?? [])];
            newMappings.splice(selectedMappingsIndex, 1);

            onMappingsChange(newMappings, widget.id);
        } else {
            const rowKey = sortedSubRows
                ?.find((subRow) => subRow.subRowKey === subRowKey)?.rowKey;

            if (!rowKey) {
                console.error('Sub-row without row is found');
                return;
            }

            onMappingsChange([
                ...(mappings ?? []),
                {
                    tagId: selectedTag,
                    widgetPk: widget.id,
                    widgetType: 'MATRIX2D',
                    association: {
                        type: 'SUB_ROW',
                        subRowKey,
                        rowKey,
                    },
                },
            ], widget.id);
        }
    }, [
        sortedSubRows,
        onMappingsChange,
        mappings,
        selectedTag,
        widget,
    ]);

    const subRowRendererParams = useCallback((_: string, subRow: SubRowItem) => ({
        children: subRow.subRowLabel,
        name: subRow.subRowKey,
        value: mappings?.some((mapping) => {
            if (
                selectedTag === mapping.tagId
                && mapping.widgetType === 'MATRIX2D'
                && mapping.association.type === 'SUB_ROW'
            ) {
                return mapping.association.subRowKey === subRow.subRowKey;
            }
            return false;
        }) ?? false,
        mappedCount: mappings?.filter((mapping) => {
            if (
                mapping.widgetType === 'MATRIX2D'
                && mapping.association.type === 'SUB_ROW'
            ) {
                return mapping.association.subRowKey === subRow.subRowKey;
            }
            return false;
        }).length ?? 0,
        onClick: handleSubRowClick,
        disabled: !selectedTag,
    }), [
        handleSubRowClick,
        selectedTag,
        mappings,
    ]);

    const handleSubColumnClick = useCallback((subColumnKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingsIndex = mappings?.findIndex((mapping) => {
            if (
                selectedTag === mapping.tagId
                && mapping.widgetType === 'MATRIX2D'
                && mapping.association.type === 'SUB_COLUMN'
            ) {
                return mapping.association.subColumnKey === subColumnKey;
            }
            return false;
        });

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            const newMappings = [...(mappings ?? [])];
            newMappings.splice(selectedMappingsIndex, 1);

            onMappingsChange(newMappings, widget.id);
        } else {
            const columnKey = sortedSubColumns?.find(
                (subColumn) => subColumn.subColumnKey === subColumnKey,
            )?.columnKey;

            if (!columnKey) {
                console.error('Sub-column without column is found');
                return;
            }

            onMappingsChange([
                ...(mappings ?? []),
                {
                    tagId: selectedTag,
                    widgetPk: widget.id,
                    widgetType: 'MATRIX2D',
                    association: {
                        type: 'SUB_COLUMN',
                        subColumnKey,
                        columnKey,
                    },
                },
            ], widget.widgetId);
        }
    }, [
        sortedSubColumns,
        onMappingsChange,
        mappings,
        selectedTag,
        widget,
    ]);

    const subColumnRendererParams = useCallback((_: string, subColumn: SubColumnItem) => ({
        children: subColumn.subColumnLabel,
        name: subColumn.subColumnKey,
        value: mappings?.some((mapping) => {
            if (
                selectedTag === mapping.tagId
                && mapping.widgetType === 'MATRIX2D'
                && mapping.association.type === 'SUB_COLUMN'
            ) {
                return mapping.association.subColumnKey === subColumn.subColumnKey;
            }
            return false;
        }) ?? false,
        mappedCount: mappings?.filter((mapping) => {
            if (
                mapping.widgetType === 'MATRIX2D'
                && mapping.association.type === 'SUB_COLUMN'
            ) {
                return mapping.association.subColumnKey === subColumn.subColumnKey;
            }
            return false;
        }).length ?? 0,
        onClick: handleSubColumnClick,
        disabled: !selectedTag,
    }), [
        handleSubColumnClick,
        selectedTag,
        mappings,
    ]);

    const subColumnGroupRendererParams = useCallback((groupKey: string) => {
        const groupLabel = sortedSubColumns
            ?.find((subColumn) => groupKey === subColumn.columnKey)
            ?.columnLabel;

        return ({
            title: groupLabel ?? groupKey,
        });
    }, [sortedSubColumns]);

    const subRowGroupRendererParams = useCallback((groupKey: string) => {
        const groupLabel = sortedSubRows
            ?.find((item) => groupKey === item.rowKey)
            ?.rowLabel;

        return ({
            title: groupLabel ?? groupKey,
        });
    }, [sortedSubRows]);

    return (
        <div className={styles.matrixTagInput}>
            <CellGroup title="Columns">
                <ListView
                    className={_cs(className, styles.cols)}
                    data={sortedColumns}
                    keySelector={colKeySelector}
                    renderer={CheckButton}
                    rendererParams={colRendererParams}
                    filtered={false}
                    pending={false}
                    errored={false}
                />
            </CellGroup>
            <ListView
                className={_cs(className, styles.subRows)}
                data={sortedSubRows}
                keySelector={subRowKeySelector}
                renderer={CheckButton}
                rendererParams={subRowRendererParams}
                filtered={false}
                pending={false}
                errored={false}
                groupRendererParams={subRowGroupRendererParams}
                groupKeySelector={subRowGroupKeySelector}
                groupRenderer={CellGroup}
                grouped
            />
            <ListView
                className={_cs(className, styles.subColumns)}
                data={sortedSubColumns}
                keySelector={subColumnKeySelector}
                renderer={CheckButton}
                rendererParams={subColumnRendererParams}
                filtered={false}
                pending={false}
                errored={false}
                groupRendererParams={subColumnGroupRendererParams}
                groupKeySelector={subColumnGroupKeySelector}
                groupRenderer={CellGroup}
                grouped
            />
        </div>
    );
}

export default Matrix2dTagInput;
