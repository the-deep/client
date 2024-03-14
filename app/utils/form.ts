import {
    isDefined,
    type Maybe,
} from '@togglecorp/fujs';

function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

// eslint-disable-next-line import/prefer-default-export
export function positiveNumberCondition(value: Maybe<number>) {
    // FIXME: use translations
    return isDefined(value) && (!isNumber(value) || value < 0)
        ? 'The field must be a positive number'
        : undefined;
}
