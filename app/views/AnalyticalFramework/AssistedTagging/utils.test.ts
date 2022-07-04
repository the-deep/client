import {
    Matrix2dWidget,
} from '#types/newAnalyticalFramework';

import {
    getMatrix2dPossibleMappings,
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
                        label: 'sub-col-1',
                    },
                    {
                        order: 2,
                        key: 'sub-col-2',
                        label: 'sub-col-2',
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
                        label: 'Sub row 1 1',
                        order: 1,
                    },
                    {
                        key: 'sub-row-1-2',
                        label: 'Sub row 1 2',
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
                        label: 'Sub row 2 1',
                        order: 1,
                    },
                    {
                        key: 'sub-row-2-2',
                        label: 'Sub row 2 2',
                        order: 2,
                    },
                    {
                        key: 'sub-row-2-3',
                        label: 'Sub row 2 3',
                        order: 3,
                    },
                ],
            },
        ],
    },
};

const matrix2dPossibleMapping = [
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
        label: 'sub-col-1',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_COLUMN',
            columnKey: 'column-1',
            subColumnKey: 'sub-col-1',
        },
    },
    {
        label: 'sub-col-2',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_COLUMN',
            columnKey: 'column-1',
            subColumnKey: 'sub-col-2',
        },
    },
    {
        label: 'sub-row-1-1',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_ROW',
            rowKey: 'row-1',
            subRowKey: 'sub-row-1-1',
        },
    },
    {
        label: 'sub-row-1-2',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_ROW',
            rowKey: 'row-1',
            subRowKey: 'sub-row-1-2',
        },
    },
    {
        label: 'sub-row-2-1',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_ROW',
            rowKey: 'row-2',
            subRowKey: 'sub-row-2-1',
        },
    },
    {
        label: 'sub-row-2-2',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_ROW',
            rowKey: 'row-2',
            subRowKey: 'sub-row-2-2',
        },
    },
    {
        label: 'sub-row-2-3',
        widget: '12',
        widgetType: 'MATRIX2D',
        association: {
            type: 'SUB_ROW',
            rowKey: 'row-2',
            subRowKey: 'sub-row-2-3',
        },
    },
].sort();

test('get matrix possible mappings', () => {
    expect(getMatrix2dPossibleMappings(undefined)).toStrictEqual([]);
    expect(getMatrix2dPossibleMappings(matrix2dSample)).toStrictEqual(matrix2dPossibleMapping.sort());
});
