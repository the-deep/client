import React, { useCallback, useMemo } from 'react';
import {
    isDefined,
} from '@togglecorp/fujs';

import {
    DateRangeInput,
    DateRangeInputProps,
} from '@the-deep/deep-ui';

export interface Props<
    N extends string | number | undefined,
    M extends string | number | undefined,
> extends Omit<DateRangeInputProps<never>, 'value' | 'onChange' | 'name' | 'error'> {
    fromName: N;
    toName: M;
    fromValue: string | undefined | null;
    toValue: string | undefined | null;
    fromOnChange?: (value: string | undefined, name: N) => void;
    toOnChange?: (value: string | undefined, name: M) => void;
    fromError?: string | undefined | null;
    toError?: string | undefined | null;
}

function DateRangeDualInput<
    N extends string | number | undefined,
    M extends string | number | undefined,
>(props: Props<N, M>) {
    const {
        fromName,
        toName,
        fromValue,
        toValue,
        fromOnChange,
        toOnChange,
        fromError,
        toError,
        ...otherProps
    } = props;

    const value = useMemo(
        () => ((fromValue && toValue)
            ? ({ startDate: fromValue, endDate: toValue })
            : undefined
        ),
        [toValue, fromValue],
    );

    const handleValueChange = useCallback((
        newVal: {
            startDate: string,
            endDate: string,
        } | undefined,
    ) => {
        if (!newVal) {
            return;
        }
        if (fromOnChange) {
            fromOnChange(newVal.startDate, fromName);
        }
        if (toOnChange) {
            toOnChange(newVal.endDate, toName);
        }
    }, [
        toOnChange,
        fromOnChange,
        toName,
        fromName,
    ]);

    const error = useMemo(() => {
        const errors = [
            toError,
            fromError,
        ].filter(isDefined);
        return errors.length > 0 ? errors.join(', ') : undefined;
    }, [toError, fromError]);

    return (
        <DateRangeInput
            name={undefined}
            value={value}
            onChange={handleValueChange}
            error={error}
            {...otherProps}
        />
    );
}

export default DateRangeDualInput;
