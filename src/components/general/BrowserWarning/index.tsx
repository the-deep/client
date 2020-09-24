import React, { useEffect, useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import browserDetect from 'browser-detect';

import Button from '#rsca/Button';
import _ts from '#ts';

import styles from './styles.scss';

function isCallable<T>(val: T | (() => T)): val is () => T {
    return typeof val === 'function';
}

// TODO: To be moved inside hooks folder after unified connector is merged
function useStoredState<T>(key: string, defaultValue: T | (() => T)): [
    T,
    (v: T) => void,
] {
    const [value, setValue] = useState<T>((): T => {
        const val = localStorage.getItem(key);
        const finalValue = isCallable(defaultValue) ? defaultValue() : defaultValue;

        return val === null || val === undefined
            ? finalValue
            : JSON.parse(val) as T;
    });

    const setValueAndStore = useCallback(
        (v: T) => {
            setValue(v);
            localStorage.setItem(key, JSON.stringify(v));
        },
        [key],
    );

    return [value, setValueAndStore];
}

interface BrowerWarningProps {
    className?: string;
}

function BrowserWarning(props: BrowerWarningProps) {
    const { className } = props;
    const [showBrowserWarning, setShowBrowserWarning] = useStoredState<boolean>(
        'browserWarningDismissed',
        () => {
            const browser = browserDetect();
            return browser.name !== 'chrome';
        },
    );
    useEffect(() => {
        if (!showBrowserWarning) {
            return () => {};
        }
        document.body.classList.add('nagbar-shown');
        return () => {
            document.body.classList.remove('nagbar-shown');
        };
    }, [showBrowserWarning]);

    const closeNagbar = useCallback(() => {
        setShowBrowserWarning(false);
    }, [setShowBrowserWarning]);

    if (!showBrowserWarning) {
        return null;
    }

    return (
        <div className={_cs(className, styles.nagbar)}>
            <div className={styles.message}>
                {_ts(
                    'multiplexer',
                    'unsupportedBrowserMessage',
                    {
                        chromeUrl: (
                            <a href="https://www.google.com/chrome/">
                                {_ts('multiplexer', 'hereLabel')}
                            </a>
                        ),
                    },
                )}
            </div>
            <Button
                className={styles.nagbarDismissButton}
                onClick={closeNagbar}
                iconName="close"
                transparent
                type="button"
            />
        </div>
    );
}

export default BrowserWarning;
