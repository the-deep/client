import React, { useCallback } from 'react';
import {
    TimeRangeInput,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { IoSwapHorizontal } from 'react-icons/io5';

import WidgetWrapper from '../WidgetWrapper';
import { TimeRangeValue } from '#types/newAnalyticalFramework';

import styles from './styles.css';

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
    } = props;

    const handleValueSwap = useCallback(
        () => {
            if (value) {
                onChange({ startTime: value.endTime, endTime: value.startTime }, name);
            }
        },
        [onChange, value, name],
    );

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
            childrenContainerClassName={styles.content}
        >
            <TimeRangeInput
                className={styles.input}
                name={name}
                onChange={onChange}
                value={value}
                readOnly={readOnly}
                disabled={disabled}
            />
            <QuickActionButton
                className={styles.button}
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
