import React, { useMemo, useCallback } from 'react';
import { _cs, isNotDefined, listToMap } from '@togglecorp/fujs';
import {
    MultiSelectInput,
    ListView,
    Heading,
    List,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';
import { sortByOrder } from '#utils/common';

import { Matrix2dWidget } from '#types/newAnalyticalFramework';
import { Matrix2dWidgetAttribute } from '#types/newEntry';

import styles from './styles.css';

type Matrix2dValue = NonNullable<Matrix2dWidgetAttribute['data']>;

export type PartialMatrix2dWidget = PartialForm<
    Matrix2dWidget,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type RowType = NonNullable<NonNullable<NonNullable<PartialMatrix2dWidget>['properties']>['rows']>[number];
type ColumnType = NonNullable<NonNullable<NonNullable<PartialMatrix2dWidget>['properties']>['columns']>[number];
type SubColumn = NonNullable<NonNullable<ColumnType>['subColumns']>[number];
type SubRow = NonNullable<NonNullable<RowType>['subRows']>[number];

const columnKeySelector = (col: ColumnType) => col.clientId;
const subColumnKeySelector = (col: SubColumn) => col.clientId;
const subColumnLabelSelector = (col: SubColumn) => col.label ?? '';

interface ColumnProps {
    subRowLabel?: string;
    value: NonNullable<NonNullable<Matrix2dValue['value']>[string]>[string];
    column: ColumnType;
    onSubColumnsChange: (
        rowId: string,
        subRowId: string,
        columnId: string,
        selected: string[] | undefined,
    ) => void;
    rowId: string;
    subRowId: string;
    readOnly?: boolean;
    disabled?: boolean;
}

function Column(props: ColumnProps) {
    const {
        subRowLabel,
        value,
        column,
        onSubColumnsChange,
        rowId,
        subRowId,
        readOnly,
        disabled,
    } = props;

    const {
        subColumns,
        clientId: columnId,
    } = column;

    const handleSubColumnValueChange = useCallback((newValues?: string[]) => {
        onSubColumnsChange(
            rowId,
            subRowId,
            columnId,
            newValues,
        );
    }, [onSubColumnsChange, rowId, subRowId, columnId]);

    const selectedValues = useMemo(() => {
        const optionsMap = listToMap(subColumns, (d) => d.clientId, (d) => d.label);
        return value?.[columnId]?.map((v) => optionsMap?.[v])?.join(', ');
    }, [subColumns, value, columnId]);

    return (
        <div className={styles.column}>
            <div className={styles.subRowLabel}>
                {subRowLabel}
            </div>
            <div className={styles.columnDetails}>
                <div className={styles.columnLabel}>
                    {column.label}
                </div>
                {!readOnly ? (
                    <MultiSelectInput
                        name={column.clientId}
                        value={value?.[column.clientId]}
                        disabled={disabled}
                        labelSelector={subColumnLabelSelector}
                        onChange={handleSubColumnValueChange}
                        options={subColumns}
                        keySelector={subColumnKeySelector}
                    />
                ) : (
                    <div className={styles.selectedValues}>
                        {selectedValues}
                    </div>
                )}
            </div>
        </div>
    );
}

interface SubRowProps {
    disabled?: boolean;
    readOnly?: boolean;
    rowId: string;

    onSubColumnsChange: (
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
        disabled,
        readOnly,
        rowId,
        onSubColumnsChange,

        subRow,
        value,
        columns,
    } = props;

    const {
        label,
        clientId: subRowId,
    } = subRow;

    const orderedColumns = useMemo(() => {
        const filteredSubRows = columns?.filter((col) => value?.[col.clientId]);
        return sortByOrder(filteredSubRows);
    }, [columns, value]);

    const columnRendererParams = useCallback((_: string, column: ColumnType) => ({
        subRowLabel: label,
        column,
        readOnly,
        value,
        disabled,
        rowId,
        subRowId,
        onSubColumnsChange,
    }), [
        readOnly,
        subRowId,
        label,
        value,
        disabled,
        rowId,
        onSubColumnsChange,
    ]);

    return (
        <List
            data={orderedColumns}
            keySelector={columnKeySelector}
            rendererParams={columnRendererParams}
            renderer={Column}
        />
    );
}

interface RowProps {
    disabled?: boolean;
    readOnly?: boolean;
    row: RowType;
    columns: ColumnType[] | undefined;
    value: NonNullable<Matrix2dValue['value']>[string];
    onSubColumnsChange: (
        rowId: string,
        subRowId: string,
        columnId: string,
        selected: string[] | undefined,
    ) => void;
}

function Row(props: RowProps) {
    const {
        row,
        onSubColumnsChange,
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

    const orderedSubRows = useMemo(() => {
        const filteredSubRows = subRows?.filter((sr) => value?.value?.[sr.clientId]);
        return sortByOrder(filteredSubRows);
    }, [subRows, value]);

    const subRowKeySelector = useCallback(
        (subRow: SubRow) => subRow.clientId,
        [],
    );
    const subRowRendererParams = useCallback(
        (_: string, subRow: SubRow) => ({
            onSubColumnsChange,
            disabled,
            readOnly,
            value: value?.[subRow.clientId],
            subRow,
            rowId: clientId,
            columns,
        }),
        [disabled, onSubColumnsChange, readOnly, value, clientId, columns],
    );

    return (
        <div className={styles.matrixRow}>
            <Heading
                size="extraSmall"
                title={tooltip ?? ''}
            >
                {label ?? 'Unnamed'}
            </Heading>
            <List
                data={orderedSubRows}
                keySelector={subRowKeySelector}
                rendererParams={subRowRendererParams}
                renderer={SubRow}
            />
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
        widget,
        name,
        value,
        onChange: onChangeFromProps,
        disabled,
        readOnly,
    } = props;

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

    const handleSubColumnsChange = useCallback(
        (
            rowId: string,
            subRowId: string,
            columnId: string,
            newSubColValue: string[] | undefined,
        ) => {
            const newValue = {
                ...value?.value,
                [rowId]: {
                    ...value?.value?.[rowId],
                    [subRowId]: {
                        ...value?.value?.[rowId]?.[subRowId],
                        [columnId]: newSubColValue,
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
            onSubColumnsChange: handleSubColumnsChange,
        }),
        [disabled, readOnly, handleSubColumnsChange, value, columns],
    );

    const widgetRows = widget?.properties?.rows;

    const orderedRows = useMemo(() => {
        const filteredRows = widgetRows?.filter((wr) => value?.value?.[wr.clientId]);
        return sortByOrder(filteredRows);
    }, [widgetRows, value]);

    return (
        <ListView
            className={_cs(className, styles.matrix)}
            data={orderedRows}
            keySelector={rowKeySelector}
            rendererParams={rowRendererParams}
            renderer={Row}
        />
    );
}

export default Matrix2dWidgetInput;
