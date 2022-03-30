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
} from '@togglecorp/fujs';

import EverySomeInput from '#components/EverySomeInput';
import {
    Matrix2dColumnsSelectedCondition,
    Matrix2dRowsSelectedCondition,
    Matrix2dSubColumnsSelectedCondition,
    Matrix2dSubRowsSelectedCondition,
    Matrix2dWidget,
    KeyLabelEntity,
} from '#types/newAnalyticalFramework';

type PartialConditionType = PartialForm<
    // eslint-disable-next-line max-len
    Matrix2dColumnsSelectedCondition | Matrix2dRowsSelectedCondition | Matrix2dSubColumnsSelectedCondition | Matrix2dSubRowsSelectedCondition,
    'operator' | 'conjunctionOperator' | 'key' | 'order'
>;

interface Matrix2dContainsConditionInputProps {
    value: PartialConditionType;
    error: Error<PartialConditionType> | undefined;
    onChange: (value: SetValueArg<PartialConditionType>, index: number) => void;
    index: number;
    parentWidget: Matrix2dWidget | undefined;
    operator: (Matrix2dColumnsSelectedCondition | Matrix2dRowsSelectedCondition | Matrix2dSubColumnsSelectedCondition | Matrix2dSubRowsSelectedCondition)['operator'];
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
                return rows?.map((item) => ({
                    key: item.key,
                    label: item.label,
                    tooltip: item.tooltip,
                    order: item.order,
                }));
            }
            if (operator === 'matrix2d-sub-rows-selected') {
                const rows = parentWidget?.properties?.rows;
                return rows?.flatMap((item) => item.subRows).map((item) => item);
            }
            if (operator === 'matrix2d-columns-selected') {
                const columns = parentWidget?.properties?.columns;
                return columns?.map((item) => ({
                    key: item.key,
                    label: item.label,
                    tooltip: item.tooltip,
                    order: item.order,
                }));
            }
            const columns = parentWidget?.properties?.columns;
            return columns?.flatMap((item) => item.subColumns).map((item) => item);
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
