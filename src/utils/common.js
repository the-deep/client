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
