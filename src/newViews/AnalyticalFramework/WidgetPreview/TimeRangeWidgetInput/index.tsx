import React, { useCallback } from 'react';
import {
    TextInput,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { IoSwapHorizontal } from 'react-icons/io5';

import { NodeRef } from '#newComponents/ui/SortableList';

import WidgetWrapper from '../../Widget';
import { TimeRangeValue } from '../../types';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: TimeRangeValue | null | undefined,
    onChange: (
        value: TimeRangeValue | undefined,
        name: N,
    ) => void,
    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;

    nodeRef?: NodeRef;
    rootStyle?: React.CSSProperties;
}

function TimeRangeWidgetInput<N extends string>(props: Props<N>) {
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
        [onChange, value, name],
    );

    const handleFromChange = useCallback(
        (from: string | undefined) => {
            onChange({ to: value?.to, from }, name);
        },
        [onChange, value, name],
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
            <TextInput // TODO use TimeRangeInput when added to deep-ui
                name="from"
                label="From" // FIXME use translations
                onChange={handleFromChange}
                value={value?.from}
                readOnly={readOnly}
                disabled={disabled}
            />
            <TextInput // TODO use TimeRangeInput when added to deep-ui
                name="to"
                label="To" // FIXME use translations
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

export default TimeRangeWidgetInput;
