const isEqualTo = {
    title: 'Is equal to',
    attributes: [{
        key: 'value',
        type: 'date',
        title: 'Is equal to',
    }],
};

const after = {
    title: 'After',
    attributes: [{
        key: 'value',
        type: 'date',
        title: 'After date',
    }],
};

const before = {
    title: 'Before',
    attributes: [{
        key: 'value',
        type: 'date',
        title: 'Before date',
    }],
};

const isInBetween = {
    title: 'In in between',
    attributes: [
        {
            key: 'minValue',
            type: 'date',
            title: 'After date',
        },
        {
            key: 'maxValue',
            type: 'date',
            title: 'Before date',
        },
    ],
};

export default {
    isEqualTo,
    after,
    before,
    isInBetween,
};
