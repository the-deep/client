import React, { useMemo } from 'react';
import {
    MultiSelectInput,
} from '@the-deep/deep-ui';
import {
    useFormObject,
    SetValueArg,
    Error,
    PartialForm,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';
import {
    randomString,
    isDefined,
} from '@togglecorp/fujs';

import EverySomeInput from '#components/EverySomeInput';
import {
    Matrix2dColumnsSelectedCondition,
    Matrix2dRowsSelectedCondition,
    Matrix2dSubColumnsSelectedCondition,
    Matrix2dSubRowsSelectedCondition,
    Matrix2dCellsSelectedCondition,
    Matrix2dWidget,
    KeyLabelEntity,
} from '#types/newAnalyticalFramework';

type PartialConditionType = PartialForm<
    // eslint-disable-next-line max-len
    Matrix2dColumnsSelectedCondition | Matrix2dRowsSelectedCondition | Matrix2dSubColumnsSelectedCondition | Matrix2dSubRowsSelectedCondition | Matrix2dCellsSelectedCondition,
    'operator' | 'conjunctionOperator' | 'key' | 'order'
>;

interface Matrix2dContainsConditionInputProps {
    value: PartialConditionType;
    error: Error<PartialConditionType> | undefined;
    onChange: (value: SetValueArg<PartialConditionType>, index: number) => void;
    index: number;
    parentWidget: Matrix2dWidget | undefined;
    operator: (Matrix2dColumnsSelectedCondition | Matrix2dRowsSelectedCondition | Matrix2dSubColumnsSelectedCondition | Matrix2dSubRowsSelectedCondition | Matrix2dCellsSelectedCondition)['operator'];
}

const defaultConditionVal = (): PartialConditionType => ({
    key: `auto-${randomString()}`,
    order: -1,

    conjunctionOperator: 'AND',
    invert: false,
    operator: 'matrix2d-rows-selected',
});

const optionKeySelector = (option: KeyLabelEntity) => option.key;
const optionLabelSelector = (option: KeyLabelEntity) => option.label;

function SimpleMatrix2dConditionInput(props: Matrix2dContainsConditionInputProps) {
    const {
        value,
        error: riskyError,
        onChange,
        index,
        parentWidget,
        operator,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultConditionVal);

    const error = getErrorObject<PartialConditionType>(riskyError);

    const arrayError = getErrorString(error?.value);

    const options = useMemo(
        () => {
            if (operator === 'matrix2d-rows-selected') {
                const rows = parentWidget?.properties?.rows;
                return rows?.map((row) => ({
                    key: row.key,
                    label: row.label,
                    tooltip: row.tooltip,
                    order: row.order,
                }));
            }
            if (operator === 'matrix2d-sub-rows-selected') {
                const rows = parentWidget?.properties?.rows;
                return rows?.flatMap((row) => row.subRows);
            }
            if (operator === 'matrix2d-columns-selected') {
                const columns = parentWidget?.properties?.columns;
                return columns?.map((column) => ({
                    key: column.key,
                    label: column.label,
                    tooltip: column.tooltip,
                    order: column.order,
                }));
            }
            if (operator === 'matrix2d-sub-columns-selected') {
                const columns = parentWidget?.properties?.columns;
                return columns?.flatMap((column) => column.subColumns);
            }
            const rows = parentWidget?.properties?.rows;
            const columns = parentWidget?.properties?.columns;

            const values = rows
                ?.flatMap((item) => item.subRows)
                .flatMap((subRow) => (
                    columns?.map((column) => ({
                        key: `${subRow.key}-${column.key}`,
                        label: `${subRow.label} / ${column.label}`,
                        tooltip: `${subRow.tooltip} / ${column.tooltip}`,
                        order: subRow.order + column.order,
                    }))
                )).filter(isDefined);
            return values;
        },
        [parentWidget, operator],
    );

    return (
        <>
            <EverySomeInput
                name="operatorModifier"
                value={value.operatorModifier}
                onChange={onFieldChange}
                error={error?.operatorModifier}
            />
            <MultiSelectInput
                name="value"
                value={value.value}
                onChange={onFieldChange}
                error={arrayError}
                options={options}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
            />
        </>
    );
}

export default SimpleMatrix2dConditionInput;
