/* eslint-disable @typescript-eslint/member-delimiter-style */
import React, { useMemo, useState, useCallback } from 'react';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

function useArraySelection<T, K extends string | number>(
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

export default useArraySelection;
