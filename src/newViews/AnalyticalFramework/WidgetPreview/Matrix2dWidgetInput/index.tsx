import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Checkbox,
    Heading,
    List,
} from '@the-deep/deep-ui';

import { Matrix2dValue, Matrix2dWidget, PartialForm } from '../../types';
import WidgetWrapper from '../../Widget';

import styles from './styles.scss';

export type PartialMatrix2dWidget = PartialForm<
    Matrix2dWidget,
    'clientId' | 'type'
>;

type Row = NonNullable<NonNullable<NonNullable<PartialMatrix2dWidget>['data']>['rows']>[number];
type Column = NonNullable<NonNullable<NonNullable<PartialMatrix2dWidget>['data']>['columns']>[number];
type SubRow = NonNullable<NonNullable<Row>['subRows']>[number];

interface CellProps {
    onSubRowChange: (
        rowId: string,
        subRowId: string,
        columnId: string,
        selected: string[] | undefined,
    ) => void;
    rowId: string,
    subRowId: string,
    columnId: string,
    disabled?: boolean,
    title?: string,
    selected: boolean,
}
function Cell(props: CellProps) {
    const {
        rowId,
        subRowId,
        columnId,
        onSubRowChange,
        disabled,
        title,
        selected,
    } = props;

    const handleSubRowChange = useCallback(
        (val: boolean) => {
            onSubRowChange(rowId, subRowId, columnId, val ? [] : undefined);
        },
        [rowId, subRowId, columnId, onSubRowChange],
    );

    return (
        <td
            title={title}
            className={_cs(styles.tableCell, styles.checkboxCell)}
        >
            <Checkbox
                className={styles.input}
                checkmarkClassName={_cs(
                    !selected && styles.notSelected,
                )}
                name={columnId}
                onChange={handleSubRowChange}
                disabled={disabled}
                value={selected}
                labelContainerClassName={styles.label}
            />
        </td>
    );
}

interface SubRowProps {
    className?: string;
    disabled?: boolean;
    // selected: boolean;
    rowId: string;

    onSubRowChange: (
        rowId: string,
        subRowId: string,
        columnId: string,
        selected: string[] | undefined,
    ) => void;
    subRow: SubRow;
    value: NonNullable<NonNullable<Matrix2dValue>[string]>[string];
    columns: Column[] | undefined;
}

function SubRow(props: SubRowProps) {
    const {
        // selected,
        disabled,
        rowId,
        onSubRowChange,
        className,

        subRow,
        value,
        columns,
    } = props;

    const {
        tooltip: title,
        label,
        clientId: subRowId,
    } = subRow;

    return (
        <tr className={_cs(className, styles.tableRow)}>
            <td
                className={_cs(styles.tableCell, styles.subRowHeading)}
                title={title ?? ''}
            >
                {label ?? 'Unnamed'}
            </td>
            {columns?.map(column => (
                <Cell
                    key={column.clientId}
                    rowId={rowId}
                    subRowId={subRowId}
                    columnId={column.clientId}
                    disabled={disabled}
                    title={`${subRow.label} & ${column.label}`}
                    selected={Array.isArray(value?.[column.clientId])}
                    onSubRowChange={onSubRowChange}
                />
            ))}
        </tr>
    );
}

interface RowProps {
    disabled?: boolean;
    readOnly?: boolean;
    row: Row;
    columns: Column[] | undefined;
    value: NonNullable<Matrix2dValue>[string];
    onSubRowChange: (
        rowId: string,
        subRowId: string,
        columnId: string,
        selected: string[] | undefined,
    ) => void;
}

function Row(props: RowProps) {
    const {
        row,
        onSubRowChange,
        disabled,
        readOnly,
        value,
        columns,
    } = props;

    const {
        clientId,
        label,
        tooltip,
        subRows,
    } = row;

    const subRowKeySelector = useCallback(
        (subRow: SubRow) => subRow.clientId,
        [],
    );
    const subRowRendererParams = useCallback(
        (key: string, subRow: SubRow) => ({
            onSubRowChange,
            disabled: disabled || readOnly,
            value: value?.[subRow.clientId],
            subRow,
            rowId: clientId,
            columns,
        }),
        [disabled, onSubRowChange, readOnly, value, clientId, columns],
    );

    return (
        <div className={styles.matrixRow}>
            <Heading
                className={styles.title}
                size="extraSmall"
                title={tooltip ?? ''}
            >
                {label ?? 'Unnamed'}
            </Heading>
            <table className={styles.table}>
                <tr className={_cs(styles.tableRow, styles.tableHead)}>
                    <th
                        className={styles.tableHeader}
                    />
                    {columns?.map(column => (
                        <th
                            className={styles.tableHeader}
                            key={column.clientId}
                            title={column.tooltip}
                        >
                            {column.label}
                        </th>
                    ))}
                </tr>
                <List
                    data={subRows}
                    keySelector={subRowKeySelector}
                    rendererParams={subRowRendererParams}
                    renderer={SubRow}
                />
            </table>
        </div>
    );
}

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: Matrix2dValue | null | undefined,
    onChange: (value: Matrix2dValue | undefined, name: N) => void,

    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialMatrix2dWidget,
}

function Matrix2dWidgetInput<N extends string>(props: Props<N>) {
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

    const handleSubRowChange = useCallback(
        (rowId: string, subRowId: string, columnId: string, state: string[] | undefined) => {
            const newValue: Matrix2dValue = {
                ...value,
                [rowId]: {
                    ...value?.[rowId],
                    [subRowId]: {
                        ...value?.[rowId]?.[subRowId],
                        [columnId]: state,
                    },
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

    const columns = widget?.data?.columns;
    const rowRendererParams = useCallback(
        (key: string, row: Row) => ({
            disabled,
            readOnly,
            value: value?.[key],
            row,
            columns,
            onSubRowChange: handleSubRowChange,
        }),
        [disabled, readOnly, handleSubRowChange, value, columns],
    );

    return (
        <WidgetWrapper
            className={className}
            childrenContainerClassName={styles.matrix2d}
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

export default Matrix2dWidgetInput;
