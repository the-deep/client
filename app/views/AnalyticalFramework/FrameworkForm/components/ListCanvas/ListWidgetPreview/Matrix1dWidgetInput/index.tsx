import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    mapToList,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';

import { sortByOrder } from '#utils/common';

import { Matrix1dValue, Matrix1dWidget } from '#types/newAnalyticalFramework';

import styles from './styles.css';

export type PartialMatrix1dWidget = PartialForm<
    Matrix1dWidget,
    'clientId' | 'widgetId' | 'order' | 'key'
>;

type RowType = NonNullable<NonNullable<NonNullable<PartialMatrix1dWidget>['properties']>['rows']>[number];
type Cell = NonNullable<NonNullable<RowType>['cells']>[number];

const cellKeySelector = (c: Cell) => c.clientId;
const cellLabelSelector = (c: Cell) => c.label ?? '';

interface RowProps {
    disabled?: boolean;
    readOnly?: boolean;
    row: RowType;
    value: NonNullable<Matrix1dValue>[string];
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

    const transformedValue = useMemo(() => (
        // FIXME: Remove the cast below later on
        mapToList(value, (d, k) => (d ? k as string : undefined))?.filter(isDefined)
    ), [value]);

    const {
        label,
        tooltip,
        cells,
        clientId,
    } = row;

    const handleCellsChange = useCallback((newCells: string[]) => {
        onCellsChange(listToMap(newCells, (d) => d, () => true), clientId);
    }, [onCellsChange, clientId]);

    const sortedCells = useMemo(() => (
        sortByOrder(cells)?.filter(isDefined)
    ), [cells]);

    const selectedValues = useMemo(() => {
        const optionsMap = listToMap(sortedCells, (d) => d.clientId, (d) => d.label);
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
                    name={row?.clientId}
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
        onChange,
        disabled,
        readOnly,
    } = props;

    const widgetRows = widget?.properties?.rows;

    const filteredRows = useMemo(() => {
        const rows = widgetRows?.filter(
            (row) => {
                const rowValue = value?.[row.clientId];
                return !!rowValue && Object.values(rowValue).some((d) => d);
            },
        );
        return sortByOrder(rows);
    }, [widgetRows, value]);

    const handleCellsChange = useCallback(
        (newCells: { [key: string]: boolean | undefined }, rowId: string) => {
            const newValue = {
                ...value,
                [rowId]: newCells,
            };
            onChange(newValue, name);
        },
        [value, name, onChange],
    );

    const rowKeySelector = useCallback(
        (row: RowType) => row.clientId,
        [],
    );
    const rowRendererParams = useCallback(
        (key: string, row: RowType) => ({
            disabled,
            readOnly,
            value: value?.[key],
            row,
            onCellsChange: handleCellsChange,
        }),
        [disabled, readOnly, handleCellsChange, value],
    );

    return (
        <ListView
            className={_cs(className, styles.matrix)}
            data={filteredRows}
            keySelector={rowKeySelector}
            rendererParams={rowRendererParams}
            renderer={Row}
        />
    );
}

export default Matrix1dWidgetInput;
