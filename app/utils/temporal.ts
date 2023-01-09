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
        newDate.setUTCHours(0, 0, 0, 0);
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
    while (true) {
        const myDate = new Date(sanitizedStartDate);
        if (resolution === 'year') {
            myDate.setFullYear(sanitizedStartDate.getFullYear() + increment);
        } else if (resolution === 'month') {
            myDate.setMonth(sanitizedStartDate.getMonth() + increment);
        } else {
            myDate.setDate(sanitizedStartDate.getDate() + increment);
        }
        // NOTE: We are doing this to avoid issues due to timezone
        myDate.setUTCHours(0, 0, 0, 0);

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
