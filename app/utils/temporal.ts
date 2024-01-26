import {
    isDefined,
    listToMap,
    compareNumber,
} from '@togglecorp/fujs';

import { mergeItems } from './common';

export type Resolution = 'day' | 'week' | 'month' | 'year';
// FIXME: Add tests
export function getDateSafe(value: Date | number | string) {
    if (typeof value === 'string') {
        return new Date(`${value}T00:00:00.000`);
    }

    return new Date(value);
}

function getWeekForDate(value: Date | number | string) {
    const safeDate = getDateSafe(value);
    const startDateOfYear = new Date(safeDate.getFullYear(), 0, 1, 0, 0, 0, 0);
    const days = Math.floor(
        (safeDate.getTime() - startDateOfYear.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.floor(days / 7);
    const dateForWeek = startDateOfYear.getTime() + weekNumber * 24 * 60 * 60 * 1000 * 7;

    return dateForWeek;
}

export function resolveTime(
    date: Date | number | string,
    resolution: 'day' | 'month' | 'year' | 'week',
): Date {
    let newDate = getDateSafe(date);

    if (resolution === 'day') {
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
    }
    if (resolution === 'week') {
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        newDate = new Date(getWeekForDate(newDate));
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
    }

    if (resolution === 'month') {
        newDate.setDate(1);
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
    }
    if (resolution === 'year') {
        newDate.setMonth(0);
        newDate.setDate(1);
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
    }

    return newDate;
}

export function getTimestamps(
    startDate: Date | number | string,
    endDate: Date | number | string,
    resolution: 'day' | 'month' | 'year' | 'week',
) {
    const sanitizedStartDate = resolveTime(startDate, resolution);
    const sanitizedEndDate = resolveTime(endDate, resolution);

    const timestamps: number[] = [
        sanitizedStartDate.getTime(),
    ];

    const incrementCount = resolution === 'week' ? 7 : 1;
    let increment = incrementCount;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const myDate = new Date(sanitizedStartDate);
        if (resolution === 'year') {
            myDate.setFullYear(sanitizedStartDate.getFullYear() + increment);
        } else if (resolution === 'month') {
            myDate.setMonth(sanitizedStartDate.getMonth() + increment);
        } else {
            myDate.setDate(sanitizedStartDate.getDate() + increment);
        }
        myDate.setHours(0);
        myDate.setMinutes(0);
        myDate.setSeconds(0);
        myDate.setMilliseconds(0);

        if (myDate > sanitizedEndDate) {
            break;
        }

        timestamps.push(myDate.getTime());
        increment += incrementCount;
    }

    return timestamps;
}

export function formatDate(value: number | string) {
    const date = getDateSafe(value);
    return new Intl.DateTimeFormat(
        navigator.language,
        { year: 'numeric', month: 'short', day: 'numeric' },
    ).format(date);
}

export function formatMonth(value: number | string) {
    const date = getDateSafe(value);
    return new Intl.DateTimeFormat(
        navigator.language,
        { year: 'numeric', month: 'short' },
    ).format(date);
}

export function formatYear(value: number | string) {
    const date = getDateSafe(value);
    return new Intl.DateTimeFormat(
        navigator.language,
        { year: 'numeric' },
    ).format(date);
}

// FIXME: Write tests
export function getTimeseriesWithoutGaps(
    timeseries: {
        date: string;
        count: number;
    }[] | undefined,
    resolution: 'day' | 'month' | 'year' | 'week',
    startDate?: string | Date | number,
    endDate?: string | Date | number,
) {
    const values = (timeseries ?? [])
        .filter((item) => isDefined(item.date))
        .map((item) => ({
            date: resolveTime(item.date, resolution).getTime(),
            total: item.count,
        }))
        .filter((item) => item.total > 0);

    const timeseriesData = mergeItems(
        values,
        (item) => String(item.date),
        (foo, bar) => ({
            date: foo.date,
            total: foo.total + bar.total,
        }),
    ).sort((a, b) => compareNumber(a.date, b.date));

    if (!timeseriesData || timeseriesData.length < 0) {
        return [];
    }

    const mapping = listToMap(
        timeseriesData,
        (item) => {
            const newDate = new Date(item.date);
            newDate.setHours(0);
            newDate.setMinutes(0);
            newDate.setSeconds(0);
            newDate.setMilliseconds(0);
            return newDate.getTime();
        },
        (item) => item.total,
    );

    const timestamps = getTimestamps(
        startDate ?? timeseriesData[0].date,
        endDate ?? timeseriesData[timeseriesData.length - 1].date,
        resolution,
    );

    return timestamps.map((item) => ({
        total: mapping[item] ?? 0,
        date: item,
    }));
}
