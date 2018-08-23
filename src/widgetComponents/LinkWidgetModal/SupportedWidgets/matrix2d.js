import { mapToList } from '#rsu/common';

const getDimensions = (widgetData = {}) => (
    widgetData.dimensions
);

const getSectors = (widgetData = {}) => (
    widgetData.sectors
);

const dimensions = {
    title: 'Dimensions',
    items: getDimensions,
    keySelector: d => d.id,
    labelSelector: d => d.title,
};

const subDimensions = {
    title: 'Sub dimensions',
    items: getDimensions,
    keySelector: d => d.id,
    labelSelector: d => d.title,
    nodesSelector: d => d.subdimensions,
};

const sectors = {
    title: 'Sectors',
    items: getSectors,
    keySelector: d => d.id,
    labelSelector: d => d.title,
};

const subSectors = {
    title: 'Sub sectors',
    items: getSectors,
    keySelector: d => d.id,
    labelSelector: d => d.title,
    nodesSelector: d => d.subsectors,
};

export default mapToList({
    dimensions,
    subDimensions,
    sectors,
    subSectors,
}, (condition, key) => ({ key, ...condition }));
