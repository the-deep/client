import { mapToList } from '#rsu/common';

const getPillars = (widgetData = {}) => (
    widgetData.rows && widgetData.rows.map(r => ({
        key: r.key,
        title: r.title,
    }))
);

const getSubPillars = (widgetData = {}) => (
    widgetData.rows && widgetData.rows.map(r => ({
        key: r.key,
        value: r.title,
        nodes: r.cells,
    }))
);

const pillars = {
    title: 'Pillars',
    items: getPillars,
    keySelector: d => d.key,
    labelSelector: d => d.label,
};

const subPillars = {
    title: 'SubPillars',
    items: getSubPillars,
    keySelector: d => d.key,
    labelSelector: d => d.value,
};

export default mapToList({
    pillars,
    subPillars,
}, (condition, key) => ({ key, ...condition }));
