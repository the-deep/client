import React from 'react';
import {
    DateInput,
} from '@the-deep/deep-ui';
import {
    useFormObject,
    SetValueArg,
    Error,
    PartialForm,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    randomString,
} from '@togglecorp/fujs';

import {
    DateRangeAfterCondition,
    DateRangeBeforeCondition,
    DateRangeIncludesCondition,
} from '#types/newAnalyticalFramework';

type PartialConditionType = PartialForm<
    DateRangeAfterCondition | DateRangeBeforeCondition | DateRangeIncludesCondition,
    'operator' | 'conjunctionOperator' | 'key' | 'order'
>;

interface TextContainsConditionInputProps {
    value: PartialConditionType;
    error: Error<PartialConditionType> | undefined;
    onChange: (value: SetValueArg<PartialConditionType>, index: number) => void;
    index: number;
}

const defaultConditionVal = (): PartialConditionType => ({
    key: `auto-${randomString()}`,
    order: -1,

    conjunctionOperator: 'AND',
    invert: false,
    operator: 'date-range-after',
});

function SimpleTextConditionInput(props: TextContainsConditionInputProps) {
    const {
        value,
        error: riskyError,
        onChange,
        index,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultConditionVal);

    const error = getErrorObject(riskyError);

    return (
        <DateInput
            name="value"
            value={value.value}
            onChange={onFieldChange}
            error={error?.value}
        />
    );
}

export default SimpleTextConditionInput;
