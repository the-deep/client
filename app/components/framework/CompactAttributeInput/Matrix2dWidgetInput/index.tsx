import React, { useMemo, useCallback } from 'react';
import { _cs, isNotDefined, listToMap } from '@togglecorp/fujs';
import {
    MultiSelectInput,
    MultiBadgeInput,
    ListView,
    List,
    Button,
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
    'key' | 'widgetId' | 'order' | 'conditional'
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
    suggestionModeEnabled?: boolean;
    recommendedValue: NonNullable<NonNullable<Matrix2dValue['value']>[string]>[string];
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
        suggestionModeEnabled,
        recommendedValue,
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

    const orderedSubColumns = useMemo(() => {
        const filteredSubColumns = subColumns?.filter((sc) => {
            if (!suggestionModeEnabled) {
                return true;
            }
            const hasRecommendedValue = recommendedValue?.[columnId]?.includes(sc.key);
            return hasRecommendedValue;
        });
        return sortByOrder(filteredSubColumns);
    }, [
        suggestionModeEnabled,
        columnId,
        subColumns,
        recommendedValue,
    ]);

    const selectedValues = useMemo(() => {
        const optionsMap = listToMap(subColumns, (d) => d.key, (d) => d.label);
        return value?.[columnId]?.map((v) => optionsMap?.[v])?.join(', ');
    }, [subColumns, value, columnId]);

    const handleColumnNameClick = useCallback(() => {
        onSubColumnsChange(
            rowId,
            subRowId,
            columnId,
            value?.[columnId] ? undefined : [],
        );
    }, [
        rowId,
        subRowId,
        columnId,
        onSubColumnsChange,
        value,
    ]);

    return (
        <div className={styles.column}>
            <div className={styles.columnDetails}>
                <div className={styles.columnTitle}>
                    <div className={styles.subrowLabel}>
                        {subRowLabel}
                    </div>
                    <IoChevronForward className={styles.separatorIcon} />
                    <div className={styles.columnLabel}>
                        {(!readOnly && suggestionModeEnabled) ? (
                            <Button
                                name={undefined}
                                onClick={handleColumnNameClick}
                                className={styles.smallButton}
                                spacing="compact"
                                variant={value?.[columnId] ? 'nlp-primary' : 'nlp-tertiary'}
                            >
                                {column.label}
                            </Button>
                        ) : (
                            column.label
                        )}
                    </div>
                </div>
                {readOnly && (
                    <div className={styles.selectedValues}>
                        {selectedValues}
                    </div>
                )}
                {!readOnly && !suggestionModeEnabled && (
                    <MultiSelectInput
                        name={column.key}
                        value={value?.[column.key]}
                        disabled={disabled}
                        labelSelector={subColumnLabelSelector}
                        onChange={handleSubColumnValueChange}
                        options={orderedSubColumns}
                        keySelector={subColumnKeySelector}
                    />
                )}
                {(!readOnly
                    && suggestionModeEnabled
                    && orderedSubColumns
                    && orderedSubColumns.length > 0
                ) && (
                    <MultiBadgeInput
                        name={column.key}
                        onChange={handleSubColumnValueChange}
                        options={orderedSubColumns}
                        labelSelector={subColumnLabelSelector}
                        keySelector={subColumnKeySelector}
                        value={value?.[column.key]}
                        disabled={disabled || readOnly}
                        selectedButtonVariant="nlp-primary"
                        buttonVariant="nlp-tertiary"
                    />
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
    recommendedValue: NonNullable<NonNullable<Matrix2dValue['value']>[string]>[string];
    columns: ColumnType[] | undefined;
    suggestionModeEnabled?: boolean;
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
        suggestionModeEnabled,
        recommendedValue,
    } = props;

    const {
        label,
        key: subRowId,
    } = subRow;

    const orderedColumns = useMemo(() => {
        const filteredSubRows = columns?.filter((col) => {
            const hasValue = value?.[col.key];
            const hasRecommendedValue = recommendedValue?.[col.key];
            return hasValue || hasRecommendedValue;
        });
        return sortByOrder(filteredSubRows);
    }, [
        columns,
        value,
        recommendedValue,
    ]);

    const columnRendererParams = useCallback((_: string, column: ColumnType) => ({
        subRowLabel: label,
        column,
        readOnly,
        value,
        recommendedValue,
        disabled,
        rowId,
        subRowId,
        onSubColumnsChange,
        suggestionModeEnabled,
    }), [
        readOnly,
        suggestionModeEnabled,
        subRowId,
        recommendedValue,
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
    recommendedValue: NonNullable<Matrix2dValue['value']>[string];
    onSubColumnsChange: (
        rowId: string,
        subRowId: string,
        columnId: string,
        selected: string[] | undefined,
    ) => void;
    suggestionModeEnabled?: boolean;
}

function Row(props: RowProps) {
    const {
        row,
        onSubColumnsChange,
        disabled,
        readOnly,
        value,
        columns,
        suggestionModeEnabled,
        recommendedValue,
    } = props;

    const {
        key,
        label,
        tooltip,
        subRows,
    } = row;

    const orderedSubRows = useMemo(() => {
        const filteredSubRows = subRows?.filter((sr) => {
            const hasValue = value?.[sr.key];
            const hasRecommendedValue = recommendedValue?.[sr.key];
            return hasValue || hasRecommendedValue;
        });
        return sortByOrder(filteredSubRows);
    }, [
        subRows,
        value,
        recommendedValue,
    ]);

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
            recommendedValue: recommendedValue?.[subRow.key],
            subRow,
            rowId: key,
            columns,
            suggestionModeEnabled,
        }),
        [
            recommendedValue,
            disabled,
            onSubColumnsChange,
            readOnly,
            value,
            key,
            columns,
            suggestionModeEnabled,
        ],
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

    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;

    widget: PartialMatrix2dWidget;
    suggestionModeEnabled?: boolean;
    recommendedValue: Matrix2dValue | null | undefined,
}

function Matrix2dWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        widget,
        name,
        title,
        value,
        onChange: onChangeFromProps,
        disabled,
        readOnly,
        actions,
        icons,
        error: riskyError,
        suggestionModeEnabled,
        recommendedValue,
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
            recommendedValue: recommendedValue?.value?.[key],
            row,
            columns,
            onSubColumnsChange: handleSubColumnsChange,
            suggestionModeEnabled,
        }),
        [
            recommendedValue,
            disabled,
            readOnly,
            handleSubColumnsChange,
            value,
            columns,
            suggestionModeEnabled,
        ],
    );

    const widgetRows = widget?.properties?.rows;

    const orderedRows = useMemo(() => {
        const filteredRows = widgetRows?.filter((wr) => {
            const hasValue = value?.value?.[wr.key];
            const hasRecommendedValue = recommendedValue?.value?.[wr.key];

            return hasValue || hasRecommendedValue;
        });
        return sortByOrder(filteredRows);
    }, [
        widgetRows,
        value,
        recommendedValue,
    ]);

    return (
        <WidgetWrapper
            className={_cs(className, styles.matrix)}
            error={error}
            title={title}
            disabled={disabled}
            readOnly={readOnly}
            actions={actions}
            icons={icons}
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
                emptyMessage="-"
                messageShown
                pending={false}
                filtered={false}
                errored={false}
            />
        </WidgetWrapper>
    );
}

export default Matrix2dWidgetInput;
