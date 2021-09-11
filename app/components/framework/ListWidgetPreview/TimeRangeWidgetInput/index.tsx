import React, { useCallback } from 'react';
import {
    TimeRangeInput,
    TimeRangeOutput,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { IoSwapHorizontal } from 'react-icons/io5';

import ListWidgetWrapper from '../ListWidgetWrapper';
import { TimeRangeWidgetAttribute } from '#types/newEntry';

import styles from './styles.css';

type TimeRangeValue = NonNullable<TimeRangeWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: TimeRangeValue | null | undefined,
    onChange: (
        value: TimeRangeValue | undefined,
        name: N,
    ) => void,
    disabled?: boolean;
    readOnly?: boolean;
}

function TimeRangeWidgetInput<N extends string>(props: Props<N>) {
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
        (val: TimeRangeValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );
    const handleValueSwap = useCallback(
        () => {
            if (value?.value) {
                onChange(
                    {
                        startTime: value.value.endTime,
                        endTime: value.value.startTime,
                    },
                    name,
                );
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
            {readOnly ? (
                <TimeRangeOutput
                    startTime={value?.value?.startTime}
                    endTime={value?.value?.startTime}
                />
            ) : (
                <>
                    <TimeRangeInput
                        className={styles.input}
                        name={name}
                        onChange={onChange}
                        value={value?.value}
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
            )}
        </ListWidgetWrapper>
    );
}

export default TimeRangeWidgetInput;
