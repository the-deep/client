import React, { useCallback } from 'react';
import { DateInput } from '@the-deep/deep-ui';
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

    actions?: React.ReactNode,
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
        actions,
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
            actions={actions}
        >
            <DateInput
                name={name}
                onChange={onChange}
                value={value?.value}
                readOnly={readOnly}
                disabled={disabled}
            />
        </WidgetWrapper>
    );
}

export default DateWidgetInput;
