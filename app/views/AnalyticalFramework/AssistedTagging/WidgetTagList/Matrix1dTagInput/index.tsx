import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    unique,
    listToMap,
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    Matrix1dWidget,
    Matrix1dMappingsItem,
    PredictionTag,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';

import CellGroup from '../../CellGroup';
import FrameworkTagRow from '../../FrameworkTagRow';

import styles from './styles.css';

const matrix1dAssociationKeySelector = (
    mapping: Matrix1dMappingsItem,
) => mapping.association.subRowKey;

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
    disabled?: boolean;
    predictionTags: PredictionTag[] | undefined;
}

function Matrix1dTagInput(props: Props) {
    const {
        className,
        widget,
        mappings,
        onMappingsChange,
        disabled,
        predictionTags,
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
    ), [widget.properties?.rows]);

    const groupLabelMap = useMemo(() => (
        listToMap(
            unique(sortedCells ?? [], (cell) => cell.rowKey),
            (cell) => cell.rowKey,
            (cell) => cell.rowLabel,
        )
    ), [sortedCells]);

    const handleCellRemove = useCallback((cellKey: string, tagKey: string) => {
        if (!mappings) {
            return;
        }
        const selectedMappingsIndex = mappings.findIndex((mapping) => (
            tagKey === mapping.tag && mapping.association.subRowKey === cellKey
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

    const handleCellAdd = useCallback((cellKey: string, tagKey: string) => {
        const selectedMappingsIndex = mappings?.findIndex((mapping) => (
            tagKey === mapping.tag && mapping.association.subRowKey === cellKey
        ));

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            return;
        }

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
                tag: tagKey,
                widget: widget.id,
                widgetType: 'MATRIX1D',
                association: {
                    subRowKey: cellKey,
                    rowKey,
                },
                clientId: randomString(),
            // FIXME: need to cast here because we cannot set id
            // and a proper fix would require more time
            } as Matrix1dMappingsItem,
        ], widget.id);
    }, [
        sortedCells,
        onMappingsChange,
        mappings,
        widget,
    ]);

    const tagRowRendererParams = useCallback((_: string, cell: CellItem) => ({
        title: cell.subRowLabel,
        itemKey: cell.subRowKey,
        onMappingRemoveClick: handleCellRemove,
        onMappingAddClick: handleCellAdd,
        associationKeySelector: matrix1dAssociationKeySelector,
        mappings,
        predictionTags,
        disabled,
    }), [
        disabled,
        handleCellRemove,
        handleCellAdd,
        mappings,
        predictionTags,
    ]);

    const subRowGroupRendererParams = useCallback((groupKey: string) => ({
        title: groupLabelMap[groupKey] ?? groupKey,
        direction: 'vertical' as const,
    }), [groupLabelMap]);

    return (
        <ListView
            className={_cs(className, styles.matrixTagInput)}
            data={sortedCells}
            keySelector={cellKeySelector}
            renderer={FrameworkTagRow}
            rendererParams={tagRowRendererParams}
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
