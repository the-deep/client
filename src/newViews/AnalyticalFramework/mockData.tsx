import { AnalyticalFramework } from './types.ts';

export const dataAf: AnalyticalFramework = [
    {
        title: 'Sign of the Painted Pearls',
        members: [24, 34],
        organization: 901,
        description: 'Sign of the Painted Pearls is an international bestseller written by Iva Barbara. The book takes the reader into the journey of her teen years in Hawaii where she meets her destiny and her sweetest tragedy. The readers are in for a rush of adrenaline and tear-jerking moments.',
        isPrivate: true,
        organizationDetails: {
            id: 3,
            title: 'Non-governmental Organization',
            description: 'Non-governmental Organization includes organizations that operate independently from any government, including civil society.',
        },

        primaryTagging: [
            {
                clientId: '1',
                title: 'Missing Wave',
                tooltip: 'On on produce colonel pointed. Just four sold need over how any.',
                widgets: [
                    {
                        clientId: '1',
                        title: 'Number Widget'
                        order: 1;
                        width: 'full',
                        condition: [
                            {
                                clientId: '1',
                                order: 1,
                                conjection: 'OR',
                            },
                        ],
                        type: 'number',
                        data: {
                            maxValue: 10000,
                            minValue: 1,
                        },
                    },
                    {
                        clientId: '1',
                        title: 'Single Select Value',
                        order: 2,
                        width: 'half',
                        condition: [],
                        type: 'single-select',
                        data: {
                            options: {
                                clientId: '1',
                                label: 
                            },
                        },
                    },
                ],
                order: 1,
            },
        ],
        secondaryTagging: [
        ],
    },
];
