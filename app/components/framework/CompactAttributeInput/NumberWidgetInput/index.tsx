import React, { useCallback } from 'react';
import {
    NumberInput,
    NumberOutput,
} from '@the-deep/deep-ui';
import {
    isNotDefined,
} from '@togglecorp/fujs';
import { Error, getErrorObject } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { NumberWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

type NumberValue = NonNullable<NumberWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: NumberValue | null | undefined,
    error: Error<NumberValue> | undefined;
    onChange: (value: NumberValue | undefined, name: N) => void,

    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;
}

function NumberWidgetInput<N extends string>(props: Props<N>) {
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
        (val: NumberValue['value'] | undefined, inputName: N) => {
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
            readOnly={readOnly}
            actions={actions}
            icons={icons}
        >
            {readOnly ? (
                <NumberOutput
                    value={value?.value}
                />
            ) : (
                <>
                    <NonFieldError
                        error={error}
                    />
                    <NumberInput
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

export default NumberWidgetInput;
