import React, { useMemo } from 'react';
import {
    _cs,
    unique,
    sum,
    compareNumber,
    compareDate,
    getColorOnBgColor,
} from '@togglecorp/fujs';
import { DateOutput } from '@the-deep/deep-ui';

import {
    getTimeseriesWithoutGaps,
    getDateSafe,
    type Resolution,
} from '#utils/temporal';
import { hslToHex } from '#utils/common';
import styles from './styles.css';

const resolutionToDateFormat = {
    day: 'dd MMM, yyyy',
    week: 'dd MMM, yyyy',
    month: 'MMM, yyyy',
    year: 'yyyy',
};

interface Props<
    ITEM,
    CATEGORY,
    COUNT,
> {
    className?: string;
    variant?: 'bubble' | 'box';
    data: ITEM[];
    categorySelector: (item: ITEM) => CATEGORY;
    dateSelector: (item: ITEM) => string;
    countSelector: (item: ITEM) => COUNT;
}

function BubbleBarChart<
    ITEM,
    CATEGORY extends number | string,
    COUNT extends number,
>(props: Props<ITEM, CATEGORY, COUNT>) {
    const {
        className,
        variant = 'bubble',
        data,
        categorySelector,
        dateSelector,
        countSelector,
    } = props;

    const sortedData = useMemo(() => {
        const newData = [...data];
        newData.sort((a, b) => compareDate(dateSelector(a), dateSelector(b)));
        return newData;
    }, [
        data,
        dateSelector,
    ]);

    const resolution: Resolution = useMemo(() => {
        const firstDate = getDateSafe(dateSelector(sortedData[0]));
        const lastDate = getDateSafe(dateSelector(sortedData[sortedData.length - 1]));

        const noOfDaysBetweenDates = (
            lastDate.getTime() - firstDate.getTime()
        ) / (24 * 60 * 60 * 1000);

        if (noOfDaysBetweenDates < 20) {
            return 'day';
        }
        if (noOfDaysBetweenDates < 100) {
            return 'week';
        }
        if (noOfDaysBetweenDates < 720) {
            return 'month';
        }
        return 'year';
    }, [
        sortedData,
        dateSelector,
    ]);

    const finalData = useMemo(() => {
        const firstDate = dateSelector(sortedData[0]);
        const lastDate = dateSelector(sortedData[sortedData.length - 1]);

        const categories = unique(sortedData, categorySelector)
            .map((categoryItem) => {
                const itemsWithSelectedCategory = sortedData.filter(
                    (item) => (categorySelector(categoryItem) === categorySelector(item)),
                );
                return {
                    label: categorySelector(categoryItem),
                    total: sum(itemsWithSelectedCategory.map(countSelector)),
                    timeseries: getTimeseriesWithoutGaps(
                        // FIXME: Send selectors to this function as well
                        itemsWithSelectedCategory.map((item) => ({
                            date: dateSelector(item),
                            count: countSelector(item),
                        })),
                        resolution,
                        firstDate,
                        lastDate,
                    ),
                };
            });

        const sortedCategories = [...categories];
        sortedCategories.sort((a, b) => compareNumber(a.total, b.total, -1));

        return sortedCategories;
    }, [
        categorySelector,
        resolution,
        countSelector,
        dateSelector,
        sortedData,
    ]);

    const maxCount = useMemo(() => (
        Math.max(...finalData.map((item) => item.timeseries).flat().map((item) => item.total))
    ), [finalData]);

    const maxAmongEntities = useMemo(() => (
        Math.max(...finalData.map((item) => item.total))
    ), [finalData]);

    return (
        <div
            className={_cs(
                className,
                styles.bubbleBarChart,
                variant === 'box' && styles.boxChart,
            )}
        >
            {finalData?.map((item) => (
                <div
                    key={item.label}
                    className={styles.row}
                >
                    <div className={_cs(styles.cell, styles.label)}>
                        {item.label}
                    </div>
                    {item.timeseries.map((countItem) => (variant === 'box' ? (
                        <div
                            className={_cs(styles.cell, styles.box)}
                            style={{
                                backgroundColor: `hsl(228, 78%, ${(100 - (countItem.total / maxCount) * 46)}%)`,
                                color: getColorOnBgColor(
                                    hslToHex(228, 78, (100 - (countItem.total / maxCount) * 46)),
                                ),
                            }}
                            key={countItem.date}
                        >
                            {countItem.total}
                        </div>
                    ) : (
                        <div
                            className={_cs(styles.cell, styles.circleContainer)}
                            key={countItem.date}
                        >
                            <div className={styles.circle}>
                                <div
                                    title={String(countItem.total)}
                                    style={{
                                        backgroundColor: 'var(--dui-color-accent)',
                                        width: `${(countItem.total / maxCount) * 32}px`,
                                        height: `${(countItem.total / maxCount) * 32}px`,
                                        borderRadius: '50%',
                                    }}
                                />
                            </div>
                        </div>
                    )))}
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
            <div className={_cs(styles.row, styles.bottomRow)}>
                <div />
                {finalData?.[0]?.timeseries.map((countItem) => (
                    <div
                        className={_cs(
                            styles.cell,
                            styles.circleContainer,
                            styles.bottomCell,
                        )}
                        key={countItem.date}
                    >
                        <DateOutput
                            value={countItem.date}
                            format={resolutionToDateFormat[resolution]}
                        />
                    </div>
                ))}
                <div />
            </div>
        </div>
    );
}

export default BubbleBarChart;
