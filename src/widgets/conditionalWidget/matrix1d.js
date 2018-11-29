import testMultiSelect from './testMultiSelect';

const emptyObject = {};
const emptyArray = [];

const getPillarOptions = ({ rows = emptyArray } = {}) => (
    rows.map(r => ({
        key: r.key,
        title: r.title,
    }))
);

const getSubpillarOptions = ({ rows = emptyArray } = {}) => (
    rows.reduce((acc, r = emptyObject) => [
        ...(r.cells || emptyArray).map(c => ({
            key: c.key,
            title: `${r.title} / ${c.value}`,
        })),
        ...acc,
    ], [])
);

const containsPillar = {
    title: 'Contains pillar',
    attributes: [{
        key: 'pillars',
        type: 'multiselect',
        title: 'Pillar',
        options: getPillarOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} }, { pillars }) =>
        testMultiSelect((pillar) => {
            const subpillars = value[pillar] || emptyObject;
            return Object.keys(subpillars).some(key => subpillars[key]);
        }, pillars),
};

const containsSubpillar = {
    title: 'Contains subpillar',
    attributes: [{
        key: 'subpillars',
        type: 'multiselect',
        title: 'Subpillar',
        options: getSubpillarOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} }, { subpillars }) =>
        testMultiSelect(subpillar => (
            Object.keys(value).some((p) => {
                const children = value[p] || emptyObject;
                return Object.keys(children).some(sp => (
                    sp === subpillar && children[sp]
                ));
            })
        ), subpillars),
};


export default {
    containsPillar,
    containsSubpillar,
};
