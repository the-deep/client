import React, { useMemo, useCallback } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import {
    Checkbox,
    Heading,
    List,
} from '@the-deep/deep-ui';
import { PartialForm, Error, getErrorObject } from '@togglecorp/toggle-form';
import { sortByOrder } from '#utils/common';

import NonFieldError from '#components/NonFieldError';
import { Matrix2dWidget } from '#types/newAnalyticalFramework';
import { Matrix2dWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

import styles from './styles.css';

type Matrix2dValue = NonNullable<Matrix2dWidgetAttribute['data']>;

export type PartialMatrix2dWidget = PartialForm<
    Matrix2dWidget,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type RowType = NonNullable<NonNullable<NonNullable<PartialMatrix2dWidget>['properties']>['rows']>[number];
type ColumnType = NonNullable<NonNullable<NonNullable<PartialMatrix2dWidget>['properties']>['columns']>[number];
type SubRow = NonNullable<NonNullable<RowType>['subRows']>[number];

interface ColumnProps {
    onSubRowChange: (
        rowId: string,
        subRowId: string,
        columnId: string,
        selected: string[] | undefined,
    ) => void;
    rowId: string;
    subRowId: string;
    columnId: string;
    disabled?: boolean;
    title?: string;
    selected: boolean;
}
function Column(props: ColumnProps) {
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
            className={_cs(styles.tableColumn, styles.checkboxColumn)}
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
    value: NonNullable<NonNullable<Matrix2dValue['value']>[string]>[string];
    columns: ColumnType[] | undefined;
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
                className={_cs(styles.tableRow, styles.subRowHeading)}
                title={title ?? ''}
            >
                {label ?? 'Unnamed'}
            </td>
            {columns?.map((column) => (
                <Column
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
    row: RowType;
    columns: ColumnType[] | undefined;
    value: NonNullable<Matrix2dValue['value']>[string];
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

    const orderedSubRows = useMemo(() => (
        sortByOrder(subRows)
    ), [subRows]);

    const subRowKeySelector = useCallback(
        (subRow: SubRow) => subRow.clientId,
        [],
    );
    const subRowRendererParams = useCallback(
        (_: string, subRow: SubRow) => ({
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
                <thead>
                    <tr className={_cs(styles.tableRow, styles.tableHead)}>
                        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                        <th
                            className={styles.tableHeader}
                        />
                        {columns?.map((column) => (
                            <th
                                className={styles.tableHeader}
                                key={column.clientId}
                                title={column.tooltip}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <List
                    data={orderedSubRows}
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
    error: Error<Matrix2dValue> | undefined;
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
        onChange: onChangeFromProps,
        disabled,
        readOnly,
        actions,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

    const onChange = useCallback(
        (val: Matrix2dValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );

    const handleSubRowChange = useCallback(
        (
            rowId: string,
            subRowId: string,
            columnId: string,
            state: string[] | undefined,
        ) => {
            const newValue = {
                ...value?.value,
                [rowId]: {
                    ...value?.value?.[rowId],
                    [subRowId]: {
                        ...value?.value?.[rowId]?.[subRowId],
                        [columnId]: state,
                    },
                },
            };
            onChange(newValue, name);
        },
        [value, name, onChange],
    );

    const rowKeySelector = useCallback(
        (row: RowType) => row.clientId,
        [],
    );

    const columns = useMemo(() => (
        sortByOrder(widget?.properties?.columns)
    ), [widget?.properties?.columns]);

    const rowRendererParams = useCallback(
        (key: string, row: RowType) => ({
            disabled,
            readOnly,
            value: value?.value?.[key],
            row,
            columns,
            onSubRowChange: handleSubRowChange,
        }),
        [disabled, readOnly, handleSubRowChange, value, columns],
    );

    const orderedRows = useMemo(() => (
        sortByOrder(widget?.properties?.rows)
    ), [widget?.properties?.rows]);

    return (
        <WidgetWrapper
            className={className}
            childrenContainerClassName={styles.matrix}
            title={title}
            actions={actions}
            error={error}
        >
            <NonFieldError
                error={error}
            />
            <List
                data={orderedRows}
                keySelector={rowKeySelector}
                rendererParams={rowRendererParams}
                renderer={Row}
            />
        </WidgetWrapper>
    );
}

export default Matrix2dWidgetInput;
