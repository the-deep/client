import React, { useCallback } from 'react';
import {
    DateInput,
    DateOutput,
} from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';

import WidgetWrapper from '../WidgetWrapper';
import { DateWidgetAttribute } from '#types/newEntry';

type DateValue = NonNullable<DateWidgetAttribute['data']>;

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
        onChange: onChangeFromProps,
        disabled,
        readOnly,
    } = props;

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
            disabled={disabled}
            readOnly={readOnly}
        >
            {readOnly ? (
                <DateOutput
                    value={value?.value}
                    format="dd, MMM yyyy"
                />
            ) : (
                <DateInput
                    name={name}
                    onChange={onChange}
                    value={value?.value}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            )}
        </WidgetWrapper>
    );
}

export default DateWidgetInput;
