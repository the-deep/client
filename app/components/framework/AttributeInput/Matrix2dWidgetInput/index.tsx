import React, { useMemo, useCallback, useState } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import {
    Checkbox,
    Heading,
    List,
} from '@the-deep/deep-ui';
import { IoArrowBackOutline } from 'react-icons/io5';
import { PartialForm, Error, getErrorObject } from '@togglecorp/toggle-form';
import { sortByOrder } from '#utils/common';
import { removeUndefinedKeys, removeEmptyObject } from '#utils/unsafeCommon';

import NonFieldError from '#components/NonFieldError';
import { Matrix2dWidget } from '#types/newAnalyticalFramework';
import { Matrix2dWidgetAttribute } from '#types/newEntry';

import WidgetWrapper from '../WidgetWrapper';

import styles from './styles.css';

type Matrix2dValue = NonNullable<Matrix2dWidgetAttribute['data']>;

export type PartialMatrix2dWidget = PartialForm<
    Matrix2dWidget,
    'key' | 'widgetId' | 'order' | 'conditional'
>;

type RowType = NonNullable<NonNullable<NonNullable<PartialMatrix2dWidget>['properties']>['rows']>[number];
type ColumnType = NonNullable<NonNullable<NonNullable<PartialMatrix2dWidget>['properties']>['columns']>[number];
type SubRow = NonNullable<NonNullable<RowType>['subRows']>[number];

