import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    unique,
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    List,
    ListView,
} from '@the-deep/deep-ui';

import {
    Matrix2dWidget,
    Matrix2dMappingsItem,
    PredictionTag,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';
import { getType } from '#utils/types';

import FrameworkTagRow from '../../FrameworkTagRow';
import CellGroup from '../../CellGroup';

import styles from './styles.css';

type ColMappingItem = Omit<Matrix2dMappingsItem, 'association'> & {
    association: getType<Matrix2dMappingsItem['association'], { type: 'COLUMN' }>;
};

type SubRowMappingItem = Omit<Matrix2dMappingsItem, 'association'> & {
    association: getType<Matrix2dMappingsItem['association'], { type: 'SUB_ROW' }>;
};

type SubColumnMappingItem = Omit<Matrix2dMappingsItem, 'association'> & {
    association: getType<Matrix2dMappingsItem['association'], { type: 'SUB_COLUMN' }>;
};

const columnAssociationKeySelector = (item: ColMappingItem) => item.association.columnKey;
const subRowAssociationKeySelector = (item: SubRowMappingItem) => item.association.subRowKey;
const subColumnAssociationKeySelector = (
    item: SubColumnMappingItem,
) => item.association.subColumnKey;

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
    disabled?: boolean;
    predictionTags: PredictionTag[] | undefined;
}

