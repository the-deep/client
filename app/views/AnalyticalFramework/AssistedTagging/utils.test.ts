import {
    Matrix2dWidget,
    Matrix1dWidget,
    ScaleWidget,
    OrganigramWidget,
} from '#types/newAnalyticalFramework';

import {
    getMatrix2dPossibleMappings,
    getMatrix1dPossibleMappings,
    getOptionTypePossibleMappings,
    Matrix1dPossibleMapping,
    Matrix2dPossibleMapping,
    ScalePossibleMapping,
    OrganigramPossibleMapping,
    getOrganigramPossibleMappings,
} from './utils';

const matrix2dSample: Matrix2dWidget = {
    width: 'FULL',
    version: 11,
    title: 'Matrix 2D',
    order: 11,
    key: 'sample-matrix-2d',
    id: '12',
    clientId: 'sample-matrix-2d',
    widgetId: 'MATRIX2D',
    properties: {
        columns: [
            {
                order: 1,
                key: 'column-1',
                label: 'Column 1',
                subColumns: [
                    {
                        order: 1,
                        key: 'sub-col-1',
                        label: 'Sub Col 1',
                    },
                    {
                        order: 2,
                        key: 'sub-col-2',
                        label: 'Sub Col 2',
                    },
                ],
            },
            {
                order: 2,
                key: 'column-2',
                label: 'Column 2',
                subColumns: [],
            },
        ],
        rows: [
            {
                order: 1,
                color: 'red',
                key: 'row-1',
                label: 'Row 1',
                subRows: [
                    {
                        key: 'sub-row-1-1',
                        label: 'Sub Row 1 1',
                        order: 1,
                    },
                    {
                        key: 'sub-row-1-2',
                        label: 'Sub Row 1 2',
                        order: 2,
                    },
                ],
            },
            {
                order: 2,
                color: 'red',
                key: 'row-2',
                label: 'Row 2',
                subRows: [
                    {
                        key: 'sub-row-2-1',
                        label: 'Sub Row 2 1',
                        order: 1,
                    },
                    {
                        key: 'sub-row-2-2',
                        label: 'Sub Row 2 2',
                        order: 2,
                    },
                    {
                        key: 'sub-row-2-3',
                        label: 'Sub Row 2 3',
                        order: 3,
                    },
                ],
            },
        ],
    },
};

const matrix2dPossibleMapping: Matrix2dPossibleMapping[] = [
    {
        label: 'Column 1',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'COLUMN',
            columnKey: 'column-1',
        },
    },
    {
        label: 'Column 2',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'COLUMN',
            columnKey: 'column-2',
        },
    },
    {
        label: 'Sub Col 1',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_COLUMN',
            columnKey: 'column-1',
            subColumnKey: 'sub-col-1',
        },
    },
    {
        label: 'Sub Col 2',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_COLUMN',
            columnKey: 'column-1',
            subColumnKey: 'sub-col-2',
        },
    },
    {
        label: 'Sub Row 1 1',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_ROW',
            rowKey: 'row-1',
            subRowKey: 'sub-row-1-1',
        },
    },
    {
        label: 'Sub Row 1 2',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_ROW',
            rowKey: 'row-1',
            subRowKey: 'sub-row-1-2',
        },
    },
    {
        label: 'Sub Row 2 1',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_ROW',
            rowKey: 'row-2',
            subRowKey: 'sub-row-2-1',
        },
    },
    {
        label: 'Sub Row 2 2',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_ROW',
            rowKey: 'row-2',
            subRowKey: 'sub-row-2-2',
        },
    },
    {
        label: 'Sub Row 2 3',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_ROW',
            rowKey: 'row-2',
            subRowKey: 'sub-row-2-3',
        },
    },
];

const matrix1dSample: Matrix1dWidget = {
    width: 'FULL',
    version: 11,
    title: 'Matrix 1D',
    order: 11,
    key: 'sample-matrix-1d',
    id: '13',
    clientId: 'sample-matrix-1d',
    widgetId: 'MATRIX1D',
    properties: {
        rows: [
            {
                key: 'row-1',
                label: 'Row 1',
                order: 1,
                color: '#b0b0b0',
                cells: [
                    {
                        key: 'sub-row-1-1',
                        label: 'Sub Row 1 1',
                        order: 1,
                    },
                ],
            },
            {
                key: 'row-2',
                label: 'row-2',
                order: 2,
                color: '#ff0000',
                cells: [
                    {
                        key: 'sub-row-2-1',
                        label: 'Sub Row 2 1',
                        order: 1,
                    },
                    {
                        key: 'sub-row-2-2',
                        label: 'Sub Row 2 2',
                        order: 2,
                    },
                ],
            },
        ],
    },
};

