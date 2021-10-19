import {
    isObject,
    mapToMap,
    isDefined,
} from '@togglecorp/fujs';

// eslint-disable-next-line import/prefer-default-export
export function removeEmptyObject(value) {
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
