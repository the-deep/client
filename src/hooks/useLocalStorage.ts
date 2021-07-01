import { useState, useEffect } from 'react';

export default function useStoredState<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>((): T => {
        const val = localStorage.getItem(key);
        return val === null || val === undefined
            ? defaultValue
            : JSON.parse(val) as T;
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem(key, JSON.stringify(value));
        }, 200);
        return () => {
            clearTimeout(timeout);
        };
    }, [key, value]);
    return [value, setValue] as const;
}