interface ColumnProps {
    onSubRowChange: (
        rowId: string,
        subRowId: string,
        columnId: string,
        selected: (val: string[] | undefined) => string[] | undefined,
    ) => void;
    rowId: string;
    subRowId: string;
    columnId: string;
    subColumnId?: string;
    disabled?: boolean;
    title?: string;
    selected: boolean;
}
function Column(props: ColumnProps) {
    const {
        rowId,
        subRowId,
        columnId,
        subColumnId,
        onSubRowChange,
        disabled,
        title,
        selected,
    } = props;

    const handleSubRowChange = useCallback(
        (val: boolean) => {
            if (subColumnId) {
                onSubRowChange(
                    rowId,
                    subRowId,
                    columnId,
                    (oldValue) => {
                        if (val) {
                            return [...(oldValue ?? []), subColumnId];
                        }
                        const newValue = oldValue?.filter((item) => item !== subColumnId);
                        if (!newValue || newValue.length <= 0) {
                            return undefined;
                        }
                        return newValue;
                    },
                );
            } else {
                onSubRowChange(rowId, subRowId, columnId, () => (val ? [] : undefined));
            }
        },
        [rowId, subRowId, columnId, subColumnId, onSubRowChange],
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
        selected: (val: string[] | undefined) => string[] | undefined,
    ) => void;
    subRow: SubRow;
    value: NonNullable<NonNullable<Matrix2dValue['value']>[string]>[string];
    columns: ColumnType[] | undefined;
    selectedColumnId: string | undefined;
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

        selectedColumnId,
    } = props;

    const {
        tooltip: title,
        label,
        key: subRowId,
    } = subRow;

    const selectedColumn = columns?.find((item) => item.key === selectedColumnId);

    return (
        <tr
            className={_cs(className, styles.tableRow)}
        >
            <td
                className={_cs(styles.tableRow, styles.subRowHeading)}
                title={title ?? ''}
            >
                {label ?? 'Unnamed'}
            </td>
            {!selectedColumn && columns?.map((column) => (
                <Column
                    key={column.key}
                    rowId={rowId}
                    subRowId={subRowId}
                    columnId={column.key}
                    disabled={disabled}
                    title={`${subRow.label} & ${column.label}`}
                    selected={Array.isArray(value?.[column.key])}
                    onSubRowChange={onSubRowChange}
                />
            ))}
            {selectedColumn && selectedColumn.subColumns?.map((subColumn) => (
                <Column
                    key={subColumn.key}
                    rowId={rowId}
                    subRowId={subRowId}
                    columnId={selectedColumn.key}
                    subColumnId={subColumn.key}
                    disabled={disabled}
                    title={`${subRow.label} & ${subColumn.label}`}
                    selected={value?.[selectedColumn.key]?.includes(subColumn.key) ?? false}
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
        selected: (val: string[] | undefined) => string[] | undefined,
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

    const [selectedColumnKey, setSelectedColumnKey] = useState<string | undefined>(undefined);

    const selectedColumn = columns?.find((item) => item.key === selectedColumnKey);

    const {
        key,
        label,
        tooltip,
        subRows,
    } = row;

    const orderedSubRows = useMemo(() => (
        sortByOrder(subRows)
    ), [subRows]);

    const subRowKeySelector = useCallback(
        (subRow: SubRow) => subRow.key,
        [],
    );
    const subRowRendererParams = useCallback(
        (_: string, subRow: SubRow) => ({
            onSubRowChange,
            disabled: disabled || readOnly,
            value: value?.[subRow.key],
            subRow,
            rowId: key,
            columns,
            selectedColumnId: selectedColumnKey,
        }),
        [disabled, onSubRowChange, readOnly, value, key, columns, selectedColumnKey],
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
                        {!selectedColumn && (
                            <React.Fragment
                                key={`${row.key}-column`}
                            >
                                {/* eslint-disable-next-line max-len */}
                                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                                <th className={_cs(styles.tableHeader, styles.firstColumn)} />
                                {columns?.map((column) => (
                                    <th
                                        className={_cs(
                                            styles.tableHeader,
                                            ((column.subColumns?.length ?? 0) > 0 && !readOnly)
                                                && styles.clickable,
                                        )}
                                        key={column.key}
                                        title={column.tooltip}
                                        onClick={() => {
                                            if ((column.subColumns?.length ?? 0) > 0 && !readOnly) {
                                                setSelectedColumnKey(column.key);
                                            }
                                        }}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </React.Fragment>
                        )}
                        {selectedColumn && (
                            <React.Fragment
                                key={`${row.key}-${selectedColumn}`}
                            >
                                <th
                                    className={_cs(
                                        styles.tableHeader,
                                        styles.firstColumn,
                                        styles.clickable,
                                    )}
                                    onClick={() => setSelectedColumnKey(undefined)}
                                >
                                    <div className={styles.back}>
                                        <IoArrowBackOutline />
                                        Back
                                    </div>
                                </th>
                                {selectedColumn.subColumns?.map((subColumn) => (
                                    <th
                                        className={styles.tableHeader}
                                        key={subColumn.key}
                                        title={subColumn.tooltip}
                                    >
                                        {subColumn.label}
                                    </th>
                                ))}
                            </React.Fragment>
                        )}
                    </tr>
                </thead>
                <tbody>
                    <List
                        data={orderedSubRows}
                        keySelector={subRowKeySelector}
                        rendererParams={subRowRendererParams}
                        renderer={SubRow}
                    />
                </tbody>
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
    icons?: React.ReactNode,
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
        icons,
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
            state: (val: string[] | undefined) => string[] | undefined,
        ) => {
            const newValue = removeEmptyObject(removeUndefinedKeys({
                ...value?.value,
                [rowId]: {
                    ...value?.value[rowId],
                    [subRowId]: {
                        ...value?.value[rowId]?.[subRowId],
                        [columnId]: state(value?.value[rowId]?.[subRowId]?.[columnId]),
                    },
                },
            }));
            onChange(newValue, name);
        },
        [value, name, onChange],
    );

    const rowKeySelector = useCallback(
        (row: RowType) => row.key,
        [],
    );

    const columns = useMemo(() => (
        sortByOrder(widget.properties?.columns)
    ), [widget.properties?.columns]);

    const rowRendererParams = useCallback(
        (key: string, row: RowType) => ({
            disabled,
            readOnly,
            value: value?.value[key],
            row,
            columns,
            onSubRowChange: handleSubRowChange,
        }),
        [disabled, readOnly, handleSubRowChange, value, columns],
    );

    const orderedRows = useMemo(() => (
        sortByOrder(widget.properties?.rows)
    ), [widget.properties?.rows]);

    return (
        <WidgetWrapper
            className={className}
            childrenContainerClassName={styles.matrix}
            title={title}
            actions={actions}
            icons={icons}
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
