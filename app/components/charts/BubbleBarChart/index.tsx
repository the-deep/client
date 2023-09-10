import React, { useCallback, useMemo } from 'react';
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
import { getColorScaleFunction } from '#utils/colors';

import styles from './styles.css';

const resolutionToDateFormat = {
    day: 'dd MMM, yyyy',
    week: 'dd MMM, yyyy',
    month: 'MMM, yyyy',
    year: 'yyyy',
};

function defaultLabelSelector<T extends string | number>(item: T) { return item; }

interface Props<
    ITEM,
    CATEGORY,
    COUNT,
> {
    className?: string;
    variant?: 'bubble' | 'box';
    data: ITEM[] | undefined;
    categorySelector: (item: ITEM) => CATEGORY;
    dateSelector: (item: ITEM) => string;
    countSelector: (item: ITEM) => COUNT;
    colorSelector?: (item: number, min: number, max: number) => string;
    colors?: string[];
    startDate?: number;
    endDate?: number;
    type?: 'interpolate' | 'categorical';
    categoryLabelSelector?: (item: CATEGORY) => string;
}

function BubbleBarChart<
    ITEM,
    CATEGORY extends number | string,
    COUNT extends number,
>(props: Props<ITEM, CATEGORY, COUNT>) {
    const {
        className,
        variant = 'bubble',
        data = [],
        categorySelector,
        dateSelector,
        categoryLabelSelector = defaultLabelSelector,
        countSelector,
        colorSelector,
        startDate,
        endDate,
        colors = [
            '#f7fbff',
            '#08306b',
        ],
        type = 'interpolate',
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
        if (sortedData.length <= 0) {
            return 'day';
        }
        const firstDate = getDateSafe(startDate ?? dateSelector(sortedData[0]));
        const lastDate = getDateSafe(endDate ?? dateSelector(sortedData[sortedData.length - 1]));

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
        startDate,
        endDate,
        sortedData,
        dateSelector,
    ]);

    const finalData = useMemo(() => {
        if (sortedData.length <= 0) {
            return [];
        }
        const firstDate = getDateSafe(startDate ?? dateSelector(sortedData[0]));
        const lastDate = getDateSafe(endDate ?? dateSelector(sortedData[sortedData.length - 1]));

        const categories = unique(sortedData, categorySelector)
            .map((categoryItem) => {
                const itemsWithSelectedCategory = sortedData.filter(
                    (item) => (categorySelector(categoryItem) === categorySelector(item)),
                );
                return {
                    label: categoryLabelSelector(categorySelector(categoryItem)),
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
        startDate,
        endDate,
        categorySelector,
        categoryLabelSelector,
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

    const getColorForValue = useCallback((value: number) => {
        if (type === 'categorical' && colorSelector) {
            return colorSelector(value, 0, maxCount);
        }
        return getColorScaleFunction({
            min: 0,
            max: (maxCount === 0) ? 1 : maxCount,
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
                styles.bubbleBarChart,
                variant === 'box' && styles.boxChart,
            )}
        >
            {finalData.map((item) => (
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
                                backgroundColor: getColorForValue(countItem.total),
                                color: getColorOnBgColor(
                                    getColorForValue(countItem.total),
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
                                        backgroundColor: getColorForValue(countItem.total),
                                        width: countItem.total ? `${(countItem.total / maxCount) * 24 + 8}px` : undefined,
                                        height: countItem.total ? `${(countItem.total / maxCount) * 24 + 8}px` : undefined,
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
