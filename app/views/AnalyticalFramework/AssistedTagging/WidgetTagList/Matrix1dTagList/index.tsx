import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    // compareNumber,
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
// const groupComparator = (a: CellItem, b: CellItem) => compareNumber(a.rowOrder, b.rowOrder);
const groupRendererParams = (title: string) => ({ title });

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
        sortByOrder(widget?.properties?.rows)?.reduce((acc: CellItem[], row) => {
            const cells = row.cells.map((c) => ({
                rowKey: row.key,
                rowOrder: row.order,
                rowLabel: row.label,
                subRowKey: c.key,
                subRowOrder: c.order,
                subRowLabel: c.label,
            }));
            return [
                ...acc,
                ...cells,
            ];
        }, [])
    ), [widget?.properties?.rows]);

    const handleCellClick = useCallback((cellKey: string) => {
        if (!selectedTag) {
            return;
        }

        const isCurrentlySelected = mapping?.some((m) => {
            if (
                selectedTag === m.tagId
                && m.widgetId === widget.clientId
                && m.widgetType === 'MATRIX1D'
            ) {
                return m.mapping.subRowKey === cellKey;
            }
            return false;
        }) ?? false;

        if (isCurrentlySelected) {
            onMappingChange((oldMapping) => (
                oldMapping?.filter((om) => {
                    if (
                        selectedTag === om.tagId
                        && om.widgetId === widget.clientId
                        && om.widgetType === 'MATRIX1D'
                    ) {
                        return om.mapping.subRowKey !== cellKey;
                    }
                    return true;
                })
            ));
        } else {
            const rowKey = sortedCells?.find((sc) => sc.subRowKey === cellKey)?.rowKey;

            if (!rowKey) {
                console.error('Sub-row without row is found');
                return;
            }

            onMappingChange((oldMapping) => ([
                ...(oldMapping ?? []),
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
            groupRendererParams={groupRendererParams}
            groupKeySelector={groupKeySelector}
            groupRenderer={CellGroup}
            // groupComparator={groupComparator}
            grouped
        />
    );
}

export default Matrix1dTagInput;
