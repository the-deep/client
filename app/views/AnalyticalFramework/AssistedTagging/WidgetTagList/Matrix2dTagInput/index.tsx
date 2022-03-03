import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToGroupList,
    listToMap,
    unique,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    Matrix2dWidget,
    Matrix2dMappingsItem,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';
import { getType } from '#utils/types';

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
    mappings: Matrix2dMappingsItem[] | undefined;
    onMappingsChange: (newMappings: Matrix2dMappingsItem[], widgetPk: string) => void;
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
        sortByOrder(widget?.properties?.rows)
            ?.map((row) => (
                row.subRows.map((cell) => ({
                    rowKey: row.key,
                    rowOrder: row.order,
                    rowLabel: row.label,
                    subRowKey: cell.key,
                    subRowOrder: cell.order,
                    subRowLabel: cell.label,
                }))
            ))
            .flat()
    ), [widget?.properties?.rows]);

    const sortedSubColumns = useMemo(() => (
        sortByOrder(widget?.properties?.columns)
            ?.map((column) => (
                column.subColumns.map((cell) => ({
                    columnKey: column.key,
                    columnOrder: column.order,
                    columnLabel: column.label,
                    subColumnKey: cell.key,
                    subColumnOrder: cell.order,
                    subColumnLabel: cell.label,
                }))
            ))
            .flat()
    ), [widget?.properties?.columns]);

    const handleColumnClick = useCallback((columnKey: string) => {
        if (!selectedTag) {
            return;
        }
        const selectedMappingsIndex = mappings?.findIndex((mapping) => {
            if (
                selectedTag === mapping.tagId
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

    type ColMappingItem = Omit<Matrix2dMappingsItem, 'association'> & {
        association: getType<Matrix2dMappingsItem['association'], { type: 'COLUMN' }>;
    };

    const columnKeysInMappings = useMemo(() => {
        const list = mappings?.filter((mappingItem): mappingItem is ColMappingItem => (
            mappingItem.tagId === selectedTag
            && mappingItem.association.type === 'COLUMN'
        ));
        return listToMap(
            list,
            (mappingItem) => mappingItem.association.columnKey,
            () => true,
        );
    }, [
        mappings,
        selectedTag,
    ]);

    const mappingsGroupedByColumn = useMemo(() => {
        const list = mappings?.filter((mappingItem): mappingItem is ColMappingItem => (
            mappingItem.association.type === 'COLUMN'
        ));
        return listToGroupList(
            list,
            (mappingItem) => mappingItem.association.columnKey,
        );
    }, [mappings]);

    const colRendererParams = useCallback((_: string, column: ColItem) => ({
        children: column.label,
        name: column.columnKey,
        value: !!columnKeysInMappings?.[column.columnKey],
        badgeCount: mappingsGroupedByColumn?.[column.columnKey]?.length ?? 0,
        onClick: handleColumnClick,
        disabled: !selectedTag,
    }), [
        handleColumnClick,
        selectedTag,
        columnKeysInMappings,
        mappingsGroupedByColumn,
    ]);

    const handleSubRowClick = useCallback((subRowKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingsIndex = mappings?.findIndex((mapping) => {
            if (
                selectedTag === mapping.tagId
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

    type SubRowMappingItem = Omit<Matrix2dMappingsItem, 'association'> & {
        association: getType<Matrix2dMappingsItem['association'], { type: 'SUB_ROW' }>;
    };

    const subRowKeysInMappings = useMemo(() => {
        const list = mappings?.filter((mappingItem): mappingItem is SubRowMappingItem => (
            mappingItem.tagId === selectedTag
            && mappingItem.association.type === 'SUB_ROW'
        ));
        return listToMap(
            list,
            (mappingItem) => mappingItem.association.subRowKey,
            () => true,
        );
    }, [
        mappings,
        selectedTag,
    ]);

    const mappingsGroupedBySubRow = useMemo(() => {
        const list = mappings?.filter((mappingItem): mappingItem is SubRowMappingItem => (
            mappingItem.association.type === 'SUB_ROW'
        ));
        return listToGroupList(
            list,
            (mappingItem) => mappingItem.association.subRowKey,
        );
    }, [mappings]);

    const subRowRendererParams = useCallback((_: string, subRow: SubRowItem) => ({
        children: subRow.subRowLabel,
        name: subRow.subRowKey,
        onClick: handleSubRowClick,
        value: !!subRowKeysInMappings?.[subRow.subRowKey],
        badgeCount: mappingsGroupedBySubRow?.[subRow.subRowKey]?.length ?? 0,
        disabled: !selectedTag,
    }), [
        handleSubRowClick,
        selectedTag,
        subRowKeysInMappings,
        mappingsGroupedBySubRow,
    ]);

    const handleSubColumnClick = useCallback((subColumnKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingsIndex = mappings?.findIndex((mapping) => {
            if (
                selectedTag === mapping.tagId
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

    type SubColumnMappingItem = Omit<Matrix2dMappingsItem, 'association'> & {
        association: getType<Matrix2dMappingsItem['association'], { type: 'SUB_COLUMN' }>;
    };

    const subColumnKeysInMappings = useMemo(() => {
        const list = mappings?.filter((mappingItem): mappingItem is SubColumnMappingItem => (
            mappingItem.tagId === selectedTag
            && mappingItem.association.type === 'SUB_COLUMN'
        ));
        return listToMap(
            list,
            (mappingItem) => mappingItem.association.subColumnKey,
            () => true,
        );
    }, [
        mappings,
        selectedTag,
    ]);

    const mappingsGroupedBySubColumn = useMemo(() => {
        const list = mappings?.filter((mappingItem): mappingItem is SubColumnMappingItem => (
            mappingItem.association.type === 'SUB_COLUMN'
        ));
        return listToGroupList(
            list,
            (mappingItem) => mappingItem.association.subColumnKey,
        );
    }, [mappings]);

    const subColumnRendererParams = useCallback((_: string, subColumn: SubColumnItem) => ({
        children: subColumn.subColumnLabel,
        name: subColumn.subColumnKey,
        value: !!subColumnKeysInMappings?.[subColumn.subColumnKey],
        badgeCount: mappingsGroupedBySubColumn?.[subColumn.subColumnKey]?.length ?? 0,
        onClick: handleSubColumnClick,
        disabled: !selectedTag,
    }), [
        handleSubColumnClick,
        selectedTag,
        subColumnKeysInMappings,
        mappingsGroupedBySubColumn,
    ]);

    const subColumnGroupLabelMap = useMemo(() => (
        listToMap(
            unique(sortedSubColumns ?? [], (cell) => cell.columnKey),
            (cell) => cell.columnKey,
            (cell) => cell.columnLabel,
        )
    ), [sortedSubColumns]);

    const subColumnGroupRendererParams = useCallback((groupKey: string) => ({
        title: subColumnGroupLabelMap[groupKey] ?? groupKey,
    }), [subColumnGroupLabelMap]);

    const subRowGroupLabelMap = useMemo(() => (
        listToMap(
            unique(sortedSubRows ?? [], (cell) => cell.rowKey),
            (cell) => cell.rowKey,
            (cell) => cell.rowLabel,
        )
    ), [sortedSubRows]);

    const subRowGroupRendererParams = useCallback((groupKey: string) => ({
        title: subRowGroupLabelMap[groupKey] ?? groupKey,
    }), [subRowGroupLabelMap]);

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
