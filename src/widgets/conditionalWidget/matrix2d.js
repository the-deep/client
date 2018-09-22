const emptyArray = [];

const getDimensionOptions = ({ dimensions = emptyArray } = {}) => (
    dimensions.map(r => ({
        key: r.id,
        title: r.title,
    }))
);

const getSubdimensionOptions = ({ dimensions = emptyArray } = {}) => (
    dimensions.reduce((acc, r) => [
        ...(r.subdimensions || emptyArray).map(c => ({
            key: c.id,
            title: c.title,
        })),
        ...acc,
    ], [])
);

const getSectorOptions = ({ sectors = emptyArray } = {}) => (
    sectors.map(r => ({
        key: r.id,
        title: r.title,
    }))
);

const getSubsectorOptions = ({ sectors = emptyArray } = {}) => (
    sectors.reduce((acc, r) => [
        ...(r.subsectors || emptyArray).map(c => ({
            key: c.id,
            title: c.title,
        })),
        ...acc,
    ], [])
);

const containsDimension = {
    title: 'Contains dimension',
    attributes: [{
        key: 'dimension',
        type: 'select',
        title: 'Dimension',
        options: getDimensionOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
};

const containsSubdimension = {
    title: 'Contains subdimension',
    attributes: [{
        key: 'subdimension',
        type: 'select',
        title: 'Subdimension',
        options: getSubdimensionOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
};

const containsSector = {
    title: 'Contains sector',
    attributes: [{
        key: 'sector',
        type: 'select',
        title: 'Sector',
        options: getSectorOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
};

const containsSubsector = {
    title: 'Contains subsector',
    attributes: [{
        key: 'subsector',
        type: 'select',
        title: 'Subsector',
        options: getSubsectorOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
};


export default {
    containsDimension,
    containsSubdimension,
    containsSector,
    containsSubsector,
};
