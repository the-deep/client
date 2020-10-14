import React, { useMemo, useState, useCallback } from 'react';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

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

export function useArraySelection<T, K extends string | number>(
    keySelector: (value: T) => K,
    defaultValue: T[] = [],
): {
    values: T[],
    setValues: React.Dispatch<React.SetStateAction<T[]>>,
    isItemPresent: (itemKey: K) => void,
    addItems: (items: T[]) => void,
    removeItems: (items: T[]) => void,
    clickOnItem: (item: T) => void,
    clearSelection: () => void,
} {
    const [values, setValues] = useState(defaultValue);

    const clickOnItem = useCallback((clickedItem: T) => {
        setValues((oldValues) => {
            const index = oldValues.findIndex(
                item => keySelector(item) === keySelector(clickedItem),
            );
            if (index === -1) {
                return [
                    ...oldValues,
                    clickedItem,
                ];
            }
            const newValues = [...oldValues];
            newValues.splice(index, 1);
            return newValues;
        });
    }, [
        keySelector,
        setValues,
    ]);

    const clearSelection = useCallback(() => {
        setValues([]);
    }, [setValues]);

    const valuesMap = useMemo(() => (
        listToMap(values, keySelector, d => d)
    ), [
        values,
        keySelector,
    ]);

    const isItemPresent = useCallback((key: K) => (
        isDefined(valuesMap[key])
    ), [valuesMap]);

    const addItems = useCallback((itemsToAdd: T[]) => {
        setValues((oldValues) => {
            const oldValuesMap = listToMap(oldValues, keySelector, d => d);
            const newItemsToAdd = itemsToAdd.filter(
                item => isNotDefined(oldValuesMap[keySelector(item)]),
            );
            return ([
                ...oldValues,
                ...newItemsToAdd,
            ]);
        });
    }, [
        keySelector,
        setValues,
    ]);

    const removeItems = useCallback((itemsToRemove: T[]) => {
        setValues((oldValues) => {
            const itemsToRemoveMap = listToMap(itemsToRemove, keySelector, d => d);
            const newItems = oldValues.filter(
                item => isNotDefined(itemsToRemoveMap[keySelector(item)]),
            );
            return newItems;
        });
    }, [
        keySelector,
        setValues,
    ]);

    return ({
        values,
        setValues,
        isItemPresent,
        clickOnItem,
        clearSelection,
        removeItems,
        addItems,
    });
}

