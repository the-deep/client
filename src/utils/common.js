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

    const intervals = {
        year: 31536000,
        month: 2592000,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    let span = 'just now';

    for (const key in intervals) { //eslint-disable-line
        const interval = Math.floor(seconds / intervals[key]);

        if (interval >= 1) {
            span = `${interval} ${key}${interval > 1 ? 's' : ''} ago`;
            break;
        }
    }

    return span;
};
