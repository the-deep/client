import React, { useCallback } from 'react';
import { Button, List } from '@the-deep/deep-ui';

import { Matrix1dValue, Matrix1dWidget, PartialForm } from '../../types';
import WidgetWrapper from '../../Widget';

import styles from './styles.scss';

export type PartialMatrix1dWidget = PartialForm<
    Matrix1dWidget,
    'clientId' | 'type'
>;

type Row = NonNullable<NonNullable<NonNullable<PartialMatrix1dWidget>['data']>['rows']>[number];
type Cell = NonNullable<NonNullable<Row>['cells']>[number];

interface CellProps {
    className?: string;
    disabled?: boolean;
    label?: string;
    title?: string;
    selected: boolean;
    rowId: string;
    cellId: string;
    onCellChange: (rowId: string, cellId: string, selected: boolean) => void;
}

function Cell(props: CellProps) {
    const {
        disabled,
        label,
        title,
        selected,
        rowId,
        cellId,
        onCellChange,
        className,
    } = props;

    const handleCellChange = useCallback(
        () => {
            onCellChange(rowId, cellId, selected);
        },
        [rowId, cellId, onCellChange, selected],
    );

    return (
        <Button
            className={className}
            name={undefined}
            title={title ?? ''}
            variant={selected ? 'primary' : 'secondary'}
            onClick={handleCellChange}
            disabled={disabled}
        >
            {label ?? 'Unnamed'}
        </Button>
    );
}

interface RowProps {
    disabled?: boolean;
    readOnly?: boolean;
    row: Row;
    value: NonNullable<Matrix1dValue>[string];
    onCellChange: (rowId: string, cellId: string, selected: boolean) => void;
}

function Row(props: RowProps) {
    const {
        row,
        onCellChange,
        disabled,
        readOnly,
        value,
    } = props;

    const {
        clientId,
        label,
        tooltip,
        cells,
    } = row;

    const cellKeySelector = useCallback(
        (cell: Cell) => cell.clientId,
        [],
    );
    const cellRendererParams = useCallback(
        (key: string, cell: Cell) => ({
            key: cell.clientId,
            title: cell.tooltip,
            label: cell.label,
            onCellChange,
            disabled: disabled || readOnly,
            selected: value?.[cell.clientId] ?? false,
            rowId: clientId,
            cellId: cell.clientId,
        }),
        [disabled, onCellChange, readOnly, value, clientId],
    );

    return (
        <div className={styles.row}>
            <div
                className={styles.title}
                title={tooltip ?? ''}
            >
                {label ?? 'Unnamed'}
            </div>
            <div className={styles.tags}>
                <List
                    data={cells}
                    keySelector={cellKeySelector}
                    rendererParams={cellRendererParams}
                    renderer={Cell}
                />
            </div>
        </div>
    );
}

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: Matrix1dValue | null | undefined,
    onChange: (value: Matrix1dValue | undefined, name: N) => void,

    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialMatrix1dWidget,
}

function Matrix1dWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        widget,
        name,
        value,
        onChange,
        disabled,
        readOnly,
        actions,
    } = props;

    const handleCellChange = useCallback(
        (rowId: string, cellId: string, state: boolean) => {
            const newValue = {
                ...value,
                [rowId]: {
                    ...value?.[rowId],
                    [cellId]: state,
                },
            };
            onChange(newValue, name);
        },
        [value, name, onChange],
    );

    const rowKeySelector = useCallback(
        (row: Row) => row.clientId,
        [],
    );
    const rowRendererParams = useCallback(
        (key: string, row: Row) => ({
            disabled,
            readOnly,
            value: value?.[key],
            row,
            onCellChange: handleCellChange,
        }),
        [disabled, readOnly, handleCellChange, value],
    );

    return (
        <WidgetWrapper
            className={className}
            childrenContainerClassName={styles.matrix1d}
            title={title}
            actions={actions}
        >
            <List
                data={widget?.data?.rows}
                keySelector={rowKeySelector}
                rendererParams={rowRendererParams}
                renderer={Row}
            />
        </WidgetWrapper>
    );
}

export default Matrix1dWidgetInput;
