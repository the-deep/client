import React from 'react';
import {
    TimeInput,
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
    TimeRangeAfterCondition,
    TimeRangeBeforeCondition,
    TimeRangeIncludesCondition,
} from '#types/newAnalyticalFramework';

type PartialConditionType = PartialForm<
    TimeRangeAfterCondition | TimeRangeBeforeCondition | TimeRangeIncludesCondition,
    'operator' | 'conjunctionOperator' | 'key' | 'order'
>;

interface TextContainsConditionInputProps {
    value: PartialConditionType;
    error: Error<PartialConditionType> | undefined;
    onChange: (value: SetValueArg<PartialConditionType>, index: number) => void;
    index: number;
}

const defaultConditionVal = (): PartialConditionType => ({
    key: randomString(),
    order: -1,

    conjunctionOperator: 'AND',
    invert: false,
    operator: 'time-range-after',
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
        <>
            <TimeInput
                name="value"
                value={value.value}
                onChange={onFieldChange}
                error={error?.value}
            />
        </>
    );
}

export default SimpleTextConditionInput;
