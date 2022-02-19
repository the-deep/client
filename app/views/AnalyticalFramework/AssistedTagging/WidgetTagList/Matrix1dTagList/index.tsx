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
    MappingItem,
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
    mapping: MappingItem[] | undefined;
    onMappingChange: React.Dispatch<React.SetStateAction<MappingItem[] | undefined>>;
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
                && m.widgetId === widget.clientId
                && m.widgetType === 'MATRIX1D'
            ) {
                return m.mapping.subRowKey === cellKey;
            }
            return false;
        });

        if (isDefined(selectedMappingIndex) && selectedMappingIndex !== -1) {
            onMappingChange((oldMapping = []) => {
                const newMapping = [...oldMapping];
                newMapping.splice(selectedMappingIndex, 1);

                return newMapping;
            });
        } else {
            const rowKey = sortedCells?.find((sc) => sc.subRowKey === cellKey)?.rowKey;

            if (!rowKey) {
                console.error('Sub-row without row is found');
                return;
            }

            onMappingChange((oldMapping = []) => ([
                ...(oldMapping),
                {
                    tagId: selectedTag,
                    widgetId: widget.id,
                    widgetType: 'MATRIX1D',
                    mapping: {
                        subRowKey: cellKey,
                        rowKey,
                    },
                },
            ]));
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
                && m.widgetId === widget.clientId
                && m.widgetType === 'MATRIX1D'
            ) {
                return m.mapping.subRowKey === cell.subRowKey;
            }
            return false;
        }) ?? false,
        onTagClick: handleCellClick,
        disabled: !selectedTag,
    }), [
        widget,
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
