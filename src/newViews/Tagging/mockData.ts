import { Entry } from './types';

const values: Entry[] = [
    {
        id: 1,
        createdAt: 'Fri Feb 26 2021 20:14:55 GMT+0545 (Nepal Time)',
        createdBy: 65277,
        createdByName: 'sameer',
        modifiedBy: 34089,
        modifiedByName: 'sameer',
        clientId: 'wwfrillnhe',
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
                id: 'widget2',
                type: 'number',
                data: {
                    value: 10,
                },
            },
            {
                id: 'widget4',
                type: 'single-select',
                data: {
                    value: 'apple',
                },
            },
            {
                id: 'widget5',
                type: 'multi-select',
                data: {
                    value: ['apple', 'ball'],
                },
            },
            {
                id: 'widget6',
                type: 'date',
                data: {
                    value: '2021-01-13',
                },
            },
            {
                id: 'widget7',
                type: 'time',
                data: {
                    value: '13:03:00',
                },
            },
            {
                id: 'widget8',
                type: 'date-range',
                data: {
                    value: {
                        startDate: '2021-01-12',
                        endDate: '2021-01-14',
                    },
                },
            },
            {
                id: 'widget9',
                type: 'time-range',
                data: {
                    value: {
                        startTime: '13:05:00',
                        endTime: '13:12:00',
                    },
                },
            },
            {
                id: 'widget10',
                type: 'matrix-1d',
                data: {
                    value: {
                        fruits: {
                            apple: true,
                        },
                    },
                },
            },
            {
                id: 'widget11',
                type: 'matrix-2d',
                data: {
                    value: {
                        fruits: {
                            hilly: {
                                apple: ['green', 'sweet'],
                            },
                            terai: {
                                mango: ['yellow', 'sweet'],
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
                id: 'widget15',
                type: 'scale',
                data: {
                    value: 'good',
                },
            },
        ],
        entryType: 'excerpt',
        excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    },
    {
        id: 2,
        createdAt: 'Thu Apr 08 2021 07:32:27 GMT+0545 (Nepal Time)',
        createdBy: 23744,
        createdByName: 'Illum quibusdam magnam earum nam id.\nId et iste laboriosam molestias suscipit molestiae consectetur.\nDucimus nobis omnis ad temporibus dolores maxime.',
        modifiedBy: 71034,
        modifiedByName: 'eaque a eius',
        clientId: 'saepe mollitia atque',
        versionId: 1784,
        project: 93490,
        lead: 69365,
        attributes: [],
        analyticalFramework: 92024,
        entryType: 'image',
        image: 'image1',
        imageRaw: 'imag1',
        imageDetails: {
            id: 1,
            file: 'file1',
        },
    },
];

export default values;
