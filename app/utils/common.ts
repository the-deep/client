import { memo } from 'react';

import {
    isDefined,
    isNotDefined,
    compareNumber,
    isTruthyString,
    padStart,
} from '@togglecorp/fujs';

export const genericMemo: (<T>(c: T) => T) = memo;

export function sortByOrder<T extends { order: number }>(data: T[]): T[]
export function sortByOrder(data: undefined): undefined
export function sortByOrder<T extends { order: number }>(data: T[] | undefined): T[] | undefined
export function sortByOrder<T extends { order: number }>(data: T[] | undefined) {
    if (!data) {
        return undefined;
    }
    return [...data].sort((a, b) => compareNumber(a.order, b.order));
}

export function reorder<T extends { order: number }>(data: T[]) {
    return data.map((v, i) => ({ ...v, order: i }));
}

export function breadcrumb(...args: (string | undefined)[]) {
    return args.filter((arg) => isDefined(arg)).join(' › ');
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

export function calcPercent(value?: number, total?: number) {
    if (isNotDefined(value) || isNotDefined(total) || total === 0) {
        return undefined;
    }
    return (value / total) * 100;
}

export function currentHash() {
    return window.location.hash.substr(2);
}

export function isHttps(text?: string) {
    return text && text.startsWith('https:');
}

export const getDateWithTimezone = (date: string) => {
    const newDate = new Date();
    const timezoneOffset = newDate.getTimezoneOffset();
    const reverseSign = timezoneOffset < 0 ? '+' : '-';

    const hours = Math.floor(Math.abs(timezoneOffset) / 60);
    const minutes = Math.abs(timezoneOffset) % 60;

    const timezoneOffsetString = `${reverseSign}${padStart(hours, 2)}${padStart(minutes, 2)}`;

    return `${date}${timezoneOffsetString}`;
};

export function parseUrlParams(stringParams: string) {
    const params = decodeURIComponent(stringParams).split('&');
    let paramsJson = {};
    params.forEach((param) => {
        const split = param.split('=');
        paramsJson = {
            ...paramsJson,
            [split[0]]: split[1],
        };
    });
    return paramsJson;
}
