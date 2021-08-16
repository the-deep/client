import { Entry } from '#types/newEntry';

export const entry1: Entry = {
    id: 1,
    createdAt: 'Fri Feb 26 2021 20:14:55 GMT+0545 (Nepal Time)',
    createdBy: 65277,
    createdByName: 'sameer',
    modifiedBy: 34089,
    modifiedByName: 'sameer',
    clientId: 'wwfrillnhe',
    verified: false,
    versionId: 74123,
    project: 9839,
    lead: 64415,
    analyticalFramework: 96021,
    attributes: [
        {
            id: 'widget1',
            type: 'text',
            data: {
                value: 'ram',
            },
        },
        {
            id: 'number-widget-random',
            type: 'number',
            data: {
                value: 10,
            },
        },
        {
            id: 'single-select-random',
            type: 'single-select',
            data: {
                value: '15',
            },
        },
        {
            id: 'multi-select-random',
            type: 'multi-select',
            data: {
                value: ['31', '23'],
            },
        },
        {
            id: 'date-random',
            type: 'date',
            data: {
                value: '2021-01-13',
            },
        },
        {
            id: 'time-random',
            type: 'time',
            data: {
                value: '13:03:00',
            },
        },
        {
            id: 'date-range-random',
            type: 'date-range',
            data: {
                value: {
                    startDate: '2021-01-12',
                    endDate: '2021-01-14',
                },
            },
        },
        {
            id: 'time-range-random',
            type: 'time-range',
            data: {
                value: {
                    startTime: '13:05:00',
                    endTime: '13:12:00',
                },
            },
        },
        {
            id: 'matrix-1d-random',
            type: 'matrix-1d',
            data: {
                value: {
                    1: {
                        '1-1': true,
                    },
                },
            },
        },
        {
            id: 'matrix-2d-random',
            type: 'matrix-2d',
            data: {
                value: {
                    1: {
                        '1-1': {
                            'column-2': [],
                        },
                        '1-2': {
                            'column-1': ['sub-column-2', 'sub-column-1'],
                        },
                    },
                },
            },
        },
        {
            id: 'widget12',
            type: 'organigram',
            data: {
                value: ['nepal', 'pradesh', 'municipality'],
            },
        },
        {
            id: 'widget13',
            type: 'geo-location',
            data: {
                value: ['nepal', 'pradesh1', 'ilam'],
            },
        },
        {
            id: 'scale-random',
            type: 'scale',
            data: {
                value: '331',
            },
        },
    ],
    entryType: 'excerpt',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
};

export const entry2: Entry = {
    id: 2,
    createdAt: 'Thu Apr 08 2021 07:32:27 GMT+0545 (Nepal Time)',
    createdBy: 23744,
    createdByName: 'Illum quibusdam magnam earum nam id.\nId et iste laboriosam molestias suscipit molestiae consectetur.\nDucimus nobis omnis ad temporibus dolores maxime.',
    modifiedBy: 71034,
    verified: true,
    modifiedByName: 'eaque a eius',
    clientId: 'saepe mollitia atque',
    versionId: 1784,
    project: 93490,
    lead: 69365,
    analyticalFramework: 92024,
    entryType: 'image',
    image: 1123,
    imageDetails: {
        id: 1,
        file: 'https://i.imgur.com/blcysR7.png',
    },
    attributes: [
        {
            id: 'number-widget-random',
            type: 'number',
            data: {
                value: 10,
            },
        },
        {
            id: 'single-select-random',
            type: 'single-select',
            data: {
                value: '15',
            },
        },
        {
            id: 'multi-select-random',
            type: 'multi-select',
            data: {
                value: ['31', '23'],
            },
        },
        {
            id: 'widget13',
            type: 'geo-location',
            data: {
                value: ['nepal', 'pradesh1', 'ilam'],
            },
        },
        {
            id: 'scale-random',
            type: 'scale',
            data: {
                value: '331',
            },
        },
    ],
};

const values: Entry[] = [
    entry1,
    entry2,
];

export default values;
