import React from 'react';
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

import {
    ScaleSelectedCondition,
    ScaleWidget,
    KeyLabelEntity,
} from '#types/newAnalyticalFramework';

type PartialConditionType = PartialForm<
    ScaleSelectedCondition,
    'operator' | 'conjunctionOperator' | 'key' | 'order'
>;

interface ScaleContainsConditionInputProps {
    value: PartialConditionType;
    error: Error<PartialConditionType> | undefined;
    onChange: (value: SetValueArg<PartialConditionType>, index: number) => void;
    index: number;
    parentWidget: ScaleWidget | undefined;
}

const defaultConditionVal = (): PartialConditionType => ({
    key: `auto-${randomString()}`,
    order: -1,

    conjunctionOperator: 'AND',
    invert: false,
    operator: 'scale-selected',
});

const optionKeySelector = (option: KeyLabelEntity) => option.key;
const optionLabelSelector = (option: KeyLabelEntity) => option.label;

function SimpleScaleConditionInput(props: ScaleContainsConditionInputProps) {
    const {
        value,
        error: riskyError,
        onChange,
        index,
        parentWidget,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultConditionVal);

    const error = getErrorObject(riskyError);

    const arrayError = getErrorString(error?.value);

    const options = parentWidget?.properties?.options;

    return (
        <MultiSelectInput
            name="value"
            value={value.value}
            onChange={onFieldChange}
            error={arrayError}
            options={options}
            keySelector={optionKeySelector}
            labelSelector={optionLabelSelector}
        />
    );
}

export default SimpleScaleConditionInput;
