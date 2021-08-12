import React from 'react';
import {
    DateInput,
    DateOutput,
} from '@the-deep/deep-ui';

import ListWidgetWrapper from '../../ListWidgetWrapper';
import { DateValue } from '#types/newAnalyticalFramework';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: DateValue | null | undefined,
    onChange: (value: DateValue | undefined, name: N) => void,

    disabled?: boolean;
    readOnly?: boolean;
}

function DateWidgetInput<N extends string>(props: Props<N>) {
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
        >
            {readOnly ? (
                <DateOutput
                    value={value}
                    format="dd, MMM yyyy"
                />
            ) : (
                <DateInput
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

export default DateWidgetInput;
