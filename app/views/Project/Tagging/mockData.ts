import { Entry } from '#types/newEntry';

export const entry1: Entry = {
    id: 1,
    createdAt: 'Fri Feb 26 2021 20:14:55 GMT+0545 (Nepal Time)',
    createdBy: 65277,
    createdByName: 'sameer',
    modifiedBy: 34089,
    modifiedByName: 'sameer',
    clientId: 'wwfrillnhe',
    controlled: false,
    verifiedBy: [],
    versionId: 74123,
    project: 9839,
    lead: 64415,
    analyticalFramework: 96021,
    attributes: [
        {
            id: 'widget1',
            type: 'TEXTWIDGET',
            data: {
                value: 'ram',
            },
        },
        {
            id: 'number-widget-random',
            type: 'NUMBERWIDGET',
            data: {
                value: 10,
            },
        },
        {
            id: 'single-select-random',
            type: 'SELECTWIDGET',
            data: {
                value: '15',
            },
        },
        {
            id: 'multi-select-random',
            type: 'MULTISELECTWIDGET',
            data: {
                value: ['31', '23'],
            },
        },
        {
            id: 'date-random',
            type: 'DATEWIDGET',
            data: {
                value: '2021-01-13',
            },
        },
        {
            id: 'time-random',
            type: 'TIMEWIDGET',
            data: {
                value: '13:03:00',
            },
        },
        {
            id: 'date-range-random',
            type: 'DATERANGEWIDGET',
            data: {
                value: {
                    startDate: '2021-01-12',
                    endDate: '2021-01-14',
                },
            },
        },
        {
            id: 'time-range-random',
            type: 'TIMERANGEWIDGET',
            data: {
                value: {
                    startTime: '13:05:00',
                    endTime: '13:12:00',
                },
            },
        },
        {
            id: 'matrix-1d-random',
            type: 'MATRIX1DWIDGET',
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
            type: 'MATRIX2DWIDGET',
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
            type: 'ORGANIGRAMWIDGET',
            data: {
                value: ['nepal', 'pradesh', 'municipality'],
            },
        },
        {
            id: 'widget13',
            type: 'GEOWIDGET',
            data: {
                value: ['nepal', 'pradesh1', 'ilam'],
            },
        },
        {
            id: 'scale-random',
            type: 'SCALEWIDGET',
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
    controlled: true,
    verifiedBy: [],
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
            type: 'NUMBERWIDGET',
            data: {
                value: 10,
            },
        },
        {
            id: 'single-select-random',
            type: 'SELECTWIDGET',
            data: {
                value: '15',
            },
        },
        {
            id: 'multi-select-random',
            type: 'MULTISELECTWIDGET',
            data: {
                value: ['31', '23'],
            },
        },
        {
            id: 'widget13',
            type: 'GEOWIDGET',
            data: {
                value: ['nepal', 'pradesh1', 'ilam'],
            },
        },
        {
            id: 'scale-random',
            type: 'SCALEWIDGET',
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
