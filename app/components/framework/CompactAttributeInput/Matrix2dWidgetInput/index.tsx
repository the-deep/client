import React, { useMemo, useCallback } from 'react';
import { _cs, isNotDefined, listToMap } from '@togglecorp/fujs';
import {
    MultiSelectInput,
    ListView,
    List,
} from '@the-deep/deep-ui';
import { IoChevronForward } from 'react-icons/io5';
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
    'key' | 'widgetId' | 'order'
>;

type RowType = NonNullable<NonNullable<NonNullable<PartialMatrix2dWidget>['properties']>['rows']>[number];
type ColumnType = NonNullable<NonNullable<NonNullable<PartialMatrix2dWidget>['properties']>['columns']>[number];
type SubColumn = NonNullable<NonNullable<ColumnType>['subColumns']>[number];
type SubRow = NonNullable<NonNullable<RowType>['subRows']>[number];

const columnKeySelector = (col: ColumnType) => col.key;
const subColumnKeySelector = (col: SubColumn) => col.key;
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
        key: columnId,
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
        const optionsMap = listToMap(subColumns, (d) => d.key, (d) => d.label);
        return value?.[columnId]?.map((v) => optionsMap?.[v])?.join(', ');
    }, [subColumns, value, columnId]);

    return (
        <div className={styles.column}>
            <div className={styles.columnDetails}>
                <div className={styles.columnTitle}>
                    <div className={styles.subrowLabel}>
                        {subRowLabel}
                    </div>
                    <IoChevronForward className={styles.separatorIcon} />
                    <div className={styles.columnLabel}>
                        {column.label}
                    </div>
                </div>
                {!readOnly ? (
                    <MultiSelectInput
                        name={column.key}
                        value={value?.[column.key]}
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
        key: subRowId,
    } = subRow;

    const orderedColumns = useMemo(() => {
        const filteredSubRows = columns?.filter((col) => value?.[col.key]);
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
        key,
        label,
        tooltip,
        subRows,
    } = row;

    const orderedSubRows = useMemo(() => {
        const filteredSubRows = subRows?.filter((sr) => value?.[sr.key]);
        return sortByOrder(filteredSubRows);
    }, [subRows, value]);

    const subRowKeySelector = useCallback(
        (subRow: SubRow) => subRow.key,
        [],
    );
    const subRowRendererParams = useCallback(
        (_: string, subRow: SubRow) => ({
            onSubColumnsChange,
            disabled,
            readOnly,
            value: value?.[subRow.key],
            subRow,
            rowId: key,
            columns,
        }),
        [disabled, onSubColumnsChange, readOnly, value, key, columns],
    );

    return (
        <div className={styles.matrixRow}>
            <div
                className={styles.rowTitle}
                title={tooltip ?? ''}
            >
                {label ?? 'Unnamed'}
            </div>
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
        widget,
        name,
        value,
        onChange: onChangeFromProps,
        disabled,
        readOnly,
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
        (row: RowType) => row.key,
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
        const filteredRows = widgetRows?.filter((wr) => value?.value?.[wr.key]);
        return sortByOrder(filteredRows);
    }, [widgetRows, value]);

    return (
        <WidgetWrapper
            className={_cs(className, styles.matrix)}
            error={error}
            hideTitle
        >
            <NonFieldError
                error={error}
            />
            <ListView
                className={styles.rowList}
                data={orderedRows}
                keySelector={rowKeySelector}
                rendererParams={rowRendererParams}
                renderer={Row}
                compactEmptyMessage
            />
        </WidgetWrapper>
    );
}

export default Matrix2dWidgetInput;
