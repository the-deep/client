import { isDefined } from '@togglecorp/fujs';

import { WidgetType } from '#generated/types';
import { breadcrumb } from '#utils/common';
import {
    Matrix1dWidget,
    Matrix2dWidget,
} from '#types/newAnalyticalFramework';

export type MatrixPillarWidgetType = Pick<WidgetType, 'id' | 'title' | 'properties' | 'widgetId'>;

export type MatrixPillar = {
    // id refers to current pillar/sector's unique key
    id: string;
    title: string;
    uniqueId: string;
    // Key refers to parent widget's unique key
    key?: string;
    altTitle?: string;
    children?: MatrixPillar[];
};

export function getMatrixPillars(widgets: MatrixPillarWidgetType[]): MatrixPillar[] {
    const matrix1dList = widgets.filter((widget) => widget.widgetId === 'MATRIX1D') as Matrix1dWidget[];
    const matrix2dList = widgets.filter((widget) => widget.widgetId === 'MATRIX2D') as Matrix2dWidget[];

    const matrix1dItems = matrix1dList.map((widget) => {
        const {
            key,
            title,
            properties,
        } = widget;

        if (!properties) {
            return undefined;
        }

        const { rows } = properties;
        const transformedRows = rows.map((row) => {
            const {
                key: rowKey,
                label: rowTitle,
                cells,
            } = row;

            const transformedCells = cells.map(({
                key: cellKey,
                label,
            }) => ({
                id: cellKey,
                key,
                title: label,
                altTitle: breadcrumb([title, rowTitle, label]),
                uniqueId: `${key}-${cellKey}`,
            }));

            return ({
                id: rowKey,
                key,
                title: rowTitle,
                altTitle: breadcrumb([title, rowTitle]),
                children: transformedCells,
                uniqueId: `${key}-${rowKey}`,
            });
        });

        return ({
            id: key,
            title,
            children: transformedRows,
            uniqueId: key,
        });
    });
    const matrix2dItems = matrix2dList.map((widget) => {
        const {
            key,
            title,
            properties,
        } = widget;

        if (!properties) {
            return undefined;
        }
        const {
            rows,
            columns,
        } = properties;
        const rowKey = `${key}-rows`;
        const columnKey = `${key}-columns`;
        const transformedRows = rows.map((row) => {
            const {
                key: rowId,
                label: rowTitle,
                subRows,
            } = row;

            const transformedSubRows = subRows.map(
                ({
                    key: subRowId,
                    label: subRowTitle,
                }) => ({
                    id: subRowId,
                    key: rowKey,
                    title: subRowTitle,
                    altTitle: breadcrumb([title, rowTitle, subRowTitle]),
                    uniqueId: `${rowKey}-${subRowId}`,
                }),
            );

            return ({
                id: rowId,
                key: rowKey,
                title: rowTitle,
                altTitle: breadcrumb([title, rowTitle]),
                children: transformedSubRows,
                uniqueId: `${rowKey}-${rowId}`,
            });
        });

        const transformedColumns = columns.map((column) => {
            const {
                key: columnId,
                label: columnTitle,
                subColumns,
            } = column;

            const transformedSubColumns = subColumns.map(
                ({
                    key: subColumnId,
                    label: subColumnTitle,
                }) => ({
                    id: subColumnId,
                    key: columnKey,
                    title: subColumnTitle,
                    altTitle: breadcrumb([title, columnTitle, subColumnTitle]),
                    uniqueId: `${columnKey}-${subColumnId}`,
                }),
            );

            return ({
                id: columnId,
                key: columnKey,
                title: columnTitle,
                altTitle: breadcrumb([title, columnTitle]),
                children: transformedSubColumns,
                uniqueId: `${columnKey}-${columnId}`,
            });
        });

        return {
            id: key,
            title,
            uniqueId: key,
            children: [
                {
                    id: 'rows',
                    title: 'rows',
                    children: transformedRows,
                    uniqueId: 'rows',
                },
                {
                    id: 'columns',
                    title: 'columns',
                    children: transformedColumns,
                    uniqueId: 'columns',
                },
            ],
        };
    });

    return [
        ...matrix1dItems,
        ...matrix2dItems,
    ].filter(isDefined);
}
