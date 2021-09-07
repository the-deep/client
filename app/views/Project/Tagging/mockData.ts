import { Entry } from '#types/newEntry';

export const entry1: Entry = {
    id: '1',
    clientId: 'wwfrillnhe',
    entryType: 'EXCERPT',
    droppedExcerpt: '',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    attributes: [
        {
            id: 'widget1',
            widgetType: 'TEXTWIDGET',
            widget: '0',
            data: {
                value: 'ram',
            },
        },
        {
            id: 'number-widget-random',
            widgetType: 'NUMBERWIDGET',
            widget: '0',
            data: {
                value: 10,
            },
        },
        {
            id: 'single-select-random',
            widgetType: 'SELECTWIDGET',
            widget: '0',
            data: {
                value: '15',
            },
        },
        {
            id: 'multi-select-random',
            widgetType: 'MULTISELECTWIDGET',
            widget: '0',
            data: {
                value: ['31', '23'],
            },
        },
        {
            id: 'date-random',
            widgetType: 'DATEWIDGET',
            widget: '0',
            data: {
                value: '2021-01-13',
            },
        },
        {
            id: 'time-random',
            widgetType: 'TIMEWIDGET',
            widget: '0',
            data: {
                value: '13:03:00',
            },
        },
        {
            id: 'date-range-random',
            widgetType: 'DATERANGEWIDGET',
            widget: '0',
            data: {
                value: {
                    startDate: '2021-01-12',
                    endDate: '2021-01-14',
                },
            },
        },
        {
            id: 'time-range-random',
            widgetType: 'TIMERANGEWIDGET',
            widget: '0',
            data: {
                value: {
                    startTime: '13:05:00',
                    endTime: '13:12:00',
                },
            },
        },
        {
            id: 'matrix-1d-random',
            widgetType: 'MATRIX1DWIDGET',
            widget: '0',
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
            widgetType: 'MATRIX2DWIDGET',
            widget: '0',
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
            widgetType: 'ORGANIGRAMWIDGET',
            widget: '0',
            data: {
                value: ['nepal', 'pradesh', 'municipality'],
            },
        },
        {
            id: 'widget13',
            widgetType: 'GEOWIDGET',
            widget: '0',
            data: {
                value: ['nepal', 'pradesh1', 'ilam'],
            },
        },
        {
            id: 'scale-random',
            widgetType: 'SCALEWIDGET',
            widget: '0',
            data: {
                value: '331',
            },
        },
    ],
};

export const entry2: Entry = {
    id: '2',
    clientId: '12',
    entryType: 'IMAGE',
    excerpt: '',
    droppedExcerpt: '',
    image: {
        id: '1123',
        title: 'Some image',
    },
    attributes: [
        {
            id: 'number-widget-random',
            widgetType: 'NUMBERWIDGET',
            widget: '0',
            data: {
                value: 10,
            },
        },
        {
            id: 'single-select-random',
            widgetType: 'SELECTWIDGET',
            widget: '0',
            data: {
                value: '15',
            },
        },
        {
            id: 'multi-select-random',
            widgetType: 'MULTISELECTWIDGET',
            widget: '0',
            data: {
                value: ['31', '23'],
            },
        },
        {
            id: 'widget13',
            widgetType: 'GEOWIDGET',
            widget: '0',
            data: {
                value: ['nepal', 'pradesh1', 'ilam'],
            },
        },
        {
            id: 'scale-random',
            widgetType: 'SCALEWIDGET',
            widget: '0',
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
