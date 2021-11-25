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
    Matrix1dCellsSelectedCondition,
    Matrix1dRowsSelectedCondition,
    Matrix1dWidget,
    KeyLabelEntity,
} from '#types/newAnalyticalFramework';

type PartialConditionType = PartialForm<
    Matrix1dCellsSelectedCondition | Matrix1dRowsSelectedCondition,
    'operator' | 'conjunctionOperator' | 'key' | 'order'
>;

interface Matrix1dContainsConditionInputProps {
    value: PartialConditionType;
    error: Error<PartialConditionType> | undefined;
    onChange: (value: SetValueArg<PartialConditionType>, index: number) => void;
    index: number;
    parentWidget: Matrix1dWidget | undefined;
    operator: (Matrix1dCellsSelectedCondition | Matrix1dRowsSelectedCondition)['operator'];
}

const defaultConditionVal = (): PartialConditionType => ({
    key: randomString(),
    order: -1,

    conjunctionOperator: 'AND',
    invert: false,
    operator: 'matrix1d-rows-selected',
});

const optionKeySelector = (option: KeyLabelEntity) => option.key;
const optionLabelSelector = (option: KeyLabelEntity) => option.label;

function SimpleMatrix1dConditionInput(props: Matrix1dContainsConditionInputProps) {
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
            const rows = parentWidget?.properties?.rows;
            if (operator === 'matrix1d-rows-selected') {
                return rows?.map((item) => ({
                    key: item.key,
                    label: item.label,
                    tooltip: item.tooltip,
                    order: item.order,
                }));
            }
            return rows?.flatMap((item) => item.cells).map((item) => item);
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

export default SimpleMatrix1dConditionInput;
