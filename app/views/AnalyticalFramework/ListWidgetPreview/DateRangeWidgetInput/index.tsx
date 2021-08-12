import React, { useCallback } from 'react';
import {
    QuickActionButton,
    DateRangeInput,
    DateRangeOutput,
} from '@the-deep/deep-ui';
import { IoSwapHorizontal } from 'react-icons/io5';

import ListWidgetWrapper from '../../ListWidgetWrapper';
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
        <ListWidgetWrapper
            className={className}
            title={title}
            childrenContainerClassName={styles.content}
            disabled={disabled}
            readOnly={readOnly}
        >
            {!readOnly ? (
                <>
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
                </>
            ) : (
                <DateRangeOutput
                    className={styles.input}
                    startDate={value?.startDate}
                    endDate={value?.endDate}
                />
            )}
        </ListWidgetWrapper>
    );
}

export default DateRangeWidgetInput;
