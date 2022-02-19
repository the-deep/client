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
    MappingItem,
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
const subRowGroupKeySelector = (n: SubRowItem) => n.rowKey;

const subColumnKeySelector = (subRow: SubColumnItem) => subRow.subColumnKey;
const subColumnGroupKeySelector = (n: SubColumnItem) => n.columnKey;

interface Props {
    className?: string;
    widget: Matrix2dWidget;
    mapping: MappingItem[] | undefined;
    onMappingChange: React.Dispatch<React.SetStateAction<MappingItem[] | undefined>>;
    selectedTag: string | undefined;
}

function Matrix2dTagInput(props: Props) {
    const {
        className,
        widget,
        mapping,
        onMappingChange,
        selectedTag,
    } = props;

    const sortedCols = useMemo(() => (
        sortByOrder(widget?.properties?.columns)?.map((c) => ({
            columnKey: c.key,
            label: c.label,
        }))
    ), [widget?.properties?.columns]);

    const sortedSubRows = useMemo(() => (
        sortByOrder(widget?.properties?.rows)?.map((row) => {
            const subRows = row.subRows.map((c) => ({
                rowKey: row.key,
                rowOrder: row.order,
                rowLabel: row.label,
                subRowKey: c.key,
                subRowOrder: c.order,
                subRowLabel: c.label,
            }));
            return subRows;
        }).flat()
    ), [widget?.properties?.rows]);

    const sortedSubColumns = useMemo(() => (
        sortByOrder(widget?.properties?.columns)?.map((column) => {
            const subColumns = column.subColumns.map((c) => ({
                columnKey: column.key,
                columnOrder: column.order,
                columnLabel: column.label,
                subColumnKey: c.key,
                subColumnOrder: c.order,
                subColumnLabel: c.label,
            }));
            return subColumns;
        }).flat()
    ), [widget?.properties?.columns]);

    const handleColumnClick = useCallback((columnKey: string) => {
        if (!selectedTag) {
            return;
        }
        const selectedMappingIndex = mapping?.findIndex((m) => {
            if (
                selectedTag === m.tagId
                && m.widgetId === widget.clientId
                && m.widgetType === 'MATRIX2D'
                && m.mapping.type === 'COLUMN'
            ) {
                return m.mapping.columnKey === columnKey;
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
            onMappingChange((oldMapping = []) => ([
                ...oldMapping,
                {
                    tagId: selectedTag,
                    widgetId: widget.id,
                    widgetType: widget.widgetId,
                    mapping: {
                        type: 'COLUMN',
                        columnKey,
                    },
                },
            ]));
        }
    }, [
        onMappingChange,
        widget,
        mapping,
        selectedTag,
    ]);

    const colRendererParams = useCallback((_: string, subRow: ColItem) => ({
        title: subRow.label,
        itemKey: subRow.columnKey,
        value: mapping?.some((m) => {
            if (
                selectedTag === m.tagId
                && m.widgetId === widget.clientId
                && m.widgetType === 'MATRIX2D'
                && m.mapping.type === 'COLUMN'
            ) {
                return m.mapping.columnKey === subRow.columnKey;
            }
            return false;
        }) ?? false,
        onTagClick: handleColumnClick,
        disabled: !selectedTag,
    }), [
        widget,
        handleColumnClick,
        selectedTag,
        mapping,
    ]);

    const handleSubRowClick = useCallback((subRowKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingIndex = mapping?.findIndex((m) => {
            if (
                selectedTag === m.tagId
                && m.widgetId === widget.clientId
                && m.widgetType === 'MATRIX2D'
                && m.mapping.type === 'SUB_ROW'
            ) {
                return m.mapping.subRowKey === subRowKey;
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
            const rowKey = sortedSubRows?.find((sc) => sc.subRowKey === subRowKey)?.rowKey;

            if (!rowKey) {
                console.error('Sub-row without row is found');
                return;
            }

            onMappingChange((oldMapping = []) => ([
                ...(oldMapping),
                {
                    tagId: selectedTag,
                    widgetId: widget.id,
                    widgetType: 'MATRIX2D',
                    mapping: {
                        type: 'SUB_ROW',
                        subRowKey,
                        rowKey,
                    },
                },
            ]));
        }
    }, [
        sortedSubRows,
        onMappingChange,
        mapping,
        selectedTag,
        widget,
    ]);

    const subRowRendererParams = useCallback((_: string, subRow: SubRowItem) => ({
        title: subRow.subRowLabel,
        itemKey: subRow.subRowKey,
        value: mapping?.some((m) => {
            if (
                selectedTag === m.tagId
                && m.widgetId === widget.clientId
                && m.widgetType === 'MATRIX2D'
                && m.mapping.type === 'SUB_ROW'
            ) {
                return m.mapping.subRowKey === subRow.subRowKey;
            }
            return false;
        }) ?? false,
        onTagClick: handleSubRowClick,
        disabled: !selectedTag,
    }), [
        widget,
        handleSubRowClick,
        selectedTag,
        mapping,
    ]);

    const handleSubColumnClick = useCallback((subColumnKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingIndex = mapping?.findIndex((m) => {
            if (
                selectedTag === m.tagId
                && m.widgetId === widget.clientId
                && m.widgetType === 'MATRIX2D'
                && m.mapping.type === 'SUB_COLUMN'
            ) {
                return m.mapping.subColumnKey === subColumnKey;
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
            const columnKey = sortedSubColumns?.find(
                (sc) => sc.subColumnKey === subColumnKey,
            )?.columnKey;

            if (!columnKey) {
                console.error('Sub-column without column is found');
                return;
            }

            onMappingChange((oldMapping = []) => ([
                ...(oldMapping),
                {
                    tagId: selectedTag,
                    widgetId: widget.id,
                    widgetType: 'MATRIX2D',
                    mapping: {
                        type: 'SUB_COLUMN',
                        subColumnKey,
                        columnKey,
                    },
                },
            ]));
        }
    }, [
        sortedSubColumns,
        onMappingChange,
        mapping,
        selectedTag,
        widget,
    ]);

    const subColumnRendererParams = useCallback((_: string, subColumn: SubColumnItem) => ({
        title: subColumn.subColumnLabel,
        itemKey: subColumn.subColumnKey,
        value: mapping?.some((m) => {
            if (
                selectedTag === m.tagId
                && m.widgetId === widget.clientId
                && m.widgetType === 'MATRIX2D'
                && m.mapping.type === 'SUB_COLUMN'
            ) {
                return m.mapping.subColumnKey === subColumn.subColumnKey;
            }
            return false;
        }) ?? false,
        onTagClick: handleSubColumnClick,
        disabled: !selectedTag,
    }), [
        widget,
        handleSubColumnClick,
        selectedTag,
        mapping,
    ]);

    const subColumnGroupRendererParams = useCallback((groupKey: string) => {
        const groupLabel = sortedSubColumns
            ?.find((c) => groupKey === c.columnKey)
            ?.columnLabel;

        return ({
            title: groupLabel ?? groupKey,
        });
    }, [sortedSubColumns]);

    const subRowGroupRendererParams = useCallback((groupKey: string) => {
        const groupLabel = sortedSubRows
            ?.find((c) => groupKey === c.rowKey)
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
                    data={sortedCols}
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
