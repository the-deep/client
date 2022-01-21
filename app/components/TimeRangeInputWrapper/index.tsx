import React, { useCallback } from 'react';
import { TimeInput } from '@the-deep/deep-ui';
import { Error, getErrorObject } from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';

import { TimeRangeWidgetAttribute, TimeWidgetAttribute } from '#types/newEntry';

import styles from './styles.css';

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
        <div className={_cs(className, styles.timeInput)}>
            <NonFieldError error={error} />
            <TimeInput
                className={styles.startInput}
                name="startTime"
                onChange={handleStartTimeChange}
                value={value?.startTime}
                readOnly={readOnly}
                disabled={disabled}
                error={error?.startTime}
            />
            <span>
                to
            </span>
            <TimeInput
                className={styles.endInput}
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
