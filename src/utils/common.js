import {
    padStart,
    isDefined,
    isNotDefined,
    isObject,
    isList,
    isFalsyString,
} from '@togglecorp/fujs';
import {
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';

export const mapObjectToObject = (obj, fn) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        newObj[key] = fn(obj[key], key);
    });
    return newObj;
};

export const mapObjectToArray = (obj, fn) => {
    const newArray = [];
    Object.keys(obj).forEach((key) => {
        const value = fn(obj[key], key);
        newArray.push(value);
    });
    return newArray;
};


export const pick = (obj, keys) => keys.reduce(
    (acc, key) => ({ ...acc, [key]: obj[key] }),
    {},
);

const reOne = /([a-z])([A-Z])/g;
const reTwo = /([A-Z])([A-Z])([a-z])/g;
export const camelToNormalCase = (text) => {
    const firstPhase = text.replace(reOne, '$1 $2');
    const secondPhase = firstPhase.replace(reTwo, '$1 $2$3');
    return secondPhase;
};

const decodeTimeInMinutes = (value, separator = ':') => {
    if (!value) {
        return 0;
    }
    const values = value.split(separator);
    return ((+values[0] * 60) + values[1]);
};

export const compareTime = (a, b) => (
    decodeTimeInMinutes(a) - decodeTimeInMinutes(b)
);

export const timeFrom = (date) => {
    const cDate = date instanceof Date ? date : new Date(date);

    const seconds = Math.floor((new Date() - cDate) / 1000);

    const intervals = [
        {
            span: 'year',
            duration: 31536000,
        },
        {
            span: 'month',
            duration: 2592000,
        },
        {
            span: 'day',
            duration: 86400,
        },
        {
            span: 'hour',
            duration: 3600,
        },
        {
            span: 'minute',
            duration: 60,
        },
    ];

    for (let i = 0, len = intervals.length; i < len; i += 1) {
        const interval = intervals[i];
        const fromNow = Math.floor(seconds / interval.duration);
        if (fromNow > 0) {
            return `${fromNow} ${interval.span}${fromNow > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
};

export const getDateWithTimezone = (date) => {
    const newDate = new Date();
    const timezoneOffset = newDate.getTimezoneOffset();
    const reverseSign = timezoneOffset < 0 ? '+' : '-';

    const hours = Math.floor(Math.abs(timezoneOffset) / 60);
    const minutes = Math.abs(timezoneOffset) % 60;

    const timezoneOffsetString = `${reverseSign}${padStart(hours, 2)}${padStart(minutes, 2)}`;

    return `${date}${timezoneOffsetString}`;
};

export const forEach = (obj, func) => {
    Object.keys(obj).forEach((key) => {
        const val = obj[key];
        func(key, val);
    });
};

export const sanitizeResponse = (data) => {
    if (data === null || data === undefined) {
        return undefined;
    }
    if (isList(data)) {
        return data.map(sanitizeResponse).filter(isDefined);
    }
    if (isObject(data)) {
        let newData = {};
        forEach(data, (k, val) => {
            const newEntry = sanitizeResponse(val);
            if (isDefined(newEntry)) {
                newData = {
                    ...newData,
                    [k]: newEntry,
                };
            }
        });
        return newData;
    }
    return data;
};

export const getArrayMoveDetails = (oldArray = [], newArray = [], keySelector = d => d) => {
    let movedData;
    let afterData;
    let top = false;

    oldArray.some((q, index) => {
        if (keySelector(q) !== keySelector(newArray[index])) {
            if (keySelector(q) === keySelector(newArray[index + 1])) {
                movedData = keySelector(newArray[index]);
                if (newArray[index - 1]) {
                    afterData = keySelector(newArray[index - 1]);
                } else {
                    top = true;
                }
            } else {
                const mvqIndex = newArray.findIndex(
                    nq => keySelector(nq) === keySelector(q),
                );
                movedData = keySelector(q);
                afterData = keySelector(newArray[mvqIndex - 1]);
                if (newArray[mvqIndex - 1]) {
                    afterData = keySelector(newArray[mvqIndex - 1]);
                } else {
                    top = true;
                }
            }
            return true;
        }
        return false;
    });

    return ({
        movedData,
        afterData,
        top,
    });
};

export function isUrlValid(url) {
    return (requiredCondition(url).ok && urlCondition(url).ok);
}

export function trimFileExtension(title) {
    return title.replace(/(\.\w{1,5})+$/, '');
}

export function getTitleFromUrl(url) {
    if (!isUrlValid(url)) {
        return undefined;
    }
    const match = url.match(/\/([^/?]+)(?:\?.*)?$/);
    if (isNotDefined(match)) {
        return undefined;
    }

    let title = match[1];
    title = trimFileExtension(title);
    title = title.replace(/_|-/g, ' ');

    return title;
}

export function capitalizeOnlyFirstLetter(string) {
    if (isFalsyString(string)) {
        return string;
    }
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

