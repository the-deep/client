import React, { useCallback } from 'react';
import { TimeInput, TimeOutput } from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { Error, getErrorObject } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import WidgetWrapper from '../WidgetWrapper';
import { TimeWidgetAttribute } from '#types/newEntry';

type TimeValue = NonNullable<TimeWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: TimeValue | null | undefined,
    onChange: (value: TimeValue | undefined, name: N) => void,
    error: Error<TimeValue> | undefined;

    disabled?: boolean;
    readOnly?: boolean;
}

function TimeWidgetInput<N extends string>(props: Props<N>) {
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
        (val: TimeValue['value'] | undefined, inputName: N) => {
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
        >
            {readOnly ? (
                <TimeOutput
                    value={value?.value}
                />
            ) : (
                <>
                    <NonFieldError
                        error={error}
                    />
                    <TimeInput
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

export default TimeWidgetInput;
