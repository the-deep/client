import {
    isDefined,
    listToMap,
    compareNumber,
} from '@togglecorp/fujs';

import { mergeItems } from './common';

// FIXME: Add tests
export function getDateSafe(value: Date | number | string) {
    if (typeof value === 'string') {
        return new Date(`${value}T00:00`);
    }

    return new Date(value);
}

export function resolveTime(date: Date | number | string, resolution: 'day' | 'month' | 'year'): Date {
    const newDate = getDateSafe(date);

    if (resolution === 'day' || resolution === 'month' || resolution === 'year') {
        newDate.setUTCHours(12, 0, 0, 0);
    }
    if (resolution === 'month' || resolution === 'year') {
        newDate.setDate(1);
    }
    if (resolution === 'year') {
        newDate.setMonth(0);
    }
    return newDate;
}

export function getTimestamps(
    startDate: Date | number | string,
    endDate: Date | number | string,
    resolution: 'day' | 'month' | 'year',
) {
    const sanitizedStartDate = resolveTime(startDate, resolution);
    const sanitizedEndDate = resolveTime(endDate, resolution);

    const timestamps: number[] = [
        sanitizedStartDate.getTime(),
    ];

    let increment = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const myDate = new Date(sanitizedStartDate);
        // NOTE: We are doing this to avoid issues due to timezone
        myDate.setUTCHours(12, 0, 0, 0);
        if (resolution === 'year') {
            myDate.setFullYear(sanitizedStartDate.getFullYear() + increment);
        } else if (resolution === 'month') {
            myDate.setMonth(sanitizedStartDate.getMonth() + increment);
        } else {
            myDate.setDate(sanitizedStartDate.getDate() + increment);
        }
        // NOTE: We are doing this to avoid issues due to timezone
        myDate.setUTCHours(12, 0, 0, 0);

        if (myDate > sanitizedEndDate) {
            break;
        }
        timestamps.push(myDate.getTime());
        increment += 1;
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
    resolution: 'day' | 'month' | 'year',
    startDate?: string,
    endDate?: string,
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

    if (!timeseriesData || timeseriesData.length <= 0) {
        return [];
    }

    const mapping = listToMap(
        timeseriesData,
        (item) => {
            const newDate = new Date(item.date);
            newDate.setUTCHours(12, 0, 0, 0);
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
