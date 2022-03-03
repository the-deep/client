import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    unique,
    listToGroupList,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    Matrix1dWidget,
    Matrix1dMappingsItem,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';

import CheckButton from '../../CheckButton';
import CellGroup from '../../CellGroup';

import styles from './styles.css';

interface CellItem {
    subRowKey: string;
    subRowLabel: string;
    rowOrder: number;
    subRowOrder: number;
    rowKey: string;
    rowLabel: string;
}

const cellKeySelector = (cell: CellItem) => cell.subRowKey;
const groupKeySelector = (n: CellItem) => n.rowKey;

interface Props {
    className?: string;
    widget: Matrix1dWidget;
    mappings: Matrix1dMappingsItem[] | undefined;
    onMappingsChange: (newMappings: Matrix1dMappingsItem[], widgetPk: string) => void;
    selectedTag: string | undefined;
}

function Matrix1dTagInput(props: Props) {
    const {
        className,
        widget,
        mappings,
        onMappingsChange,
        selectedTag,
    } = props;

    const sortedCells = useMemo(() => (
        sortByOrder(widget?.properties?.rows)
            ?.map((row) => (
                row.cells.map((cell) => ({
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

    const subRowKeysInMappings = useMemo(() => (
        listToMap(
            mappings?.filter((mappingItem) => mappingItem.tagId === selectedTag),
            (mappingItem) => mappingItem.association.subRowKey,
            () => true,
        )
    ), [
        mappings,
        selectedTag,
    ]);

    const mappingsGroupedByCell = useMemo(() => (
        listToGroupList(
            mappings,
            (mappingItem) => mappingItem.association.subRowKey,
        )
    ), [
        mappings,
    ]);

    const groupLabelMap = useMemo(() => (
        listToMap(
            unique(sortedCells ?? [], (cell) => cell.rowKey),
            (cell) => cell.rowKey,
            (cell) => cell.rowLabel,
        )
    ), [sortedCells]);

    const handleCellClick = useCallback((cellKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingsIndex = mappings?.findIndex((mapping) => (
            selectedTag === mapping.tagId && mapping.association.subRowKey === cellKey
        ));

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            const newMappings = [...(mappings ?? [])];
            newMappings.splice(selectedMappingsIndex, 1);

            onMappingsChange(newMappings, widget.clientId);
        } else {
            const rowKey = sortedCells
                ?.find((cell) => cell.subRowKey === cellKey)?.rowKey;

            if (!rowKey) {
                // eslint-disable-next-line no-console
                console.error('Sub-row without row is found');
                return;
            }

            onMappingsChange([
                ...(mappings ?? []),
                {
                    tagId: selectedTag,
                    widgetPk: widget.id,
                    widgetType: 'MATRIX1D',
                    association: {
                        subRowKey: cellKey,
                        rowKey,
                    },
                },
            ], widget.clientId);
        }
    }, [
        sortedCells,
        onMappingsChange,
        mappings,
        selectedTag,
        widget,
    ]);

    const cellRendererParams = useCallback((_: string, cell: CellItem) => ({
        children: cell.subRowLabel,
        name: cell.subRowKey,
        value: !!subRowKeysInMappings?.[cell.subRowKey],
        badgeCount: mappingsGroupedByCell?.[cell.subRowKey]?.length ?? 0,
        onClick: handleCellClick,
        disabled: !selectedTag,
    }), [
        mappingsGroupedByCell,
        subRowKeysInMappings,
        handleCellClick,
        selectedTag,
    ]);

    const subRowGroupRendererParams = useCallback((groupKey: string) => ({
        title: groupLabelMap[groupKey] ?? groupKey,
    }), [groupLabelMap]);

    return (
        <ListView
            className={_cs(className, styles.matrixTagInput)}
            data={sortedCells}
            keySelector={cellKeySelector}
            renderer={CheckButton}
            rendererParams={cellRendererParams}
            filtered={false}
            pending={false}
            errored={false}
            groupRendererParams={subRowGroupRendererParams}
            groupKeySelector={groupKeySelector}
            groupRenderer={CellGroup}
            grouped
        />
    );
}

export default Matrix1dTagInput;
