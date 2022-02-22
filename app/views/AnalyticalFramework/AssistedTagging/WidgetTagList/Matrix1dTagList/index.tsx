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
    CategoricalMappingItem,
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
    mapping: CategoricalMappingItem[] | undefined;
    onMappingChange: (newMapping: CategoricalMappingItem[], widgetPk: string) => void;
    selectedTag: string | undefined;
}

function Matrix1dTagInput(props: Props) {
    const {
        className,
        widget,
        mapping,
        onMappingChange,
        selectedTag,
    } = props;

    const sortedCells = useMemo(() => (
        sortByOrder(widget?.properties?.rows)?.map((row) => {
            const cells = row.cells.map((c) => ({
                rowKey: row.key,
                rowOrder: row.order,
                rowLabel: row.label,
                subRowKey: c.key,
                subRowOrder: c.order,
                subRowLabel: c.label,
            }));
            return cells;
        }).flat()
    ), [widget?.properties?.rows]);

    const handleCellClick = useCallback((cellKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingIndex = mapping?.findIndex((m) => {
            if (
                selectedTag === m.tagId
                && m.widgetType === 'MATRIX1D'
            ) {
                return m.association.subRowKey === cellKey;
            }
            return false;
        });

        if (isDefined(selectedMappingIndex) && selectedMappingIndex !== -1) {
            const newMapping = [...(mapping ?? [])];
            newMapping.splice(selectedMappingIndex, 1);

            onMappingChange(newMapping, widget.clientId);
        } else {
            const rowKey = sortedCells?.find((sc) => sc.subRowKey === cellKey)?.rowKey;

            if (!rowKey) {
                console.error('Sub-row without row is found');
                return;
            }

            onMappingChange([
                ...(mapping ?? []),
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
        onMappingChange,
        mapping,
        selectedTag,
        widget,
    ]);

    const cellRendererParams = useCallback((_: string, cell: CellItem) => ({
        title: cell.subRowLabel,
        itemKey: cell.subRowKey,
        value: mapping?.some((m) => {
            if (
                selectedTag === m.tagId
                && m.widgetType === 'MATRIX1D'
            ) {
                return m.association.subRowKey === cell.subRowKey;
            }
            return false;
        }) ?? false,
        mappedCount: mapping?.filter((m) => {
            if (m.widgetType === 'MATRIX1D') {
                return m.association.subRowKey === cell.subRowKey;
            }
            return false;
        }).length ?? 0,
        onTagClick: handleCellClick,
        disabled: !selectedTag,
    }), [
        handleCellClick,
        selectedTag,
        mapping,
    ]);

    const subRowGroupRendererParams = useCallback((groupKey: string) => {
        const groupLabel = sortedCells
            ?.find((c) => groupKey === c.rowKey)
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
