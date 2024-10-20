import { memo, ReactElement } from 'react';

import {
    isDefined,
    isNotDefined,
    compareNumber,
    listToMap,
    isTruthyString,
    formatDateToString,
    doesObjectHaveNoData,
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

export function reorder<T extends { order?: number }>(data: T[]) {
    return data.map((v, i) => ({ ...v, order: i + 1 }));
}

// FIXME: Optimize reorder function by not editing the object is new
// order is equal to old order
export function reorderByKey<T>(
    data: T[],
    orderKey = 'order',
): T[] {
    return data.map((v, i) => ({ ...v, [orderKey]: i + 1 }));
}

export function breadcrumb(args: (string | undefined)[], symbol = ' » ') {
    return args.filter((arg) => isDefined(arg)).join(symbol);
}

type MonthNameMap = {
    [key: number]: string;
}

// FIXME: use better name
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

export function calcPercent(value: number | null | undefined, total: number | null | undefined) {
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

export const enumKeySelector = <T>(d: EnumEntity<T>) => (
    d.name
);

export const enumLabelSelector = <T extends string | number>(d: EnumEntity<T>) => (
    // FIXME: why are we doing this
    (d.description ?? String(d.name))
);

export type NewEnumEntity<E> = {
    enum: E;
    label: string;
    description?: string | undefined | null;
};

export function newEnumKeySelector<E>(d: NewEnumEntity<E>) {
    return d.enum;
}
export function newEnumLabelSelector<E>(d: NewEnumEntity<E>) {
    return d.label;
}

interface Options {
    endOfDay?: boolean;
}
export function convertDateToIsoDateTime(dateString: Date, opts?: Options): string
export function convertDateToIsoDateTime(dateString: string, opts?: Options): string
export function convertDateToIsoDateTime(dateString: null, opts?: Options): undefined
export function convertDateToIsoDateTime(dateString: undefined, opts?: Options): undefined
export function convertDateToIsoDateTime(
    dateString: string | undefined | null | Date,
    opts?: Options,
): string | undefined
export function convertDateToIsoDateTime(
    dateString: Date | string | undefined | null,
    opts?: Options,
) {
    if (!dateString) {
        return undefined;
    }
    const date = new Date(dateString);
    if (opts?.endOfDay) {
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
    } else {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
    }

    return date.toISOString();
}

export function flatten<A, K>(
    lst: A[],
    valueSelector: (item: A) => K,
    childSelector: (item: A) => A[] | undefined,
): K[] {
    if (lst.length <= 0) {
        return [];
    }
    const itemsByParent = lst.map(valueSelector);
    const itemsByChildren = lst.map(childSelector).filter(isDefined).flat();
    return [
        ...itemsByParent,
        ...flatten(itemsByChildren, valueSelector, childSelector),
    ];
}

export function generateFilename(title: string) {
    return `${formatDateToString(new Date(), 'yyyyMMdd')} DEEP ${title}`;
}

/*
export function flatten<A>(a: A[], childSelector: (item: A) => A[] | undefined): A[];
export function flatten<A>(a: A, childSelector: (item: A) => A[] | undefined): A;
export function flatten<A>(a: A[] | A, childSelector: (item: A) => A[] | undefined): A[] | A {
    if (Array.isArray(a)) {
        const t = a.map((v) => flatten(v, childSelector));
        return t;
    }
    const child = childSelector(a);
    if (Array.isArray(child)) {
        return [
            a,
            ...child.map((v) => flatten(v, childSelector)),
        ];
    }
    return a;
}
*/

export function isFiltered(value: unknown) {
    return !doesObjectHaveNoData(value, ['']);
}

export function getMaximum<T>(
    list: T[] | undefined,
    comparator: (item1: T, item2: T) => number,
): T | undefined {
    if (!list || list.length < 1) {
        return undefined;
    }
    return list.reduce((acc: T, item: T) => {
        if (!item) {
            return acc;
        }
        if (comparator(item, acc) > 0) {
            return item;
        }
        return acc;
    }, list[0]);
}

export function mergeLists<T>(
    oldList: T[],
    newList: T[],
    keySelector: (item: T) => string | number,
    mergeModifier: (prevItem: T, newItem: T) => T,
) {
    const newListMap = listToMap(newList, keySelector, (item) => item);

    const updatedList = oldList.map((oldItem) => (
        newListMap[keySelector(oldItem)] ? (
            mergeModifier(oldItem, newListMap[keySelector(oldItem)])
        ) : (
            oldItem
        )
    ));

    const oldListKeyMap = listToMap(
        oldList,
        keySelector,
        () => true,
    );

    const newListWithOldItemsRemoved = newList.filter((item) => !oldListKeyMap[keySelector(item)]);

    const finalList = [
        ...updatedList,
        ...newListWithOldItemsRemoved,
    ];

    return finalList;
}

// FIXME: Add tests
export function mergeItems<T, K extends string>(
    list: T[],
    keySelector: (item: T) => K,
    merge: (prev: T, item: T, key: K) => T,
): T[] {
    const mapping: {
        [key: string]: T | undefined;
    } = {};
    list.forEach((item) => {
        const key = keySelector(item);
        const prev = mapping[key];
        if (!prev) {
            mapping[key] = item;
        } else {
            mapping[key] = merge(prev, item, key);
        }
    });

    return Object.values(mapping).filter(isDefined);
}

export const DEEP_START_DATE = '2018-01-01';

const date = new Date();
const newDate = date.getDate() + 1;
date.setDate(newDate);
export const todaysDate = formatDateToString(date, 'yyyy-MM-dd');

const lastYearDate = new Date();
lastYearDate.setDate(lastYearDate.getDate() - 365);
export const lastYearStartDate = formatDateToString(lastYearDate, 'yyyy-MM-dd');

export function removeDomain(url: string) {
    return url.replace(/^.*\/\/[^/]+/, '');
}
