import React, { useCallback } from 'react';
import {
    QuickActionButton,
    DateInput,
} from '@the-deep/deep-ui';
import { IoSwapHorizontal } from 'react-icons/io5';

import { NodeRef } from '#components/ui/SortableList';

import WidgetWrapper from '../../Widget';
import { DateRangeValue } from '../../types';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: DateRangeValue | null | undefined,
    onChange: (
        value: DateRangeValue | undefined,
        name: N,
    ) => void,
    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;

    nodeRef?: NodeRef;
    rootStyle?: React.CSSProperties;
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
        nodeRef,
        rootStyle,
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
            nodeRef={nodeRef}
            rootStyle={rootStyle}
        >
            <DateInput
                name="from"
                label="From" // FIXME: use translations
                onChange={handleFromChange}
                value={value?.from}
                readOnly={readOnly}
                disabled={disabled}
            />
            <DateInput // FIXME: use DateRangeInput if possible and available
                name="to"
                label="To" // FIXME: use translations
                onChange={handleToChange}
                value={value?.to}
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
