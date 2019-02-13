import testMultiSelect from './testMultiSelect';

const emptyObject = {};
const emptyArray = [];

// TODO: move this to utils
const doesObjectHaveNoKey = obj => (
    !!obj && Object.keys(obj).length === 0
);

const getDimensionOptions = ({ dimensions = emptyArray } = {}) => (
    dimensions.map(r => ({
        key: r.id,
        title: r.title,
    }))
);

const getSubdimensionOptions = ({ dimensions = emptyArray } = {}) => (
    dimensions.reduce((acc, r = emptyObject) => [
        ...(r.subdimensions || emptyArray).map(c => ({
            key: c.id,
            title: `${r.title} / ${c.title}`,
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
    sectors.reduce((acc, r = emptyObject) => [
        ...(r.subsectors || emptyArray).map(c => ({
            key: c.id,
            title: `${r.title} / ${c.title}`,
        })),
        ...acc,
    ], [])
);

const containsDimension = {
    title: 'Contains dimension',
    attributes: [{
        key: 'dimensions',
        type: 'multiselect',
        title: 'Dimension',
        options: getDimensionOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} }, { dimensions }) =>
        testMultiSelect((dimension) => {
            const dimensionValue = value[dimension];
            if (!dimensionValue) {
                return false;
            }

            const selectedKeys = Object.keys(dimensionValue)
                .filter(k => !doesObjectHaveNoKey(dimensionValue[k]));
            return selectedKeys.length !== 0;
        }, dimensions),
};

const containsSubdimension = {
    title: 'Contains subdimension',
    attributes: [{
        key: 'subdimensions',
        type: 'multiselect',
        title: 'Subdimension',
        options: getSubdimensionOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} }, { subdimensions }) =>
        testMultiSelect((subdimension) => {
            const dimensionOfSubdimension = Object.keys(value)
                .find(v => (value[v] || emptyObject)[subdimension] !== undefined);
            if (!dimensionOfSubdimension) {
                return false;
            }
            return !doesObjectHaveNoKey(
                (value[dimensionOfSubdimension] || emptyObject)[subdimension],
            );
        }, subdimensions),
};

const containsSector = {
    title: 'Contains sector',
    attributes: [{
        key: 'sectors',
        type: 'multiselect',
        title: 'Sector',
        options: getSectorOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} }, { sectors }) =>
        testMultiSelect(sector => (
            Object.keys(value).some((v) => {
                const subdimen = value[v];
                if (doesObjectHaveNoKey(subdimen)) {
                    return false;
                }

                return Object.keys(subdimen).some(sd => (
                    subdimen[sd] && subdimen[sd][sector]
                ));
            })
        ), sectors),
};

const containsSubsector = {
    title: 'Contains subsector',
    attributes: [{
        key: 'subsectors',
        type: 'multiselect',
        title: 'Subsector',
        options: getSubsectorOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} }, { subsectors }) =>
        testMultiSelect(subsector => (
            Object.keys(value).some((v) => {
                const subdimen = value[v];
                if (doesObjectHaveNoKey(subdimen)) {
                    return false;
                }

                return Object.keys(subdimen).some((sd) => {
                    const subdimenSector = subdimen[sd];
                    if (doesObjectHaveNoKey(subdimenSector)) {
                        return false;
                    }
                    return Object.keys(subdimenSector).some(sds => (
                        subdimenSector[sds].indexOf(subsector) >= 0
                    ));
                });
            })
        ), subsectors),
};

export default {
    containsDimension,
    containsSubdimension,
    containsSector,
    containsSubsector,
};
