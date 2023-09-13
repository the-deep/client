import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    compareNumber,
    listToMap,
    listToGroupList,
    sum,
    getColorOnBgColor,
} from '@togglecorp/fujs';
import {
    ContainerCard,
    NumberOutput,
} from '@the-deep/deep-ui';

import { getColorScaleFunction } from '#utils/colors';
import styles from './styles.css';

interface Props<
    T,
    ROW extends string | number,
    COLUMN extends string | number,
> {
    className?: string;
    data: T[] | undefined;
    rowSelector: (item: T) => ROW;
    columnSelector: (item: T) => COLUMN;
    countSelector: (item: T) => number;
    colorSelector?: (item: number, min: number, max: number) => string;
    heading?: string;
    rows: {
        key: ROW;
        label: string;
    }[];
    columns: {
        key: COLUMN;
        label: string;
    }[];
    colors?: string[];
    hideBarChart?: boolean;
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
        heading,
        columnSelector,
        countSelector,
        hideBarChart,
        rows,
        columns,
        colorSelector,
        colors = [
            '#f7fbff',
            '#08306b',
        ],
        type = 'interpolate',
    } = props;

    const finalData = useMemo(() => {
        const itemsGroupedByRow = listToGroupList(
            data ?? [],
            rowSelector,
            (item) => item,
        );
        const transformedData = rows.map((item) => {
            const countByCol = listToMap(
                itemsGroupedByRow[item.key] ?? [],
                columnSelector,
                countSelector,
            );
            const columnsForRow = columns.map((col) => countByCol[col.key] ?? 0);
            return {
                rowLabel: item.label,
                columnsForRow,
                total: sum(columnsForRow),
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
        rows,
        columns,
    ]);

    const maxCount = useMemo(() => (
        Math.max(...finalData.map((item) => item.columnsForRow).flat())
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
            max: maxCount === 0 ? 1 : maxCount,
        }, colors)(value);
    }, [
        type,
        colorSelector,
        maxCount,
        colors,
    ]);

    if (finalData.length === 0) {
        return null;
    }

    return (
        <ContainerCard
            className={_cs(
                className,
                styles.boxBarChart,
            )}
            heading={heading}
            headingSize="extraSmall"
            spacing="loose"
            contentClassName={styles.content}
            borderBelowHeader
            borderBelowHeaderWidth="thin"
        >
            <div className={styles.row}>
                <div />
                {columns.map((column) => (
                    <div
                        className={_cs(
                            styles.cell,
                            styles.topCell,
                            styles.box,
                        )}
                        key={column.key}
                    >
                        {column.label}
                    </div>
                ))}
                <div />
            </div>
            {finalData.map((item) => (
                <div
                    key={item.rowLabel}
                    className={styles.row}
                >
                    <div className={_cs(styles.cell, styles.label)}>
                        {item.rowLabel}
                    </div>
                    {item.columnsForRow.map((countItem, index) => {
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
                                <NumberOutput
                                    className={styles.numberOutput}
                                    value={countItem}
                                    precision={2}
                                />
                            </div>
                        );
                    })}
                    {!hideBarChart && (
                        <div className={_cs(styles.cell, styles.count)}>
                            <div
                                className={styles.bar}
                                title={`Total: ${item.total}`}
                                style={{
                                    width: `${(item.total / maxAmongEntities) * 100}%`,
                                }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </ContainerCard>
    );
}

export default BoxBarChart;
