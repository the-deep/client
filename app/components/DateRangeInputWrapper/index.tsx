import React, { useCallback } from 'react';
import { DateInput } from '@the-deep/deep-ui';
import { Error, getErrorObject } from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';

import { DateRangeWidgetAttribute, DateWidgetAttribute } from '#types/newEntry';

import styles from './styles.css';

type DateValue = NonNullable<DateWidgetAttribute['data']>;
type DateRangeValue = NonNullable<DateRangeWidgetAttribute['data']>['value'];
interface Props<N extends string> {
    className?: string;
    name: N;
    value: DateRangeValue | null | undefined;
    error: Error<DateRangeValue> | undefined;
    onChange: (value: DateRangeValue | undefined, name: N) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

function DateRangeInputWrapper<N extends string>(props: Props<N>) {
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

    const handleStartDateChange = useCallback((val: DateValue['value'] | undefined) => {
        onChange({ startDate: val, endDate: value?.endDate }, name);
    }, [value, name, onChange]);

    const handleEndDateChange = useCallback((val: DateValue['value'] | undefined) => {
        onChange({ startDate: value?.startDate, endDate: val }, name);
    }, [value, name, onChange]);

    return (
        <div className={_cs(className, styles.dateInput)}>
            <NonFieldError error={error} />
            <DateInput
                className={styles.startInput}
                name="startDate"
                onChange={handleStartDateChange}
                value={value?.startDate}
                readOnly={readOnly}
                disabled={disabled}
                error={error?.startDate}
            />
            <span>
                to
            </span>
            <DateInput
                className={styles.endInput}
                name="endDate"
                onChange={handleEndDateChange}
                value={value?.endDate}
                readOnly={readOnly}
                disabled={disabled}
                error={error?.endDate}
            />
        </div>
    );
}

export default DateRangeInputWrapper;