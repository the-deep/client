import { mapToList } from '#rsu/common';

const getScaleOptions = ({ scaleUnits = [] } = {}) => (
    scaleUnits.map(s => ({
        key: s.key,
        title: s.label,
    }))
);

const options = {
    title: 'Options',
    items: getScaleOptions,
    keySelector: d => d.key,
    labelSelector: d => d.title,
};

export default mapToList({
    options,
}, (condition, key) => ({ key, ...condition }));
