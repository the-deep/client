import {
    AnalysisFramework,
    Matrix1dWidget,
    Matrix2dWidget,
} from '#types/newAnalyticalFramework';

const matrix1d: Matrix1dWidget = {
    clientId: 'matrix-1d-random',
    type: 'matrix-1d',
    title: 'Matrix 1d',
    order: 1,
    width: 'full',
    condition: [],
    data: {
        rows: [
            {
                clientId: '1',
                label: 'Context',
                color: 'white',
                order: -1,
                cells: [
                    {
                        clientId: '1-1',
                        label: 'Environment',
                        order: -1,
                    },
                    {
                        clientId: '1-2',
                        label: 'Socio-cultural',
                        order: -1,
                    },
                    {
                        clientId: '1-3',
                        label: 'Economy',
                        order: -1,
                    },
                    {
                        clientId: '1-4',
                        label: 'Demography',
                        order: -1,
                    },
                    {
                        clientId: '1-5',
                        label: 'Legal',
                        order: -1,
                    },
                    {
                        clientId: '1-6',
                        label: 'Security',
                        order: -1,
                    },
                ],
            },
            {
                clientId: '2',
                label: 'Shock and Event',
                order: -1,
                color: 'white',
                cells: [
                    {
                        order: -1,
                        clientId: '2-1',
                        label: 'Aggravating factors',
                    },
                    {
                        order: -1,
                        clientId: '2-2',
                        label: 'Type and characterstics',
                    },
                ],
            },
            {
                clientId: '3',
                label: 'Displacement Profile',
                order: -1,
                color: 'white',
                cells: [
                    {
                        order: -1,
                        clientId: '3-1',
                        label: 'Type/number',
                    },
                    {
                        order: -1,
                        clientId: '3-2',
                        label: 'Movement',
                    },
                    {
                        order: -1,
                        clientId: '3-3',
                        label: 'Push factors',
                    },
                    {
                        order: -1,
                        clientId: '3-4',
                        label: 'Pull factors',
                    },
                    {
                        order: -1,
                        clientId: '3-5',
                        label: 'Intentions',
                    },
                    {
                        order: -1,
                        clientId: '3-6',
                        label: 'Local Integration',
                    },
                ],
            },
            {
                order: -1,
                clientId: '4',
                label: 'Casualties',
                color: 'white',
                cells: [
                    {
                        order: -1,
                        clientId: '4-1',
                        label: 'Injured',
                    },
                    {
                        order: -1,
                        clientId: '4-2',
                        label: 'Missing',
                    },
                    {
                        order: -1,
                        clientId: '4-3',
                        label: 'Dead',
                    },
                ],
            },
            {
                order: -1,
                clientId: '5',
                label: 'Humanitarian Access',
                color: 'white',
                cells: [
                    {
                        order: -1,
                        clientId: '5-1',
                        label: 'Relief to Beneficiaries',
                    },
                    {
                        order: -1,
                        clientId: '5-2',
                        label: 'Beneficiaries to Relief',
                    },
                    {
                        order: -1,
                        clientId: '5-3',
                        label: 'Physical Constraints',
                    },
                    {
                        order: -1,
                        clientId: '5-4',
                        label: 'Humanitarian Access Gap',
                    },
                ],
            },
            {
                clientId: '6',
                label: 'Information',
                color: 'white',
                order: -1,
                cells: [
                    {
                        order: -1,
                        clientId: '6-1',
                        label: 'Communication Means',
                    },
                    {
                        order: -1,
                        clientId: '6-2',
                        label: 'Information Challenge',
                    },
                    {
                        order: -1,
                        clientId: '6-3',
                        label: 'Information Needs',
                    },
                    {
                        order: -1,
                        clientId: '6-4',
                        label: 'Information Gaps',
                    },
                ],
            },
        ],
    },
};

const matrix2d: Matrix2dWidget = {
    clientId: 'matrix-2d-random',
    type: 'matrix-2d',
    title: 'Matrix 2d',
    order: 2,
    width: 'full',
    condition: [],
    data: {
        rows: [
            {
                clientId: '1',
                order: -1,
                label: 'Scope and Scale',
                color: 'white',
                subRows: [
                    {
                        order: -1,
                        clientId: '1-1',
                        label: 'Drivers/Aggravating Factors',
                    },
                    {
                        order: -1,
                        clientId: '1-2',
                        label: 'System Disruption',
                    },
                    {
                        order: -1,
                        clientId: '1-3',
                        label: 'Damages and Losses',
                    },
                    {
                        order: -1,
                        clientId: '1-4',
                        label: 'People Affected',
                    },
                ],
            },
            {
                order: -1,
                clientId: '2',
                label: 'Humanitarian Conditions',
                color: 'white',
                subRows: [
                    {
                        order: -1,
                        clientId: '2-1',
                        label: 'Pilots/Conciliating Factors',
                    },
                    {
                        order: -1,
                        clientId: '2-2',
                        label: 'System Reconciliation',
                    },
                    {
                        order: -1,
                        clientId: '2-3',
                        label: 'Improvements and Wins',
                    },
                    {
                        order: -1,
                        clientId: '2-4',
                        label: 'Monkeys Affected',
                    },
                ],
            },
        ],
        columns: [
            {
                clientId: 'column-1',
                order: -1,
                label: 'Cross',
                subColumns: [
                    {
                        clientId: 'sub-column-1',
                        order: -1,
                        label: 'Sub Crossed',
                    },
                    {
                        clientId: 'sub-column-2',
                        order: -1,
                        label: 'Sub Crossed 2',
                    },
                ],
            },
            {
                order: -1,
                clientId: 'column-2',
                label: 'Food',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '3',
                label: 'Livelihoods',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '4',
                label: 'Health',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '5',
                label: 'Nutrition',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '6',
                label: 'WASH',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '7',
                label: 'Protection',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '8',
                label: 'Education',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '9',
                label: 'Shelter',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '10',
                label: 'Agriculture',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '11',
                label: 'Logistics',
                subColumns: [],
            },
        ],
    },
};

