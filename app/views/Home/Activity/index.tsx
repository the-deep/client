import React, { useMemo } from 'react';
import {
    _cs,
    compareDate,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    AreaChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Area,
    ResponsiveContainer,
} from 'recharts';

import {
    Card,
    Message,
    Kraken,
} from '@the-deep/deep-ui';

import RechartsLegend from '#components/RechartsLegend';
import {
    ProjectStatSummaryQuery,
} from '#generated/types';

import styles from './styles.css';

type RecentEntriesActivitiesType = NonNullable<NonNullable<ProjectStatSummaryQuery>['userProjectStatSummary']>['recentEntriesActivities'];
type ProjectDetailsType = NonNullable<
    NonNullable<ProjectStatSummaryQuery['userProjectStatSummary']>['recentEntriesProjectDetails']>;

function mergeItems<T>(
    list: T[],
    keySelector: (a: T) => number,
    merge: (a: T, b: T) => T,
) {
    const items: { [key: string]: T } = {
    };
    list.forEach((item) => {
        const key = keySelector(item);
        const oldItem = items[key];
        if (oldItem) {
            items[key] = merge(oldItem, item);
        } else {
            items[key] = item;
        }
    });
    return Object.values(items);
}

const colorScheme = [
    '#a6aff4',
    '#796ec6',
    '#fb8a91',
];

const minTickFormatter = (value: number | string) => {
    const date = new Date(value);
    const format: Intl.DateTimeFormatOptions = {
        dateStyle: 'medium',
    };
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('en-GB', format).format(date);
};

const dateFormatter = (value: number | string) => {
    const date = new Date(value);
    return date.toDateString();
};

interface Props {
    className?: string;
    data?: RecentEntriesActivitiesType;
    projectDetails?: ProjectDetailsType;
}

function Activity(props: Props) {
    const {
        className,
        data,
        projectDetails,
    } = props;

    const areaData = useMemo(
        () => {
            if (isNotDefined(data)) {
                return undefined;
            }

            const activitiesByDate: ({
                date: number;
                [key: string]: number;
            }[]) = data?.map((item) => ({
                [item.projectId]: item.count,
                date: new Date(item.date).getTime(),
            })) ?? [];

            return mergeItems(
                activitiesByDate,
                (item) => item.date,
                (foo, bar) => ({
                    ...foo,
                    ...bar,
                }),
            ).sort((a, b) => compareDate(a.date, b.date));
        },
        [data],
    );

    return (
        <Card className={_cs(className, styles.activity)}>
            <ResponsiveContainer className={styles.container}>
                {(areaData && areaData.length > 0) ? (
                    <AreaChart data={areaData}>
                        <defs>
                            {colorScheme.map((color) => (
                                <linearGradient
                                    key={color}
                                    id={`${color.substring(1)}-gradient`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={color}
                                        stopOpacity={0.2}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={color}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            ))}
                        </defs>
                        <XAxis
                            dataKey="date"
                            type="number"
                            scale="time"
                            domain={['dataMin', 'dataMax']}
                            allowDuplicatedCategory={false}
                            tick={{ strokeWidth: 1 }}
                            tickFormatter={minTickFormatter}
                            interval="preserveStartEnd"
                            padding={{ left: 10, right: 10 }}
                        />
                        <YAxis hide />
                        <Tooltip
                            labelFormatter={dateFormatter}
                            isAnimationActive={false}
                        />
                        <Legend
                            verticalAlign="top"
                            align="left"
                            content={RechartsLegend}
                        />
                        {projectDetails?.map((p, index) => {
                            const color = colorScheme[index % colorScheme.length];
                            const fillColorScheme = `${color.substring(1)}-gradient`;

                            return (
                                <Area
                                    key={String(p.id)}
                                    name={p.title}
                                    dataKey={String(p.id)}
                                    stroke={color}
                                    fillOpacity={1}
                                    fill={`url(#${fillColorScheme})`}
                                    strokeWidth={2}
                                    connectNulls
                                    activeDot
                                />
                            );
                        })}
                    </AreaChart>
                ) : (
                    <Message
                        icon={
                            <Kraken variant="sleep" />
                        }
                        message="Chart not available"
                    />
                )}
            </ResponsiveContainer>
        </Card>
    );
}

export default Activity;
