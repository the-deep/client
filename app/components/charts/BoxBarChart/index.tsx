import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    unique,
    compareNumber,
    listToMap,
    listToGroupList,
    sum,
    getColorOnBgColor,
} from '@togglecorp/fujs';

import { getColorScaleFunction } from '#utils/colors';
import styles from './styles.css';

interface Props<
    T,
    ROW extends string | number,
    COLUMN extends string | number,
> {
    className?: string;
    data: T[];
    rowSelector: (item: T) => ROW;
    columnSelector: (item: T) => COLUMN;
    countSelector: (item: T) => number;
    colorSelector?: (item: number, min: number, max: number) => string;
    colors?: string[];
    type?: 'interpolate' | 'categorical';
}

function BoxBarChart<
    T,
    ROW extends string | number,
    COLUMN extends string | number,
>(props: Props<T, ROW, COLUMN>) {
    const {
        className,
        data,
        rowSelector,
        columnSelector,
        countSelector,
        colorSelector,
        colors = [
            '#f7fbff',
            '#08306b',
        ],
        type = 'interpolate',
    } = props;

    const allColumns = useMemo(() => (
        unique(data.map(columnSelector))
    ), [
        data,
        columnSelector,
    ]);

    const finalData = useMemo(() => {
        const itemsGroupedByRow = listToGroupList(
            data,
            rowSelector,
            (item) => item,
        );
        const transformedData = Object.keys(itemsGroupedByRow).map((item) => {
            const countByCol = listToMap(
                itemsGroupedByRow[item],
                columnSelector,
                countSelector,
            );
            const columns = allColumns.map((col) => countByCol[col] ?? 0);
            return {
                rowLabel: item,
                columns,
                total: sum(columns),
            };
        });
        const sortedData = [...transformedData];
        sortedData.sort((a, b) => compareNumber(a.total, b.total, -1));

        return sortedData;
    }, [
        columnSelector,
        countSelector,
        rowSelector,
        data,
        allColumns,
    ]);

    const maxCount = useMemo(() => (
        Math.max(...finalData.map((item) => item.columns).flat())
    ), [finalData]);

    const maxAmongEntities = useMemo(() => (
        Math.max(...finalData.map((item) => item.total))
    ), [finalData]);

    const getColorForValue = useCallback((value: number) => {
        if (type === 'categorical' && colorSelector) {
            return colorSelector(value, 0, maxCount);
        }
        return getColorScaleFunction({
            min: 0,
            max: maxCount,
        }, colors)(value);
    }, [
        type,
        colorSelector,
        maxCount,
        colors,
    ]);

    return (
        <div
            className={_cs(
                className,
                styles.boxBarChart,
            )}
        >
            <div className={styles.row}>
                <div />
                {allColumns.map((columnLabel) => (
                    <div
                        className={_cs(
                            styles.cell,
                            styles.topCell,
                            styles.box,
                        )}
                        key={columnLabel}
                    >
                        {columnLabel}
                    </div>
                ))}
                <div />
            </div>
            {finalData?.map((item) => (
                <div
                    key={item.rowLabel}
                    className={styles.row}
                >
                    <div className={_cs(styles.cell, styles.label)}>
                        {item.rowLabel}
                    </div>
                    {item.columns.map((countItem, index) => {
                        const bgColor = getColorForValue(countItem);

                        return (
                            <div
                                className={_cs(styles.box, styles.cell)}
                                // eslint-disable-next-line react/no-array-index-key
                                key={`${countItem}-${index}`}
                                style={{
                                    backgroundColor: bgColor,
                                    color: getColorOnBgColor(bgColor, '#515151', '#f0f0f0'),
                                }}
                            >
                                {countItem}
                            </div>
                        );
                    })}
                    <div className={_cs(styles.cell, styles.count)}>
                        <div
                            className={styles.bar}
                            title={`Total: ${item.total}`}
                            style={{
                                width: `${(item.total / maxAmongEntities) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default BoxBarChart;
