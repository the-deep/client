import React, { useCallback } from 'react';
import {
    QuickActionButton,
    DateRangeInput,
} from '@the-deep/deep-ui';
import { IoSwapHorizontal } from 'react-icons/io5';

import WidgetWrapper from '../../Widget';
import { DateRangeValue } from '#types/newAnalyticalFramework';

import styles from './styles.css';

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

    const handleValueSwap = useCallback(
        () => {
            if (value) {
                onChange({ endDate: value.startDate, startDate: value.endDate }, name);
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
            <DateRangeInput
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

export default DateRangeWidgetInput;
