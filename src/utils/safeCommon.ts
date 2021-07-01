import { memo } from 'react';

import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

export const genericMemo: (<T>(c: T) => T) = memo;

export function breadcrumb(...args: (string | undefined)[]) {
    return args.filter(arg => isDefined(arg)).join(' › ');
}

type MonthNameMap = {
    [key: number]: string;
}

export function isValidColor(value?: string) {
    const regex = /^#(?:[0-9A-F]{3}|[0-9A-F]{6})$/i;
    if (isTruthyString(value) && !regex.test(value)) {
        // FIXME: Use string
        return 'This must be a valid hex color.';
    }
    return undefined;
}

export const shortMonthNamesMap: MonthNameMap = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sept',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec',
};
