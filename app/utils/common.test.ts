import { sortByOrder, reorder, breadcrumb } from './common';

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
