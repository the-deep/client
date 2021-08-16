import React from 'react';
import { TimeInput } from '@the-deep/deep-ui';

import WidgetWrapper from '../../WidgetWrapper';
import { TimeValue } from '#types/newAnalyticalFramework';

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
        onChange,
        disabled,
        readOnly,
        actions,
    } = props;

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
        >
            <TimeInput
                name={name}
                onChange={onChange}
                value={value}
                readOnly={readOnly}
                disabled={disabled}
            />
        </WidgetWrapper>
    );
}

export default TimeWidgetInput;