const matrix1dPossibleMapping: Matrix1dPossibleMapping[] = [
    {
        label: 'Sub Row 1 1',
        widget: '13',
        widgetType: 'MATRIX1D',
        association: {
            rowKey: 'row-1',
            subRowKey: 'sub-row-1-1',
        },
    },
    {
        label: 'Sub Row 2 1',
        widget: '13',
        widgetType: 'MATRIX1D',
        association: {
            rowKey: 'row-2',
            subRowKey: 'sub-row-2-1',
        },
    },
    {
        label: 'Sub Row 2 2',
        widget: '13',
        widgetType: 'MATRIX1D',
        association: {
            rowKey: 'row-2',
            subRowKey: 'sub-row-2-2',
        },
    },
];

const scaleSample: ScaleWidget = {
    width: 'HALF',
    version: 11,
    title: 'Scale',
    order: 11,
    key: 'sample-scale',
    id: '14',
    clientId: 'sample-scale',
    widgetId: 'SCALE',
    properties: {
        options: [
            {
                key: 'option-1',
                label: 'Option 1',
                order: 1,
                color: '#f0f0f0',
            },
            {
                key: 'option-2',
                label: 'Option 2',
                order: 2,
                color: '#123123',
            },
        ],
    },
};

const scalePossibleMapping: ScalePossibleMapping[] = [
    {
        label: 'Option 1',
        widget: '14',
        widgetType: 'SCALE',
        association: {
            optionKey: 'option-1',
        },
    },
    {
        label: 'Option 2',
        widget: '14',
        widgetType: 'SCALE',
        association: {
            optionKey: 'option-2',
        },
    },
];

const organigramSample: OrganigramWidget = {
    width: 'HALF',
    version: 11,
    title: 'Organigram',
    order: 11,
    key: 'sample-organigram',
    id: '15',
    clientId: 'sample-organigram',
    widgetId: 'ORGANIGRAM',
    properties: {
        options: {
            key: 'parent-0',
            label: 'Parent 0',
            order: 1,
            children: [
                {
                    key: 'child-0-1',
                    label: 'Child 0 1',
                    order: 1,
                    children: [
                        {
                            key: 'child-1-1',
                            label: 'Child 1 1',
                            order: 1,
                            children: [],
                        },
                        {
                            key: 'child-1-2',
                            label: 'Child 1 2',
                            order: 2,
                            children: [],
                        },
                    ],
                },
                {
                    key: 'child-0-2',
                    label: 'Child 0 2',
                    order: 2,
                    children: [],
                },
            ],
        },
    },
};

const organigramPossibleMapping: OrganigramPossibleMapping[] = [
    {
        label: 'Parent 0',
        widget: '15',
        widgetType: 'ORGANIGRAM',
        association: {
            optionKey: 'parent-0',
        },
    },
    {
        label: 'Parent 0/Child 0 1',
        widget: '15',
        widgetType: 'ORGANIGRAM',
        association: {
            optionKey: 'child-0-1',
        },
    },
    {
        label: 'Parent 0/Child 0 1/Child 1 1',
        widget: '15',
        widgetType: 'ORGANIGRAM',
        association: {
            optionKey: 'child-1-1',
        },
    },
    {
        label: 'Parent 0/Child 0 1/Child 1 2',
        widget: '15',
        widgetType: 'ORGANIGRAM',
        association: {
            optionKey: 'child-1-2',
        },
    },
    {
        label: 'Parent 0/Child 0 2',
        widget: '15',
        widgetType: 'ORGANIGRAM',
        association: {
            optionKey: 'child-0-2',
        },
    },
];


test('get matrix possible mappings', () => {
    expect(getMatrix2dPossibleMappings(undefined)).toStrictEqual([]);
    expect(
        getMatrix2dPossibleMappings(matrix2dSample),
    ).toStrictEqual(matrix2dPossibleMapping);
    expect(getMatrix1dPossibleMappings(undefined)).toStrictEqual([]);
    expect(
        getMatrix1dPossibleMappings(matrix1dSample),
    ).toStrictEqual(matrix1dPossibleMapping);
    expect(getOptionTypePossibleMappings(undefined)).toStrictEqual([]);
    expect(
        getOptionTypePossibleMappings(scaleSample),
    ).toStrictEqual(scalePossibleMapping);
    expect(getOrganigramPossibleMappings(undefined)).toStrictEqual([]);
    expect(
        getOrganigramPossibleMappings(organigramSample),
    ).toStrictEqual(organigramPossibleMapping);
});
