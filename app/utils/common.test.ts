import {
    sortByOrder,
    reorder,
    breadcrumb,
    mergeLists,
} from './common';

test('sort by order', () => {
    expect(sortByOrder([])).toStrictEqual([]);
    // check sorting for already sorted list
    expect(sortByOrder([
        { id: '1', order: 1 },
        { id: '2', order: 2 },
    ])).toStrictEqual([
        { id: '1', order: 1 },
        { id: '2', order: 2 },
    ]);
    // check sorting for reversed list
    expect(sortByOrder([
        { id: '2', order: 2 },
        { id: '1', order: 1 },
    ])).toStrictEqual([
        { id: '1', order: 1 },
        { id: '2', order: 2 },
    ]);
    // check sorting with duplicate order
    expect(sortByOrder([
        { id: '2', order: 2 },
        { id: '3', order: 2 },
        { id: '1', order: 1 },
    ])).toStrictEqual([
        { id: '1', order: 1 },
        { id: '2', order: 2 },
        { id: '3', order: 2 },
    ]);

    expect(sortByOrder([
        { id: '2', order: 2 },
        { id: '3', order: 3 },
        { id: '1', order: 1 },
    ])).toStrictEqual([
        { id: '1', order: 1 },
        { id: '2', order: 2 },
        { id: '3', order: 3 },
    ]);
});

test('reorder', () => {
    expect(reorder([
        { id: '2', order: 2 },
        { id: '3', order: 3 },
        { id: '1', order: 1 },
    ])).toStrictEqual([
        { id: '2', order: 1 },
        { id: '3', order: 2 },
        { id: '1', order: 3 },
    ]);

    expect(reorder([
        { id: '2', order: undefined },
        { id: '3', order: 3 },
        { id: '1', order: 1 },
    ])).toStrictEqual([
        { id: '2', order: 1 },
        { id: '3', order: 2 },
        { id: '1', order: 3 },
    ]);


    expect(reorder([
        { id: '2', order: undefined },
        { id: '3', order: undefined },
        { id: '1', order: undefined },
    ])).toStrictEqual([
        { id: '2', order: 1 },
        { id: '3', order: 2 },
        { id: '1', order: 3 },
    ]);
});

test('breadcrumb', () => {
    expect(breadcrumb([])).toBe('');
    expect(breadcrumb(['ram'])).toBe('ram');
    expect(breadcrumb(['ram', 'shyam'], ' / ')).toBe('ram / shyam');
    expect(breadcrumb(['ram', undefined, 'shyam'], ' / ')).toBe('ram / shyam');
});

test('Merge lists', () => {
    const oldList = [
        {
            id: 1,
            name: 'One',
            key: 'one',
        },
        {
            id: 2,
            name: 'Two',
            key: 'two',
        },
        {
            id: 3,
            name: 'Three',
            key: 'three',
        },
    ];

    const newList = [
        {
            id: 1,
            name: 'Uno',
            key: 'uno',
        },
        {
            id: 3,
            name: 'Tre',
            key: 'tre',
        },
        {
            id: 4,
            name: 'Cuatro',
            key: 'cuatro',
        },
    ];

    expect(
        mergeLists(
            oldList,
            newList,
            (i) => i.id,
            (_, newItem) => newItem,
        )
    ).toStrictEqual(
        [
            {
                id: 1,
                name: 'Uno',
                key: 'uno',
            },
            {
                id: 2,
                name: 'Two',
                key: 'two',
            },
            {
                id: 3,
                name: 'Tre',
                key: 'tre',
            },
            {
                id: 4,
                name: 'Cuatro',
                key: 'cuatro',
            },
        ]
    );

    expect(
        mergeLists(
            oldList,
            newList,
            (i) => i.id,
            (oldItem, newItem) => ({
                ...newItem,
                key: oldItem.key,
            }),
        )
    ).toStrictEqual(
        [
            {
                id: 1,
                name: 'Uno',
                key: 'one',
            },
            {
                id: 2,
                name: 'Two',
                key: 'two',
            },
            {
                id: 3,
                name: 'Tre',
                key: 'three',
            },
            {
                id: 4,
                name: 'Cuatro',
                key: 'cuatro',
            },
        ]
    );
});
