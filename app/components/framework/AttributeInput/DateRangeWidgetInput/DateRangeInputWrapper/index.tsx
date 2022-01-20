import React, { useCallback, useState } from 'react';
import { DateInput } from '@the-deep/deep-ui';
import { Error, getErrorObject } from '@togglecorp/toggle-form';
import { isNotDefined } from '@togglecorp/fujs';

import { DateRangeWidgetAttribute, DateWidgetAttribute } from '#types/newEntry';

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

    const [tempDateRange, setTempDateRange] = useState<Partial<DateRangeValue>>({
        startDate: undefined,
        endDate: undefined,
    });

    const error = getErrorObject(riskyError);

    const handleStartDateChange = useCallback((val: DateValue['value'] | undefined) => {
        if (isNotDefined(val)) {
            setTempDateRange({});
            onChange(undefined, name);
        } else {
            setTempDateRange({ startDate: val });
            if (tempDateRange.endDate) {
                onChange({ startDate: val, endDate: tempDateRange.endDate }, name);
            }
        }
    }, [tempDateRange, name, onChange]);

    const handleEndDateChange = useCallback((val: DateValue['value'] | undefined) => {
        if (isNotDefined(val)) {
            setTempDateRange({});
            onChange(undefined, name);
        } else {
            setTempDateRange({ endDate: val });
            if (tempDateRange.startDate) {
                onChange({ startDate: tempDateRange.startDate, endDate: val }, name);
            }
        }
    }, [tempDateRange, name, onChange]);

    return (
        <div className={className}>
            <DateInput
                name="startDate"
                onChange={handleStartDateChange}
                value={value?.startDate}
                readOnly={readOnly}
                disabled={disabled}
                error={error?.startDate}
            />
            <DateInput
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
