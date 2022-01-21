import React, { useCallback } from 'react';
import { TimeInput } from '@the-deep/deep-ui';
import { Error, getErrorObject } from '@togglecorp/toggle-form';

import { TimeRangeWidgetAttribute, TimeWidgetAttribute } from '#types/newEntry';

type TimeValue = NonNullable<TimeWidgetAttribute['data']>;
type TimeRangeValue = NonNullable<TimeRangeWidgetAttribute['data']>['value'];
interface Props<N extends string> {
    className?: string;
    name: N;
    value: TimeRangeValue | null | undefined;
    error: Error<TimeRangeValue> | undefined;
    onChange: (value: TimeRangeValue | undefined, name: N) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

function TimeRangeInputWrapper<N extends string>(props: Props<N>) {
    const {
        className,
        name,
        value,
        error: riskyError,
        onChange,
        disabled,
        readOnly,
    } = props;

    const error = getErrorObject(riskyError);

    const handleStartTimeChange = useCallback((val: TimeValue['value'] | undefined) => {
        onChange({ startTime: val, endTime: value?.endTime }, name);
    }, [value, name, onChange]);

    const handleEndTimeChange = useCallback((val: TimeValue['value'] | undefined) => {
        onChange({ startTime: value?.startTime, endTime: val }, name);
    }, [value, name, onChange]);

    return (
        <div className={className}>
            <TimeInput
                name="startTime"
                onChange={handleStartTimeChange}
                value={value?.startTime}
                readOnly={readOnly}
                disabled={disabled}
                error={error?.startTime}
            />
            <TimeInput
                name="endTime"
                onChange={handleEndTimeChange}
                value={value?.endTime}
                readOnly={readOnly}
                disabled={disabled}
                error={error?.endTime}
            />
        </div>
    );
}

export default TimeRangeInputWrapper;
