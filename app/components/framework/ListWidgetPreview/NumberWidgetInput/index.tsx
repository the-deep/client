import React, { useCallback } from 'react';
import {
    NumberInput,
    NumberOutput,
} from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';

import ListWidgetWrapper from '../ListWidgetWrapper';
import { NumberWidgetAttribute } from '#types/newEntry';

type NumberValue = NonNullable<NumberWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: NumberValue | null | undefined,
    onChange: (value: NumberValue | undefined, name: N) => void,

    disabled?: boolean;
    readOnly?: boolean;
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
    } = props;

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
        <ListWidgetWrapper
            className={className}
            title={title}
            disabled={disabled}
            readOnly={readOnly}
        >
            {readOnly ? (
                <NumberOutput
                    value={value?.value}
                />
            ) : (
                <NumberInput
                    name={name}
                    onChange={onChange}
                    value={value?.value}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            )}
        </ListWidgetWrapper>
    );
}

export default NumberWidgetInput;
