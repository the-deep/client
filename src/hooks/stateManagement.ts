import { useState, useCallback } from 'react';

// eslint-disable-next-line import/prefer-default-export
export function useModalState(initialValue: boolean): [
    boolean,
    () => void,
    () => void,
    React.Dispatch<React.SetStateAction<boolean>>,
] {
    const [visible, setVisibility] = useState(initialValue);
    const setVisible = useCallback(
        () => {
            setVisibility(true);
        },
        [],
    );
    const setHidden = useCallback(
        () => {
            setVisibility(false);
        },
        [],
    );

    return [visible, setVisible, setHidden, setVisibility];
}

function isCallable<T>(val: T | ((oldVal: T) => T)): val is (oldVal: T) => T {
    return typeof val === 'function';
}

export function useArrayEdit<T, K extends string | number>(
    setValues: React.Dispatch<React.SetStateAction<T[] | undefined>>,
    keySelector: (value: T) => K,
): [
    (item: T) => void,
    (key: K) => void,
    (key: K, item: T) => void,
    (items: T[]) => void,
] {
    const addItem = useCallback((newItem: T) => {
        setValues((oldValues = []) => ([
            ...oldValues,
            newItem,
        ]));
    }, [setValues]);

    const removeItem = useCallback((key: K) => {
        setValues((oldValues = []) => {
            const index = oldValues.findIndex(item => keySelector(item) === key);
            if (index === -1) {
                return oldValues;
            }
            const newValues = [...oldValues];
            newValues.splice(index, 1);
            return newValues;
        });
    }, [setValues, keySelector]);

    const modifyItem = useCallback((modifiedItemKey: K, modifiedItem: (T | ((oldVal: T) => T))) => {
        setValues((oldValues = []) => {
            const index = oldValues.findIndex(item => keySelector(item) === modifiedItemKey);
            if (index === -1) {
                return oldValues;
            }
            const finalModifiedItem = isCallable(modifiedItem)
                ? modifiedItem(oldValues[index]) : modifiedItem;

            const newValues = [...oldValues];
            newValues.splice(index, 1, finalModifiedItem);
            return newValues;
        });
    }, [setValues, keySelector]);

    const mergeItems = useCallback((modifiedItems: T[]) => {
        setValues((oldValues = []) => {
            const newValues = [...oldValues];
            modifiedItems.forEach((modifiedItem) => {
                const modifiedItemKey = keySelector(modifiedItem);
                const index = oldValues.findIndex(item => keySelector(item) === modifiedItemKey);
                if (index === -1) {
                    return;
                }

                const finalModifiedItem = {
                    ...oldValues[index],
                    ...modifiedItem,
                };

                newValues.splice(index, 1, finalModifiedItem);
            });
            return newValues;
        });
    }, [setValues, keySelector]);
    return [addItem, removeItem, modifyItem, mergeItems];
}

export function useInputValue(initialValue: string | undefined): [
    string | undefined,
    (v: string | undefined, n: string | undefined, e: React.FormEvent<HTMLTextAreaElement>) => void
] {
    const [value, setValue] = useState<string | undefined>(initialValue);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const setInputValue = useCallback((newValue: string | undefined, name, e) => {
        setValue(newValue);
    }, [setValue]);

    return [value, setInputValue];
}
