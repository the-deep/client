import React, { useMemo } from 'react';
import {
    _cs,
    compareDate,
    listToGroupList,
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
import { ProjectRecentActivity } from '#types';

import styles from './styles.css';

const colorScheme = [
    '#a6aff4',
    '#796ec6',
    '#fb8a91',
];

interface Props {
    className?: string;
    data?: ProjectRecentActivity;
}

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

function Activity(props: Props) {
    const {
        className,
        data,
    } = props;

    const projectList = useMemo(() => {
        const sortedActivities = data?.activities.map((a) => ({
            date: new Date(a.date).getTime(),
            value: a.count,
            project: a.project,
        })).sort((a, b) => compareDate(a.date, b.date)) ?? [];

        const groupedList = listToGroupList(sortedActivities, (d) => d.project, (d) => d);
        return data?.projects.map((d) => ({
            id: d.id,
            title: d.title,
            data: groupedList[d.id],
        })) ?? [];
    }, [data]);

    return (
        <Card className={_cs(className, styles.activity)}>
            <ResponsiveContainer className={styles.container}>
                {((data?.activities?.length ?? 0) > 0) ? (
                    <AreaChart>
                        <defs>
                            {colorScheme.map((color) => (
                                <linearGradient
                                    id={`${color.substring(1)}-gradient`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
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
                        <YAxis
                            dataKey="value"
                            hide
                        />
                        <Tooltip
                            labelFormatter={dateFormatter}
                            isAnimationActive={false}
                        />
                        <Legend
                            verticalAlign="top"
                            align="left"
                            content={RechartsLegend}
                        />
                        {projectList.map((p, index) => {
                            const color = colorScheme[index % colorScheme.length];
                            const fillColorScheme = `${color.substring(1)}-gradient`;

                            return (
                                <Area
                                    key={p.id}
                                    data={p.data}
                                    name={p.title}
                                    dataKey="value"
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
