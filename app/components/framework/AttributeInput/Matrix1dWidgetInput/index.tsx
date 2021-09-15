import React, { useCallback, useMemo } from 'react';
import { Button, List } from '@the-deep/deep-ui';
import { PartialForm, Error, getErrorObject } from '@togglecorp/toggle-form';
import { isNotDefined } from '@togglecorp/fujs';

import { sortByOrder } from '#utils/common';

import NonFieldError from '#components/NonFieldError';
import { Matrix1dWidget } from '#types/newAnalyticalFramework';
import { Matrix1dWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

import styles from './styles.css';

type Matrix1dValue = NonNullable<Matrix1dWidgetAttribute['data']>;

export type PartialMatrix1dWidget = PartialForm<
    Matrix1dWidget,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type RowType = NonNullable<NonNullable<NonNullable<PartialMatrix1dWidget>['properties']>['rows']>[number];
type CellType = NonNullable<NonNullable<RowType>['cells']>[number];

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
            onCellChange(rowId, cellId, !selected);
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
    row: RowType;
    value: NonNullable<Matrix1dValue['value']>[string];
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

    const sortedCells = useMemo(() => (
        sortByOrder(cells)
    ), [cells]);

    const cellKeySelector = useCallback(
        (cell: CellType) => cell.clientId,
        [],
    );
    const cellRendererParams = useCallback(
        (_: string, cell: CellType) => ({
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
                    data={sortedCells}
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
        (val: Matrix1dValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );

    const sortedRows = useMemo(() => (
        sortByOrder(widget?.properties?.rows)
    ), [widget?.properties?.rows]);

    const handleCellChange = useCallback(
        (rowId: string, cellId: string, state: boolean) => {
            const newValue = {
                ...value?.value,
                [rowId]: {
                    ...value?.value?.[rowId],
                    [cellId]: state,
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
    const rowRendererParams = useCallback(
        (key: string, row: RowType) => ({
            disabled,
            readOnly,
            value: value?.value?.[key],
            row,
            onCellChange: handleCellChange,
        }),
        [disabled, readOnly, handleCellChange, value],
    );

    // FIXME: handle finer level errors

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
                data={sortedRows}
                keySelector={rowKeySelector}
                rendererParams={rowRendererParams}
                renderer={Row}
            />
        </WidgetWrapper>
    );
}

export default Matrix1dWidgetInput;
