import React from 'react';
import {
    SelectInput,
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
    ScaleAtLeastCondition,
    ScaleAtMostCondition,
    ScaleWidget,
    KeyLabelEntity,
} from '#types/newAnalyticalFramework';

type PartialConditionType = PartialForm<
    ScaleAtLeastCondition | ScaleAtMostCondition,
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
    key: randomString(),
    order: -1,

    conjunctionOperator: 'AND',
    invert: false,
    operator: 'scale-more-than',
});

const optionKeySelector = (option: KeyLabelEntity) => option.key;
const optionLabelSelector = (option: KeyLabelEntity) => option.label;

function ComparisonScaleConditionInput(props: ScaleContainsConditionInputProps) {
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
        <SelectInput
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

export default ComparisonScaleConditionInput;
