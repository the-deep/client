import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    Matrix1dWidget,
    CategoricalMappingsItem,
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
    mappings: CategoricalMappingsItem[] | undefined;
    onMappingsChange: (newMappings: CategoricalMappingsItem[], widgetPk: string) => void;
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
        sortByOrder(widget?.properties?.rows)?.map((row) => {
            const cells = row.cells.map((cell) => ({
                rowKey: row.key,
                rowOrder: row.order,
                rowLabel: row.label,
                subRowKey: cell.key,
                subRowOrder: cell.order,
                subRowLabel: cell.label,
            }));
            return cells;
        }).flat()
    ), [widget?.properties?.rows]);

    const handleCellClick = useCallback((cellKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingsIndex = mappings?.findIndex((mapping) => {
            if (
                selectedTag === mapping.tagId
                && mapping.widgetType === 'MATRIX1D'
            ) {
                return mapping.association.subRowKey === cellKey;
            }
            return false;
        });

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            const newMappings = [...(mappings ?? [])];
            newMappings.splice(selectedMappingsIndex, 1);

            onMappingsChange(newMappings, widget.clientId);
        } else {
            const rowKey = sortedCells
                ?.find((cell) => cell.subRowKey === cellKey)?.rowKey;

            if (!rowKey) {
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
        value: mappings?.some((mapping) => {
            if (
                selectedTag === mapping.tagId
                && mapping.widgetType === 'MATRIX1D'
            ) {
                return mapping.association.subRowKey === cell.subRowKey;
            }
            return false;
        }) ?? false,
        mappedCount: mappings?.filter((mapping) => {
            if (mapping.widgetType === 'MATRIX1D') {
                return mapping.association.subRowKey === cell.subRowKey;
            }
            return false;
        }).length ?? 0,
        onClick: handleCellClick,
        disabled: !selectedTag,
    }), [
        handleCellClick,
        selectedTag,
        mappings,
    ]);

    const subRowGroupRendererParams = useCallback((groupKey: string) => {
        const groupLabel = sortedCells
            ?.find((cell) => groupKey === cell.rowKey)
            ?.rowLabel;

        return ({
            title: groupLabel ?? groupKey,
        });
    }, [sortedCells]);

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
