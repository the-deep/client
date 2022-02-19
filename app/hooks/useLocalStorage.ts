import { useState, useEffect } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

export default function useLocalStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>((): T => {
        const val = localStorage.getItem(key);
        return val === null || val === undefined
            ? defaultValue
            : JSON.parse(val) as T;
    });

    useEffect(
        () => {
            const timeout = setTimeout(
                () => {
                    if (isNotDefined(value)) {
                        localStorage.removeItem(key);
                    } else {
                        localStorage.setItem(key, JSON.stringify(value));
                    }
                },
                200,
            );

            return () => {
                clearTimeout(timeout);
            };
        },
        [key, value],
    );

    return [value, setValue] as const;
}
