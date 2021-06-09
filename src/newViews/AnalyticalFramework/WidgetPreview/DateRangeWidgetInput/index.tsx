import React, { useCallback } from 'react';
import {
    QuickActionButton,
    DateInput,
} from '@the-deep/deep-ui';
import { IoSwapHorizontal } from 'react-icons/io5';

import WidgetWrapper from '../../Widget';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: { to: string | undefined, from: string | undefined } | null | undefined,
        onChange: (
            value: { to: string | undefined, from: string | undefined } | undefined,
            name: N,
        ) => void,
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

    const handleValueSwap = useCallback(
        () => {
            onChange({ to: value?.from, from: value?.to }, name);
        },
        [onChange, value, name],
    );

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
        >
            <DateInput // FIXME: use DateRangeInput if possible and available
                name="to"
                onChange={handleToChange}
                value={value?.to}
                readOnly={readOnly}
                disabled={disabled}
            />
            <DateInput
                name="from"
                onChange={handleFromChange}
                value={value?.from}
                readOnly={readOnly}
                disabled={disabled}
            />
            <QuickActionButton
                name={undefined}
                onClick={handleValueSwap}
                title="Swap Values" // FIXME: use translations
                variant="action"
            >
                <IoSwapHorizontal />
            </QuickActionButton>
        </WidgetWrapper>
    );
}

export default DateRangeWidgetInput;
