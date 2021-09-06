import React from 'react';
import {
    NumberInput,
    NumberOutput,
} from '@the-deep/deep-ui';

import ListWidgetWrapper from '../ListWidgetWrapper';
import { NumberValue } from '#types/newAnalyticalFramework';

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
        onChange,
        disabled,
        readOnly,
    } = props;

    return (
        <ListWidgetWrapper
            className={className}
            title={title}
            disabled={disabled}
            readOnly={readOnly}
        >
            {readOnly ? (
                <NumberOutput
                    value={value}
                />
            ) : (
                <NumberInput
                    name={name}
                    onChange={onChange}
                    value={value}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            )}
        </ListWidgetWrapper>
    );
}

export default NumberWidgetInput;
