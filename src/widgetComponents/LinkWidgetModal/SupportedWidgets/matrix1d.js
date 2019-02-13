import { mapToList } from '@togglecorp/fujs';

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
    labelSelector: d => d.title,
};

const subPillars = {
    title: 'SubPillars',
    items: getSubPillars,
    keySelector: d => d.key,
    labelSelector: d => d.value,
    nodesSelector: d => d.nodes,
};

export default mapToList({
    pillars,
    subPillars,
}, (condition, key) => ({ key, ...condition }));
