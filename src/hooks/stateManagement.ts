import React, { useState, useCallback } from 'react';

function isCallable<T>(val: T | ((oldVal: T) => T)): val is (oldVal: T) => T {
    return typeof val === 'function';
}

export function useArrayEdit<T, K extends string | number>(
    setValues: React.Dispatch<React.SetStateAction<T[]>>,
    keySelector: (value: T) => K,
): [
    (item: T) => void,
    (key: K) => void,
    (key: K, item: T) => void,
] {
    const addItem = (newItem: T) => {
        setValues((oldValues: T[]) => ([
            ...oldValues,
            newItem,
        ]));
    };
    const removeItem = (key: K) => {
        setValues((oldValues) => {
            const index = oldValues.findIndex(item => keySelector(item) === key);
            if (index === -1) {
                return oldValues;
            }
            const newValues = [...oldValues];
            newValues.splice(index, 1);
            return newValues;
        });
    };
    const modifyItem = (modifiedItemKey: K, modifiedItem: (T | ((oldVal: T) => T))) => {
        setValues((oldValues) => {
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
    };
    return [addItem, removeItem, modifyItem];
}

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

