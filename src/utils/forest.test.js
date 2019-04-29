import { generateRelation, simpleShuffle } from './forest';

const treeList = [
    {
        id: 1,
        parent: undefined,
    },
    {
        id: 2,
        parent: 1,
    },
    {
        id: 3,
        parent: 1,
    },
    {
        id: 4,
        parent: 3,
    },
    {
        id: 5,
        parent: 3,
    },
    {
        id: 6,
        parent: 5,
    },
    {
        id: 7,
        parent: 6,
    },
    {
        id: 8,
        parent: 1,
    },
    {
        id: 9,
        parent: 3,
    },
];

const tree = {
    1: {
        id: 1,
        parent: undefined,
        children: [2, 3, 4, 5, 6, 7, 8, 9],
    },
    2: {
        id: 2,
        parent: 1,
        children: [],
    },
    3: {
        id: 3,
        parent: 1,
        children: [4, 5, 6, 7, 9],
    },
    4: {
        id: 4,
        parent: 3,
        children: [],
    },
    5: {
        id: 5,
        parent: 3,
        children: [6, 7],
    },
    6: {
        id: 6,
        parent: 5,
        children: [7],
    },
    7: {
        id: 7,
        parent: 6,
        children: [],
    },
    8: {
        id: 8,
        parent: 1,
        children: [],
    },
    9: {
        id: 9,
        parent: 3,
        children: [],
    },
};


test('convert to relation', () => {
    const idSelector = foo => foo.id;
    const parentSelector = foo => foo.parent;

    for (let i = 0; i < 10000; i += 1) {
        const input = simpleShuffle(treeList);
        expect(generateRelation(input, idSelector, parentSelector))
            .toEqual(tree);
    }
});
