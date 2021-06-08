import React, { useCallback } from 'react';
import { DateInput } from '@the-deep/deep-ui';

import WidgetWrapper from '../../Widget';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: { to?: string, from?: string } | null | undefined,
    onChange: (value: { to?: string, from?: string } | undefined, name: N) => void,

    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;
}

function DateRangeWidgetInput<N extends string>(props: Props<N>) {
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

    const handleToChange = useCallback(
        (to: string | undefined) => {
            onChange({ to, from: value?.from }, name);
        },
        [onChange, name, value],
    );

    const handleFromChange = useCallback(
        (from: string | undefined) => {
            onChange({ to: value?.to, from }, name);
        },
        [onChange, name, value],
    );

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
        >
            <DateInput // FIXME: use DateRangeInput if possible and available
                name={name}
                onChange={handleToChange}
                value={value?.to}
                readOnly={readOnly}
                disabled={disabled}
            />
            <DateInput
                name={name}
                onChange={handleFromChange}
                value={value?.from}
                readOnly={readOnly}
                disabled={disabled}
            />
        </WidgetWrapper>
    );
}

export default DateRangeWidgetInput;
