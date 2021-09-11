import React, { useCallback } from 'react';
import { TimeInput } from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';

import WidgetWrapper from '../WidgetWrapper';
import { TimeWidgetAttribute } from '#types/newEntry';

type TimeValue = NonNullable<TimeWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: TimeValue | null | undefined,
    onChange: (value: TimeValue | undefined, name: N) => void,

    actions?: React.ReactNode,
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
        actions,
    } = props;

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
            actions={actions}
        >
            <TimeInput
                name={name}
                onChange={onChange}
                value={value?.value}
                readOnly={readOnly}
                disabled={disabled}
            />
        </WidgetWrapper>
    );
}

export default TimeWidgetInput;
