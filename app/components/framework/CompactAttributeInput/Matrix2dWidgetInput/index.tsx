import React, { useMemo, useCallback } from 'react';
import { _cs, isNotDefined, listToMap } from '@togglecorp/fujs';
import {
    MultiSelectInput,
    MultiBadgeInput,
    ListView,
    List,
    Button,
    Modal,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { IoChevronForward, IoOpenOutline } from 'react-icons/io5';
import { PartialForm, Error, getErrorObject } from '@togglecorp/toggle-form';
import { useModalState } from '#hooks/stateManagement';
import { sortByOrder } from '#utils/common';

import NonFieldError from '#components/NonFieldError';
import { Matrix2dWidget } from '#types/newAnalyticalFramework';
import { Matrix2dWidgetAttribute } from '#types/newEntry';
import LargeMatrix2dWidgetInput from '#components/framework/AttributeInput/Matrix2dWidgetInput';

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
    suggestionMode?: boolean;
    recommendedValue?: NonNullable<NonNullable<Matrix2dValue['value']>[string]>[string];
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
        suggestionMode,
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
        const filteredSubColumns = subColumns?.filter((subColumn) => {
            if (!suggestionMode) {
                return true;
            }
            const hasRecommendedValue = recommendedValue?.[columnId]?.includes(subColumn.key);
            return hasRecommendedValue;
        });
        return sortByOrder(filteredSubColumns);
    }, [
        suggestionMode,
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
            <div
                className={_cs(
                    styles.columnDetails,
                    !readOnly && suggestionMode && styles.suggestionMode,
                )}
            >
                <div className={styles.columnTitle}>
                    <div className={styles.subrowLabel}>
                        {subRowLabel}
                    </div>
                    <IoChevronForward className={styles.separatorIcon} />
                    <div className={styles.columnLabel}>
                        {(!readOnly && suggestionMode) ? (
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
                {(!readOnly
                    && suggestionMode
                    && orderedSubColumns
                    && orderedSubColumns.length > 0
                ) && (
                    <div className={styles.subColumnSuggestions}>
                        <MultiBadgeInput
                            containerClassName={styles.badgesContainer}
                            listClassName={styles.badgesList}
                            name={column.key}
                            onChange={handleSubColumnValueChange}
                            options={orderedSubColumns}
                            labelSelector={subColumnLabelSelector}
                            keySelector={subColumnKeySelector}
                            value={value?.[column.key]}
                            disabled={disabled || readOnly}
                            selectedButtonVariant="nlp-primary"
                            buttonVariant="nlp-tertiary"
                            smallButtons
                        />
                    </div>
                )}
                {!readOnly && !suggestionMode && (
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
                {readOnly && (
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
    recommendedValue?: NonNullable<NonNullable<Matrix2dValue['value']>[string]>[string];
    columns: ColumnType[] | undefined;
    suggestionMode?: boolean;
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
        suggestionMode,
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
        suggestionMode,
    }), [
        readOnly,
        suggestionMode,
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
    recommendedValue?: NonNullable<Matrix2dValue['value']>[string];
    onSubColumnsChange: (
        rowId: string,
        subRowId: string,
        columnId: string,
        selected: string[] | undefined,
    ) => void;
    suggestionMode?: boolean;
}

function Row(props: RowProps) {
    const {
        row,
        onSubColumnsChange,
        disabled,
        readOnly,
        value,
        columns,
        suggestionMode,
        recommendedValue,
    } = props;

    const {
        key,
        label,
        tooltip,
        subRows,
    } = row;

    const orderedSubRows = useMemo(() => {
        const filteredSubRows = subRows?.filter((subRow) => {
            const hasValue = value?.[subRow.key];
            const hasRecommendedValue = recommendedValue?.[subRow.key];
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
            suggestionMode,
        }),
        [
            recommendedValue,
            disabled,
            onSubColumnsChange,
            readOnly,
            value,
            key,
            columns,
            suggestionMode,
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
    suggestionMode?: boolean;
    recommendedValue?: Matrix2dValue | null | undefined,
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
        suggestionMode,
        recommendedValue,
    } = props;

    const [
        isPopupVisible,
        showPopup,
        hidePopup,
    ] = useModalState(false);

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
            suggestionMode,
        }),
        [
            recommendedValue,
            disabled,
            readOnly,
            handleSubColumnsChange,
            value,
            columns,
            suggestionMode,
        ],
    );

    const widgetRows = widget?.properties?.rows;

    const orderedRows = useMemo(() => {
        const filteredRows = widgetRows?.filter((row) => {
            const hasValue = value?.value?.[row.key];
            const hasRecommendedValue = recommendedValue?.value?.[row.key];

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
            headingDescription={!readOnly && (
                <QuickActionButton
                    name={undefined}
                    className={styles.openPopupButton}
                    onClick={showPopup}
                    title="Edit in popup"
                >
                    <IoOpenOutline />
                </QuickActionButton>
            )}
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
            {isPopupVisible && (
                <Modal
                    onCloseButtonClick={hidePopup}
                    className={styles.modal}
                    heading={`Edit ${widget.title}`}
                    size="free"
                    freeHeight
                >
                    <LargeMatrix2dWidgetInput
                        className={className}
                        title=""
                        name={name}
                        onChange={onChangeFromProps}
                        value={value}
                        readOnly={readOnly}
                        disabled={disabled}
                        actions={actions}
                        icons={icons}
                        widget={widget}
                        error={riskyError}
                    />
                </Modal>
            )}
        </WidgetWrapper>
    );
}

export default Matrix2dWidgetInput;
