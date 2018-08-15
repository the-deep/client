import { mapToList } from '#rsu/common';

const getPillarOptions = () => [];
const getSubpillarOptions = () => [];

const containsPillar = {
    attributes: [{
        key: 'pillar',
        type: 'select',
        title: 'Pillar',
        options: getPillarOptions,
    }],
};

const containsSubpillar = {
    attributes: [{
        key: 'subpillar',
        type: 'select',
        title: 'Subpillar',
        options: getSubpillarOptions,
    }],
};


export default mapToList({
    containsPillar,
    containsSubpillar,
}, (condition, key) => ({ key, ...condition }));
