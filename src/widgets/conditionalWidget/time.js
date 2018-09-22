const isEqualTo = {
    title: 'Is equal to',
    attributes: [{
        key: 'value',
        type: 'time',
        title: 'Is equal to',
    }],
};

const after = {
    title: 'After',
    attributes: [{
        key: 'value',
        type: 'time',
        title: 'After',
    }],
};

const before = {
    title: 'Before',
    attributes: [{
        key: 'value',
        type: 'time',
        title: 'Before',
    }],
};

const isInBetween = {
    title: 'In in between',
    attributes: [
        {
            key: 'minValue',
            type: 'time',
            title: 'After',
        },
        {
            key: 'maxValue',
            type: 'time',
            title: 'Before',
        },
    ],
};

export default {
    isEqualTo,
    after,
    before,
    isInBetween,
};
