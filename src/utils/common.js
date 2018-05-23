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

export const prepareSettings = (semantics) => {
    const mapCharacterToSettingMap = {
        x: { name: 'requireLogin', value: false },
        l: { name: 'requireLogin', value: true },
        a: { name: 'requireAdminRights', value: true },
        p: { name: 'requireProject', value: true },
        d: { name: 'requireDevMode', value: true },
        A: { name: 'requireAssessmentTemplate', value: true },
        F: { name: 'requireAnalysisFramework', value: true },
        D: { name: 'disable', value: true },
    };
    const settings = {
        requireDevMode: false,
        requireLogin: false,
        requireAdminRights: false,
        requireAssessmentTemplate: false,
        disable: false,
    };
    semantics.split(',').forEach((character) => {
        const characterSetting = mapCharacterToSettingMap[character];
        if (characterSetting) {
            const { name, value } = characterSetting;
            settings[name] = value;
        }
    });
    return settings;
};
