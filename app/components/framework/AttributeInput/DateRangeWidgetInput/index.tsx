import React, { useCallback } from 'react';
import {
    QuickActionButton,
    DateRangeInput,
} from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { IoSwapHorizontal } from 'react-icons/io5';
import { Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';

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
    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;
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

    const handleValueSwap = useCallback(
        () => {
            if (value?.value) {
                onChange(
                    {
                        endDate: value.value.startDate,
                        startDate: value.value.endDate,
                    },
                    name,
                );
            }
        },
        [onChange, value, name],
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
            actions={actions}
        >
            <NonFieldError
                error={error}
            />
            <DateRangeInput
                className={styles.input}
                name={name}
                onChange={onChange}
                value={value?.value}
                readOnly={readOnly}
                disabled={disabled}
                error={valueError}
                actions={value?.value && (
                    <QuickActionButton
                        name={undefined}
                        onClick={handleValueSwap}
                        title="Swap Values" // FIXME: use translations
                        variant="transparent"
                    >
                        <IoSwapHorizontal />
                    </QuickActionButton>
                )}
            />
        </WidgetWrapper>
    );
}

export default DateRangeWidgetInput;
