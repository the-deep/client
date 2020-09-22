import React, { useState, useCallback } from 'react';

export function useArrayEdit<T, K extends string | number>(
    setValues: React.Dispatch<React.SetStateAction<T[]>>,
    keySelector: (value: T) => K,
): [
    (item: T) => void,
    (key: K) => void,
    (item: T) => void,
    (item: T) => void,
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
    const modifyItem = (modifiedItem: T) => {
        setValues((oldValues) => {
            const key = keySelector(modifiedItem);
            const index = oldValues.findIndex(item => keySelector(item) === key);
            if (index === -1) {
                return oldValues;
            }
            const newValues = [...oldValues];
            newValues.splice(index, 1, modifiedItem);
            return newValues;
        });
    };
    const patchItem = (modifiedItem: T) => {
        setValues((oldValues) => {
            const key = keySelector(modifiedItem);
            const index = oldValues.findIndex(item => keySelector(item) === key);
            if (index === -1) {
                return oldValues;
            }
            const newValues = [...oldValues];
            const mergedItem = {
                ...oldValues[index],
                ...modifiedItem,
            };
            newValues.splice(index, 1, mergedItem);
            return newValues;
        });
    };
    return [addItem, removeItem, modifyItem, patchItem];
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

