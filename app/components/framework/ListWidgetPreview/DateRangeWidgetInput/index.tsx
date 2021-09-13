import React, { useCallback } from 'react';
import {
    QuickActionButton,
    DateRangeInput,
    DateRangeOutput,
} from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { IoSwapHorizontal } from 'react-icons/io5';

import ListWidgetWrapper from '../ListWidgetWrapper';
import { DateRangeWidgetAttribute } from '#types/newEntry';

import styles from './styles.css';

type DateRangeValue = NonNullable<DateRangeWidgetAttribute['data']>;

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
        onChange: onChangeFromProps,
        disabled,
        readOnly,
    } = props;

    const onChange = useCallback(
        (val: DateRangeValue['value'] | undefined, inputName: N) => {
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
                        endDate: value.value.startDate,
                        startDate: value.value.endDate,
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
            {!readOnly ? (
                <>
                    <DateRangeInput
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
            ) : (
                <DateRangeOutput
                    className={styles.input}
                    startDate={value?.value?.startDate}
                    endDate={value?.value?.endDate}
                />
            )}
        </ListWidgetWrapper>
    );
}

export default DateRangeWidgetInput;