const dataAf: AnalysisFramework = {
    id: 21,
    createdAt: '2021-07-19T10:45:08.705794Z',
    createdBy: 24,
    createdByName: 'Iva Barbara',
    title: 'Sign of the Painted Pearls',
    members: [24, 34],
    organization: 901,
    description: 'Sign of the Painted Pearls is an international bestseller written by Iva Barbara. The book takes the reader into the journey of her teen years in Hawaii where she meets her destiny and her sweetest tragedy. The readers are in for a rush of adrenaline and tear-jerking moments.',
    isPrivate: true,
    organizationDetails: {
        id: 3,
        title: 'Non-governmental Organization',
        shortName: 'NGO',
    },

    primaryTagging: [
        {
            clientId: 'primary-tagging-random',
            title: 'Missing Wave',
            tooltip: 'On on produce colonel pointed. Just four sold need over how any.',
            order: 1,
            widgets: [matrix1d, matrix2d],
        },
    ],
    secondaryTagging: [
        {
            clientId: 'number-widget-random',
            title: 'Number Widget',
            order: 1,
            width: 'full',
            condition: [],
            type: 'number',
            data: {
                maxValue: 10000,
                minValue: 1,
            },
        },
        {
            clientId: 'single-select-random',
            title: 'Single Select Value',
            order: 2,
            width: 'half',
            condition: [],
            type: 'single-select',
            data: {
                options: [
                    {
                        clientId: '15',
                        order: 1,
                        label: 'Black',
                    },
                    {
                        clientId: '19',
                        order: 2,
                        label: 'White',
                    },
                ],
            },
        },
        {
            clientId: 'multi-select-random',
            title: 'Multi Select Value',
            order: 3,
            width: 'half',
            condition: [],
            type: 'multi-select',
            data: {
                options: [
                    {
                        clientId: '31',
                        order: 1,
                        label: 'Water',
                    },
                    {
                        clientId: '23',
                        order: 2,
                        label: 'Air',
                    },
                    {
                        clientId: '24',
                        order: 3,
                        label: 'Land',
                    },
                ],
            },
        },
        {
            clientId: 'date-random',
            title: 'Date',
            order: 4,
            width: 'half',
            condition: [],
            type: 'date',
            data: {
                defaultValue: '2021-07-19T10:45:08.705794Z',
            },
        },
        {
            clientId: 'text-random',
            title: 'Text',
            order: 5,
            width: 'half',
            type: 'text',
            condition: [],
            data: {
                defaultValue: 'Hi, I am a text',
            },
        },
        {
            clientId: 'time-random',
            title: 'time',
            order: 6,
            width: 'half',
            type: 'time',
            condition: [],
            data: {
                defaultValue: '20:19:26.977084Z',
            },
        },
        {
            clientId: 'time-range-random',
            title: 'Time Range',
            order: 7,
            width: 'half',
            condition: [],
            type: 'time-range',
            data: {
                defaultValue: {
                    startTime: '00:00:00.00',
                    endTime: '22:30:00.00',
                },
            },
        },
        {
            clientId: 'scale-random',
            title: 'Scale',
            order: 8,
            width: 'half',
            type: 'scale',
            condition: [],
            data: {
                options: [
                    {
                        clientId: '331',
                        label: 'High',
                        order: 1,
                        color: '#fffff1',
                    },
                    {
                        clientId: '332',
                        label: 'Medium',
                        order: 2,
                        color: '#12ff34c',
                    },
                    {
                        clientId: '333',
                        label: 'Low',
                        order: 3,
                        color: '#aa44ee',
                    },
                ],
            },
        },
        {
            clientId: 'date-range-random',
            title: 'Date Range',
            order: 9,
            width: 'half',
            condition: [],
            type: 'date-range',
            data: {
                defaultValue: {
                    startDate: '2021-07-01T00:00:00.00Z',
                    endDate: '2021-07-30T00:00:00.00Z',
                },
            },
        },

    ],
};

export default dataAf;
