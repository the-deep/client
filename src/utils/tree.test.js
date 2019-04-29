import { listToMap } from '@togglecorp/fujs';
import {
    unflat,
    getChildren,
    getParents,
} from './tree';

const geoOptions = [
    {
        key: '48',
        label: 'Country / Nepal',
        title: 'Nepal',
        parent: null,
        region: 3,
        adminLevel: 0,
        regionTitle: 'Nepal',
        adminLevelTitle: 'Country',
    },
    {
        key: '49',
        label: 'Development Region / Central',
        title: 'Central',
        parent: 48,
        region: 3,
        adminLevel: 1,
        regionTitle: 'Nepal',
        adminLevelTitle: 'Development Region',
    },
    {
        key: '50',
        label: 'Development Region / East',
        title: 'East',
        parent: 48,
        region: 3,
        adminLevel: 1,
        regionTitle: 'Nepal',
        adminLevelTitle: 'Development Region',
    },
    {
        key: '51',
        label: 'Development Region / Far-Western',
        title: 'Far-Western',
        parent: 48,
        region: 3,
        adminLevel: 1,
        regionTitle: 'Nepal',
        adminLevelTitle: 'Development Region',
    },
    {
        key: '52',
        label: 'Development Region / Mid-Western',
        title: 'Mid-Western',
        parent: 48,
        region: 3,
        adminLevel: 1,
        regionTitle: 'Nepal',
        adminLevelTitle: 'Development Region',
    },
    {
        key: '53',
        label: 'Development Region / West',
        title: 'West',
        parent: 48,
        region: 3,
        adminLevel: 1,
        regionTitle: 'Nepal',
        adminLevelTitle: 'Development Region',
    },
    {
        key: '54',
        label: 'Zone / Gandaki',
        title: 'Gandaki',
        parent: 53,
        region: 3,
        adminLevel: 2,
        regionTitle: 'Nepal',
        adminLevelTitle: 'Zone',
    },
];

test('test get children', () => {
    const treeMap = unflat(
        geoOptions,
        undefined,
        item => item.key,
        item => item.parent,
    );
    expect(
        getChildren(
            new Set(),
            treeMap,
            item => item.key,
            item => item.children,
        ),
    ).toEqual(new Set());

    expect(
        getChildren(
            new Set(['48']),
            treeMap,
            item => item.key,
            item => item.children,
        ),
    ).toEqual(new Set(['48', '49', '50', '51', '52', '53', '54']));

    expect(
        getChildren(
            new Set(['53']),
            treeMap,
            item => item.key,
            item => item.children,
        ),
    ).toEqual(new Set(['53', '54']));

    expect(
        getChildren(
            new Set(['54', '53']),
            treeMap,
            item => item.key,
            item => item.children,
        ),
    ).toEqual(new Set(['53', '54']));
    expect(
        getChildren(
            new Set(['54', '53', '48']),
            treeMap,
            item => item.key,
            item => item.children,
        ),
    ).toEqual(new Set(['48', '49', '50', '51', '52', '53', '54']));
});

const tree = [
    {
        key: 1,
        parent: undefined,
    },
    {
        key: 2,
        parent: 1,
    },
    {
        key: 3,
        parent: 2,
    },
    {
        key: 4,
        parent: 2,
    },
    {
        key: 5,
        parent: 3,
    },
    {
        key: 6,
        parent: 4,
    },
    {
        key: 7,
        parent: 4,
    },
    {
        key: 8,
        parent: 5,
    },
    {
        key: 9,
        parent: 6,
    },
    {
        key: 10,
        parent: 6,
    },
];


test('test get parents', () => {
    const treeMap = listToMap(
        tree,
        v => v.key,
        v => v,
    );

    expect(
        getParents(
            new Set(),
            treeMap,
            item => item.key,
            item => item.parent,
        ),
    ).toEqual(new Set());

    expect(
        getParents(
            new Set([8]),
            treeMap,
            item => item.key,
            item => item.parent,
        ),
    ).toEqual(new Set([1, 2, 3, 5, 8]));


    expect(
        getParents(
            new Set([6, 3]),
            treeMap,
            item => item.key,
            item => item.parent,
        ),
    ).toEqual(new Set([1, 2, 3, 4, 6]));

    expect(
        getParents(
            new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
            treeMap,
            item => item.key,
            item => item.parent,
        ),
    ).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));

    expect(
        getParents(
            new Set([6, 7]),
            treeMap,
            item => item.key,
            item => item.parent,
        ),
    ).toEqual(new Set([1, 2, 4, 6, 7]));
});
