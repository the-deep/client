import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    mapToList,
    listToMap,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    ListView,
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { PartialForm, Error, getErrorObject } from '@togglecorp/toggle-form';

import { sortByOrder } from '#utils/common';

import NonFieldError from '#components/NonFieldError';
import { Matrix1dWidget } from '#types/newAnalyticalFramework';
import { Matrix1dWidgetAttribute } from '#types/newEntry';

import WidgetWrapper from '../WidgetWrapper';

import styles from './styles.css';

type Matrix1dValue = NonNullable<Matrix1dWidgetAttribute['data']>;

export type PartialMatrix1dWidget = PartialForm<
    Matrix1dWidget,
    'key' | 'widgetId' | 'order' | 'conditional'
>;

type RowType = NonNullable<NonNullable<NonNullable<PartialMatrix1dWidget>['properties']>['rows']>[number];
type CellType = NonNullable<NonNullable<RowType>['cells']>[number];

const cellKeySelector = (c: CellType) => c.key;
const cellLabelSelector = (c: CellType) => c.label ?? '';

interface RowProps {
    disabled?: boolean;
    readOnly?: boolean;
    row: RowType;
    value: NonNullable<Matrix1dValue['value']>[string];
    onCellsChange: (cells: { [key: string]: boolean | undefined }, cellId: string) => void;
}

function Row(props: RowProps) {
    const {
        row,
        onCellsChange,
        disabled,
        readOnly,
        value,
    } = props;

    const {
        key,
        label,
        tooltip,
        cells,
    } = row;

    const transformedValue = useMemo(() => (
        // FIXME: Remove the cast below later on
        mapToList(value, (d, k) => (d ? k as string : undefined))?.filter(isDefined)
    ), [value]);

    const handleCellsChange = useCallback((newCells: string[]) => {
        onCellsChange(listToMap(newCells, (d) => d, () => true), key);
    }, [onCellsChange, key]);

    const sortedCells = useMemo(() => (
        sortByOrder(cells)
    ), [cells]);

    const selectedValues = useMemo(() => {
        const optionsMap = listToMap(sortedCells, (d) => d.key, (d) => d.label);
        return transformedValue?.map((v) => optionsMap?.[v])?.join(', ');
    }, [sortedCells, transformedValue]);

    return (
        <div className={styles.row}>
            <div
                className={styles.title}
                title={tooltip ?? ''}
            >
                {label ?? 'Unnamed'}
            </div>
            {!readOnly ? (
                <MultiSelectInput
                    name={row?.key}
                    onChange={handleCellsChange}
                    options={sortedCells}
                    labelSelector={cellLabelSelector}
                    keySelector={cellKeySelector}
                    value={transformedValue}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            ) : (
                <div className={styles.selectedValues}>
                    {selectedValues}
                </div>
            )}
        </div>
    );
}

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N;
    value: Matrix1dValue | null | undefined;
    onChange: (value: Matrix1dValue | undefined, name: N) => void;
    error: Error<Matrix1dValue> | undefined;

    actions?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialMatrix1dWidget;
}

function Matrix1dWidgetInput<N extends string>(props: Props<N>) {
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
        (val: Matrix1dValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );

    const widgetRows = widget?.properties?.rows;

    const filteredRows = useMemo(() => {
        const rows = widgetRows?.filter(
            (row) => {
                const rowValue = value?.value?.[row.key];
                return !!rowValue && Object.values(rowValue).some((d) => d);
            },
        );
        return sortByOrder(rows);
    }, [widgetRows, value]);

    const handleCellsChange = useCallback(
        (newCells: { [key: string]: boolean | undefined }, rowId: string) => {
            const newValue = {
                ...value?.value,
                [rowId]: newCells,
            };
            onChange(newValue, name);
        },
        [value, name, onChange],
    );

    const rowKeySelector = useCallback(
        (row: RowType) => row.key,
        [],
    );
    const rowRendererParams = useCallback(
        (key: string, row: RowType) => ({
            disabled,
            readOnly,
            value: value?.value?.[key],
            row,
            onCellsChange: handleCellsChange,
        }),
        [disabled, readOnly, handleCellsChange, value],
    );

    // FIXME: handle finer level errors

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
                data={filteredRows}
                className={styles.rowList}
                keySelector={rowKeySelector}
                rendererParams={rowRendererParams}
                renderer={Row}
                compactEmptyMessage
                filtered={false}
                pending={false}
            />
        </WidgetWrapper>
    );
}

export default Matrix1dWidgetInput;
