import React, { useCallback } from 'react';
import { DateInput, DateOutput } from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { Error, getErrorObject } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import WidgetWrapper from '../WidgetWrapper';
import { DateWidgetAttribute } from '#types/newEntry';

type DateValue = NonNullable<DateWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: DateValue | null | undefined,
    onChange: (value: DateValue | undefined, name: N) => void,
    error: Error<DateValue> | undefined;

    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;
}

function DateWidgetInput<N extends string>(props: Props<N>) {
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
        (val: DateValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );

    return (
        <WidgetWrapper
            className={className}
            title={title}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
            actions={actions}
            icons={icons}
        >
            {readOnly ? (
                <DateOutput
                    value={value?.value}
                />
            ) : (
                <>
                    <NonFieldError
                        error={error}
                    />
                    <DateInput
                        name={name}
                        onChange={onChange}
                        value={value?.value}
                        readOnly={readOnly}
                        disabled={disabled}
                        error={error?.value}
                    />
                </>
            )}
        </WidgetWrapper>
    );
}

export default DateWidgetInput;
