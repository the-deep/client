import { mapToList } from '#rsu/common';

const getScaleOptions = (widgetData = {}) => (
    widgetData.scaleUnits.map(s => ({
        key: s.key,
        title: s.label,
    }))
);

const options = {
    title: 'Options',
    items: getScaleOptions,
};

export default mapToList({
    options,
}, (condition, key) => ({ key, ...condition }));
