import React, { useCallback } from 'react';
import { DateRangeOutput } from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';

import DateRangeInputWrapper from '#components/DateRangeInputWrapper';
import NonFieldError from '#components/NonFieldError';
import WidgetWrapper from '../WidgetWrapper';
import { DateRangeWidgetAttribute } from '#types/newEntry';

import styles from './styles.css';

type DateRangeValue = NonNullable<DateRangeWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: DateRangeValue | null | undefined,
    error: Error<DateRangeValue> | undefined;
    onChange: (value: DateRangeValue | undefined, name: N) => void,
    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;
}

function DateRangeWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        name,
        value,
        onChange: onChangeFromProps,
        disabled,
        readOnly,
        actions,
        icons,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

    const onChange = useCallback(
        (val: DateRangeValue['value'] | undefined, inputName: N) => {
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
        ?? valueErrorObject?.startDate
        ?? valueErrorObject?.endDate;

    return (
        <WidgetWrapper
            className={className}
            title={title}
            childrenContainerClassName={styles.content}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
            actions={actions}
            icons={icons}
        >
            {!readOnly ? (
                <>
                    <NonFieldError
                        error={error}
                    />
                    <DateRangeInputWrapper
                        className={styles.input}
                        name={name}
                        onChange={onChange}
                        value={value?.value}
                        readOnly={readOnly}
                        disabled={disabled}
                        error={valueError}
                    />
                </>
            ) : (
                <DateRangeOutput
                    className={styles.input}
                    startDate={value?.value.startDate}
                    endDate={value?.value.endDate}
                />
            )}
        </WidgetWrapper>
    );
}

export default DateRangeWidgetInput;
