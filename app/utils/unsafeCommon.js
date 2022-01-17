import {
    isObject,
    isList,
    isNotDefined,
    mapToMap,
    isDefined,
} from '@togglecorp/fujs';

export function removeEmptyObject(value) {
    if (isList(value)) {
        return value.map(removeEmptyObject);
    }

    if (!isObject(value)) {
        return value;
    }

    const newValue = mapToMap(
        value,
        (key) => key,
        (val) => removeEmptyObject(val),
    );
    const definedValues = Object.values(newValue).filter(isDefined);
    if (definedValues.length <= 0) {
        return undefined;
    }
    return newValue;
}

export function removeUndefinedKeys(value) {
    if (isList(value)) {
        return value.map(removeUndefinedKeys);
    }
    if (!isObject(value)) {
        return value;
    }
    const newValue = mapToMap(
        value,
        (key) => key,
        (val) => removeUndefinedKeys(val),
    );
    Object.entries(newValue)
        .filter(([, val]) => isNotDefined(val))
        .forEach(([key]) => {
            delete newValue[key];
        });
    return newValue;
}
