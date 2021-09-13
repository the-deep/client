import React, { useCallback } from 'react';
import {
    TimeInput,
    TimeOutput,
} from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';

import ListWidgetWrapper from '../ListWidgetWrapper';
import { TimeWidgetAttribute } from '#types/newEntry';

type TimeValue = NonNullable<TimeWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: TimeValue | null | undefined,
    onChange: (value: TimeValue | undefined, name: N) => void,

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
        <ListWidgetWrapper
            className={className}
            title={title}
            disabled={disabled}
            readOnly={readOnly}
        >
            {readOnly ? (
                <TimeOutput
                    value={value?.value}
                />
            ) : (
                <TimeInput
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

export default TimeWidgetInput;
