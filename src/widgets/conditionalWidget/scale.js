import testMultiSelect from './testMultiSelect';

const emptyArray = [];

const getScaleOptions = ({ scaleUnits } = {}) => (
    scaleUnits || emptyArray
);

const isEqualTo = {
    title: 'Is equal to',
    attributes: [{
        key: 'scales',
        type: 'multiselect',
        title: 'Scale',
        options: getScaleOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: ({ value }, { scales }) => testMultiSelect(
        scale => value === scale,
        scales,
    ),
};

const isGreaterThan = {
    title: 'At least',
    attributes: [{
        key: 'scales',
        type: 'multiselect',
        title: 'Scale',
        options: getScaleOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: ({ value }, { scales }, { scaleUnits = [] }) => testMultiSelect(
        scale => (
            scaleUnits.findIndex(s => s.key === value) >=
            scaleUnits.findIndex(s => s.key === scale)
        ),
        scales,
    ),
};

const isLessThan = {
    title: 'At most',
    attributes: [{
        key: 'scales',
        type: 'multiselect',
        title: 'Scale',
        options: getScaleOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: ({ value }, { scales }, { scaleUnits = [] }) => testMultiSelect(
        scale => (
            scaleUnits.findIndex(s => s.key === value) <=
            scaleUnits.findIndex(s => s.key === scale)
        ),
        scales,
    ),
};

const isInBetween = {
    title: 'Is in between',
    attributes: [
        {
            key: 'lowerScale',
            type: 'select',
            title: 'Lower Scale',
            options: getScaleOptions,
            keySelector: d => d.key,
            labelSelector: d => d.label,
        },
        {
            key: 'upperScale',
            type: 'select',
            title: 'Upper Scale',
            options: getScaleOptions,
            keySelector: d => d.key,
            labelSelector: d => d.label,
        },
    ],
    test: ({ value }, { lowerScale, upperScale }, { scaleUnits = [] }) => {
        const lowerScaleIndex = scaleUnits.findIndex(s => s.key === lowerScale);
        const upperScaleIndex = scaleUnits.findIndex(s => s.key === upperScale);
        const valueIndex = scaleUnits.findIndex(s => s.key === value);

        return (valueIndex >= lowerScaleIndex && valueIndex <= upperScaleIndex);
    },
};

export default {
    isEqualTo,
    isGreaterThan,
    isLessThan,
    isInBetween,
};