function Matrix2dTagInput(props: Props) {
    const {
        className,
        widget,
        mappings,
        onMappingsChange,
        disabled,
        predictionTags,
    } = props;

    const sortedColumns = useMemo(() => (
        sortByOrder(widget?.properties?.columns)?.map((column) => ({
            columnKey: column.key,
            label: column.label,
        }))
    ), [widget.properties?.columns]);

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
    ), [widget.properties?.rows]);

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
    ), [widget.properties?.columns]);

    const subRowMappings = useMemo(() => (
        mappings?.filter((mappingItem): mappingItem is SubRowMappingItem => (
            mappingItem.association.type === 'SUB_ROW'
        ))
    ), [
        mappings,
    ]);

    const subColumnMappings = useMemo(() => (
        mappings?.filter((mappingItem): mappingItem is SubColumnMappingItem => (
            mappingItem.association.type === 'SUB_ROW'
        ))
    ), [
        mappings,
    ]);

    const columnMappings = useMemo(() => (
        mappings?.filter((mappingItem): mappingItem is ColMappingItem => (
            mappingItem.association.type === 'COLUMN'
        ))
    ), [
        mappings,
    ]);

    const subColumnGroupLabelMap = useMemo(() => (
        listToMap(
            unique(sortedSubColumns ?? [], (cell) => cell.columnKey),
            (cell) => cell.columnKey,
            (cell) => cell.columnLabel,
        )
    ), [sortedSubColumns]);

    const subRowGroupLabelMap = useMemo(() => (
        listToMap(
            unique(sortedSubRows ?? [], (cell) => cell.rowKey),
            (cell) => cell.rowKey,
            (cell) => cell.rowLabel,
        )
    ), [sortedSubRows]);

    const handleColumnRemove = useCallback((columnKey: string, tagKey: string) => {
        if (!mappings) {
            return;
        }
        const selectedMappingsIndex = mappings.findIndex((mapping) => (
            tagKey === mapping.tag
            && mapping.association.type === 'COLUMN'
            && mapping.association.columnKey === columnKey
        ));

        if (selectedMappingsIndex !== -1) {
            const newMappings = [...mappings];
            newMappings.splice(selectedMappingsIndex, 1);

            onMappingsChange(newMappings, widget.id);
        }
    }, [
        onMappingsChange,
        widget.id,
        mappings,
    ]);

    const handleColumnAdd = useCallback((columnKey: string, tagKey: string) => {
        const selectedMappingsIndex = mappings?.findIndex((mapping) => (
            tagKey === mapping.tag
            && mapping.association.type === 'COLUMN'
            && mapping.association.columnKey === columnKey
        ));

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            return;
        }
        onMappingsChange([
            ...(mappings ?? []),
            {
                tag: tagKey,
                widget: widget.id,
                widgetType: widget.widgetId,
                association: {
                    type: 'COLUMN',
                    columnKey,
                },
                clientId: randomString(),
            // FIXME: need to cast here because we cannot set id
            // and a proper fix would require more time
            } as Matrix2dMappingsItem,
        ], widget.id);
    }, [
        onMappingsChange,
        widget,
        mappings,
    ]);

    const handleSubRowRemove = useCallback((subRowKey: string, tagKey: string) => {
        if (!mappings) {
            return;
        }

        const selectedMappingsIndex = mappings.findIndex((mapping) => (
            tagKey === mapping.tag
            && mapping.association.type === 'SUB_ROW'
            && mapping.association.subRowKey === subRowKey
        ));

        if (selectedMappingsIndex !== -1) {
            const newMappings = [...mappings];
            newMappings.splice(selectedMappingsIndex, 1);

            onMappingsChange(newMappings, widget.id);
        }
    }, [
        onMappingsChange,
        widget.id,
        mappings,
    ]);

    const handleSubRowAdd = useCallback((subRowKey: string, tagKey: string) => {
        const selectedMappingsIndex = mappings?.findIndex((mapping) => (
            tagKey === mapping.tag
            && mapping.association.type === 'SUB_ROW'
            && mapping.association.subRowKey === subRowKey
        ));

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            return;
        }
        const rowKey = sortedSubRows
            ?.find((subRow) => subRow.subRowKey === subRowKey)?.rowKey;

        if (!rowKey) {
            // eslint-disable-next-line no-console
            console.error('Sub-row without row is found');
            return;
        }

        const newMappings = [
            ...(mappings ?? []),
            {
                tag: tagKey,
                widget: widget.id,
                widgetType: 'MATRIX2D',
                association: {
                    type: 'SUB_ROW',
                    subRowKey,
                    rowKey,
                },
                clientId: randomString(),
            // FIXME: need to cast here because we cannot set id
            // and a proper fix would require more time
            } as Matrix2dMappingsItem,
        ];
        onMappingsChange(newMappings, widget.id);
    }, [
        sortedSubRows,
        onMappingsChange,
        mappings,
        widget,
    ]);

    const handleSubColumnRemove = useCallback((subColumnKey: string, tagKey: string) => {
        if (!mappings) {
            return;
        }
        const selectedMappingsIndex = mappings.findIndex((mapping) => (
            tagKey === mapping.tag
            && mapping.association.type === 'SUB_COLUMN'
            && mapping.association.subColumnKey === subColumnKey
        ));

        if (selectedMappingsIndex !== -1) {
            const newMappings = [...mappings];
            newMappings.splice(selectedMappingsIndex, 1);

            onMappingsChange(newMappings, widget.id);
        }
    }, [
        onMappingsChange,
        widget.id,
        mappings,
    ]);

    const handleSubColumnAdd = useCallback((subColumnKey: string, tagKey: string) => {
        const selectedMappingsIndex = mappings?.findIndex((mapping) => (
            tagKey === mapping.tag
            && mapping.association.type === 'SUB_COLUMN'
            && mapping.association.subColumnKey === subColumnKey
        ));

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            return;
        }

        const columnKey = sortedSubColumns?.find(
            (subColumn) => subColumn.subColumnKey === subColumnKey,
        )?.columnKey;

        if (!columnKey) {
            // eslint-disable-next-line no-console
            console.error('Sub-column without column is found');
            return;
        }

        const newMappings = [
            ...(mappings ?? []),
            {
                tag: tagKey,
                widget: widget.id,
                widgetType: 'MATRIX2D',
                association: {
                    type: 'SUB_COLUMN',
                    subColumnKey,
                    columnKey,
                },
                clientId: randomString(),
            // FIXME: need to cast here because we cannot set id
            // and a proper fix would require more time
            } as Matrix2dMappingsItem,
        ];

        onMappingsChange(newMappings, widget.id);
    }, [
        sortedSubColumns,
        onMappingsChange,
        mappings,
        widget,
    ]);

    const colRendererParams = useCallback((_: string, column: ColItem) => ({
        title: column.label,
        itemKey: column.columnKey,
        onMappingRemoveClick: handleColumnRemove,
        onMappingAddClick: handleColumnAdd,
        mappings: columnMappings,
        associationKeySelector: columnAssociationKeySelector,
        predictionTags,
        disabled,
    }), [
        disabled,
        handleColumnAdd,
        handleColumnRemove,
        columnMappings,
        predictionTags,
    ]);

    const subRowRendererParams = useCallback((_: string, subRow: SubRowItem) => ({
        title: subRow.subRowLabel,
        itemKey: subRow.subRowKey,
        onMappingRemoveClick: handleSubRowRemove,
        onMappingAddClick: handleSubRowAdd,
        mappings: subRowMappings,
        associationKeySelector: subRowAssociationKeySelector,
        predictionTags,
        disabled,
    }), [
        disabled,
        handleSubRowRemove,
        handleSubRowAdd,
        subRowMappings,
        predictionTags,
    ]);

    const subColumnRendererParams = useCallback((_: string, subColumn: SubColumnItem) => ({
        title: subColumn.subColumnLabel,
        itemKey: subColumn.subColumnKey,
        onMappingRemoveClick: handleSubColumnRemove,
        onMappingAddClick: handleSubColumnAdd,
        mappings: subColumnMappings,
        associationKeySelector: subColumnAssociationKeySelector,
        predictionTags,
        disabled,
    }), [
        disabled,
        handleSubColumnRemove,
        handleSubColumnAdd,
        subColumnMappings,
        predictionTags,
    ]);

    const subColumnGroupRendererParams = useCallback((groupKey: string) => ({
        title: subColumnGroupLabelMap[groupKey] ?? groupKey,
        direction: 'vertical' as const,
    }), [subColumnGroupLabelMap]);

    const subRowGroupRendererParams = useCallback((groupKey: string) => ({
        title: subRowGroupLabelMap[groupKey] ?? groupKey,
        direction: 'vertical' as const,
    }), [subRowGroupLabelMap]);

    return (
        <div className={_cs(className, styles.matrixTagInput)}>
            <CellGroup
                title="Columns"
                direction="vertical"
            >
                <List
                    data={sortedColumns}
                    keySelector={colKeySelector}
                    renderer={FrameworkTagRow}
                    rendererParams={colRendererParams}
                />
            </CellGroup>
            <ListView
                className={styles.subRows}
                data={sortedSubRows}
                keySelector={subRowKeySelector}
                renderer={FrameworkTagRow}
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
                className={styles.subColumns}
                data={sortedSubColumns}
                keySelector={subColumnKeySelector}
                renderer={FrameworkTagRow}
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
