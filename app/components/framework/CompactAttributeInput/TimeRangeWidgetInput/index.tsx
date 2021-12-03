import React, { useCallback } from 'react';
import { TimeRangeInput, TimeRangeOutput } from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import WidgetWrapper from '../WidgetWrapper';
import { TimeRangeWidgetAttribute } from '#types/newEntry';

import styles from './styles.css';

type TimeRangeValue = NonNullable<TimeRangeWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: TimeRangeValue | null | undefined,
    error: Error<TimeRangeValue> | undefined;
    onChange: (
        value: TimeRangeValue | undefined,
        name: N,
    ) => void,
    disabled?: boolean;
    readOnly?: boolean;
}

function TimeRangeWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        name,
        value,
        onChange: onChangeFromProps,
        disabled,
        readOnly,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

    const onChange = useCallback(
        (val: TimeRangeValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );

    const valueErrorString = getErrorString(error?.value);
    const valueErrorObject = getErrorObject(error?.value);

    const valueError = valueErrorString
        ?? valueErrorObject?.startTime
        ?? valueErrorObject?.endTime;

    return (
        <WidgetWrapper
            className={className}
            title={title}
            childrenContainerClassName={styles.content}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
        >
            {readOnly ? (
                <TimeRangeOutput
                    startTime={value?.value?.startTime}
                    endTime={value?.value?.startTime}
                />
            ) : (
                <>
                    <NonFieldError
                        error={error}
                    />
                    <TimeRangeInput
                        className={styles.input}
                        name={name}
                        onChange={onChange}
                        value={value?.value}
                        readOnly={readOnly}
                        disabled={disabled}
                        error={valueError}
                    />
                </>
            )}
        </WidgetWrapper>
    );
}

export default TimeRangeWidgetInput;
