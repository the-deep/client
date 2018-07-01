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
