import React, { useCallback, useState } from 'react';
import { TimeInput } from '@the-deep/deep-ui';
import { Error, getErrorObject } from '@togglecorp/toggle-form';
import { isNotDefined } from '@togglecorp/fujs';

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

    const [tempTimeRange, setTempTimeRange] = useState<Partial<TimeRangeValue>>({
        startTime: undefined,
        endTime: undefined,
    });

    const error = getErrorObject(riskyError);

    const handleStartTimeChange = useCallback((val: TimeValue['value'] | undefined) => {
        if (isNotDefined(val)) {
            setTempTimeRange({});
            onChange(undefined, name);
        } else {
            setTempTimeRange({ startTime: val });
            if (tempTimeRange.endTime) {
                onChange({ startTime: val, endTime: tempTimeRange.endTime }, name);
            }
        }
    }, [tempTimeRange, name, onChange]);

    const handleEndTimeChange = useCallback((val: TimeValue['value'] | undefined) => {
        if (isNotDefined(val)) {
            setTempTimeRange({});
            onChange(undefined, name);
        } else {
            setTempTimeRange({ endTime: val });
            if (tempTimeRange.startTime) {
                onChange({ startTime: tempTimeRange.startTime, endTime: val }, name);
            }
        }
    }, [tempTimeRange, name, onChange]);

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
