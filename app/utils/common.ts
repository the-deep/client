import { memo, ReactElement } from 'react';

import {
    isNaN,
    isObject,
    isList,
    isDefined,
    isNotDefined,
    compareNumber,
    isTruthyString,
    padStart,
} from '@togglecorp/fujs';

import { EnumEntity } from '../types';

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

export function joinList(
    list: ReactElement[],
    separator = ', ',
    finalSeparator = ' and ',
) {
    const ll = list.length;

    return list.map(
        (item, index) => {
            if (index === ll - 1) {
                return [item];
            }
            if (index === ll - 2) {
                return [item, finalSeparator];
            }

            return [
                item,
                separator,
            ];
        },
    ).flat();
}

export function hasNoData(obj: unknown): boolean {
    if (obj === undefined || obj === null || isNaN(obj)) {
        return true;
    }

    if (isList(obj)) {
        if (obj.length <= 0) {
            return true;
        }
        return obj.every((e) => hasNoData(e));
    }

    if (isObject(obj)) {
        if (Object.keys(obj).length <= 0) {
            return true;
        }
        return Object.values(obj).every(
            (value) => hasNoData(value),
        );
    }

    return false;
}

export const enumKeySelector = <T>(d: EnumEntity<T>) => (
    d.name
);

export const enumLabelSelector = <T extends string | number>(d: EnumEntity<T>) => (
    d.description ?? `${d.name}`
);
