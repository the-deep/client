import React, { useMemo, useCallback, useRef, useState } from 'react';
import {
    _cs,
    isTruthyString,
    isDefined,
} from '@togglecorp/fujs';

import DigitalInput from '#rsu/../v2/Input/DigitalInput';
import HintAndError from '#rsu/../v2/Input/HintAndError';
import Label from '#rsu/../v2/Input/Label';

import styles from './styles.scss';

interface Props {
    className?: string;
    value?: number;
    disabled?: boolean;
    readOnly?: boolean;
    onChange: (value: number | undefined) => void;

    title?: string;
    showHintAndError?: boolean;
    showLabel?: boolean;
    error?: string;
    hint?: string;
    label?: string;
    labelClassName?: string;
    labelRightComponent?: React.ReactNode;
    labelRightComponentClassName?: string;
}

function paddedMinute(value: number | undefined) {
    return isDefined(value) ? Math.floor(value / 60) : 0;
}

function paddedSecond(value: number | undefined) {
    return isDefined(value) ? Math.floor(value % 60) : 0;
}

const Input = (props: Props) => {
    const {
        className,
        disabled,
        value: valueMiti,
        readOnly,
        onChange,
        title,
        showHintAndError,
        showLabel,
        error,
        hint,
        label,
        labelClassName,
        labelRightComponent,
        labelRightComponentClassName,
    } = props;

    const timeoutRef = useRef<number>();

    const [
        tempMinSec,
        setTempMinSec,
    ] = useState<{ m?: string; s?: string } | undefined>(undefined);

    let minuteValue: string | undefined;
    if (tempMinSec) {
        minuteValue = tempMinSec.m;
    } else if (isDefined(valueMiti)) {
        minuteValue = String(paddedMinute(valueMiti));
    }

    let secondValue: string | undefined;
    if (tempMinSec) {
        secondValue = tempMinSec.s;
    } else if (isDefined(valueMiti)) {
        secondValue = String(paddedSecond(valueMiti));
    }

    const {
        value: finalMinSec,
        valid: finalMinSecIsValid,
    } = useMemo(
        () => {
            if (tempMinSec) {
                const second = isTruthyString(tempMinSec.s) ? +tempMinSec.s : 0;
                const minute = isTruthyString(tempMinSec.m) ? +tempMinSec.m : 0;
                if (second >= 60) {
                    return { valid: false, value: undefined };
                }
                return {
                    valid: true,
                    value: (60 * (minute)) + (second),
                };
            }
            return { valid: true, value: valueMiti };
        },
        [tempMinSec, valueMiti],
    );

    const handleFocus = useCallback(
        () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = undefined;
            }
            // console.warn('Focus in div');
        },
        [],
    );

    const handleBlur = useCallback(
        () => {
            const handleChange = () => {
                // console.warn('Focus out of div');

                if (finalMinSecIsValid && valueMiti !== finalMinSec) {
                    onChange(finalMinSec);
                }
                setTempMinSec(undefined);
            };

            // NOTE: this is a hack so that an immediate handle blur is not
            // called when switching focus between input elements inside this
            // current div
            timeoutRef.current = window.setTimeout(
                handleChange,
                0,
            );
        },
        [onChange, finalMinSec, finalMinSecIsValid, valueMiti],
    );

    const handleMinuteChange = useCallback(
        (newMinute: string | undefined) => {
            setTempMinSec((minSec) => {
                if (!minSec && isDefined(valueMiti)) {
                    return {
                        s: String(paddedSecond(valueMiti)),
                        m: newMinute,
                    };
                }
                return {
                    ...minSec,
                    m: newMinute,
                };
            });
        },
        [valueMiti],
    );

    const handleSecondChange = useCallback(
        (newSecond: string | undefined) => {
            setTempMinSec((minSec) => {
                if (!minSec && isDefined(valueMiti)) {
                    return {
                        m: String(paddedMinute(valueMiti)),
                        s: newSecond,
                    };
                }
                return {
                    ...minSec,
                    s: newSecond,
                };
            });
        },
        [valueMiti],
    );

    return (
        <div
            className={_cs(className, styles.minuteSecondInput)}
            title={title}
        >
            {showLabel && (
                <Label
                    className={_cs(styles.label, labelClassName)}
                    disabled={disabled}
                    error={!!error}
                    title={label}
                    rightComponent={labelRightComponent}
                    rightComponentClassName={labelRightComponentClassName}
                >
                    {label}
                </Label>
            )}
            <div
                className={_cs(
                    styles.inputContainer,
                    !finalMinSecIsValid && styles.invalid,
                )}
                onFocus={handleFocus}
                onBlur={handleBlur}
            >
                <DigitalInput
                    className={_cs(styles.input, styles.minute)}
                    value={minuteValue}
                    min={0}
                    onChange={handleMinuteChange}
                    placeholder="m"
                    disabled={disabled}
                    readOnly={readOnly}
                    padLength={4}
                />
                m
                <DigitalInput
                    className={styles.input}
                    value={secondValue}
                    min={0}
                    max={59}
                    onChange={handleSecondChange}
                    placeholder="s"
                    disabled={disabled}
                    readOnly={readOnly}
                    padLength={2}
                />
                s
            </div>
            {showHintAndError && (
                <HintAndError
                    error={error}
                    hint={hint}
                />
            )}
        </div>
    );
};
Input.defaultProps = {
    disabled: false,
    readOnly: false,
    showHintAndError: true,
    showLabel: true,
};

export default Input;
