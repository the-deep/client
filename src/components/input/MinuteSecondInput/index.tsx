import React, { useMemo, useCallback } from 'react';
import { FaramInputElement } from '@togglecorp/faram';

import NumberInput from '#rsci/NumberInput';
import HintAndError from '#rsci/HintAndError';

import styles from './styles.scss';

interface Props {
    value?: number;
    hint?: string;
    error?: string;
    showHintAndError?: boolean;
    onChange?: (value?: number) => void;
}

export function NormalMinuteSecondInput(props: Props) {
    const {
        value,
        onChange,
        hint,
        error,
        showHintAndError,
        ...otherProps
    } = props;

    const {
        minuteValue,
        secondValue,
    } = useMemo(() => ({
        minuteValue: value ? Math.floor(value / 60) : undefined,
        secondValue: value ? value % 60 : undefined,
    }), [value]);

    const handleMinuteOnChange = useCallback((newMinuteValue = 0) => {
        if (onChange && !newMinuteValue && !secondValue) {
            onChange(undefined);
        } else if (onChange) {
            onChange((newMinuteValue * 60) + (secondValue || 0));
        }
    }, [onChange, secondValue]);

    const handleSecondOnChange = useCallback((newSecondValue = 0) => {
        if (onChange && !newSecondValue && !minuteValue) {
            onChange(undefined);
        } else if (onChange) {
            onChange(((minuteValue || 0) * 60) + (newSecondValue % 60));
        }
    }, [onChange, minuteValue]);

    return (
        <div className={styles.minuteSecondInput}>
            <div className={styles.inputContainer}>
                <NumberInput
                    label="Minute"
                    value={minuteValue}
                    onChange={handleMinuteOnChange}
                    padLength={4}
                    showHintAndError={false}
                    {...otherProps}
                />
                <NumberInput
                    label="Seconds"
                    value={secondValue}
                    padLength={2}
                    onChange={handleSecondOnChange}
                    showHintAndError={false}
                    {...otherProps}
                />
            </div>
            <HintAndError
                show={showHintAndError}
                hint={hint}
                error={error}
            />
        </div>
    );
}

export default FaramInputElement(NormalMinuteSecondInput);
