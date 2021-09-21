import React, { useMemo } from 'react';
import { IoStatsChart } from 'react-icons/io5';
import {
    _cs,
    compareDate,
    listToGroupList,
} from '@togglecorp/fujs';
import {
    LineChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Line,
    ResponsiveContainer,
} from 'recharts';

import { Card } from '@the-deep/deep-ui';

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
                { (data?.activities?.length ?? 0) > 0 ? (
                    <LineChart>
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
                        {projectList.map((p, index) => (
                            <Line
                                dataKey="value"
                                data={p.data}
                                name={p.title}
                                key={p.id}
                                stroke={colorScheme[
                                    index % colorScheme.length
                                ]}
                                strokeWidth={2}
                                connectNulls
                                dot
                            />
                        ))}
                    </LineChart>
                ) : (
                    <div className={styles.emptyChart}>
                        <IoStatsChart
                            className={styles.icon}
                        />
                        <div className={styles.text}>
                            {/* FIXME: use strings with appropriate wording */}
                            Chart not available
                        </div>
                    </div>
                )}
            </ResponsiveContainer>
        </Card>
    );
}

export default Activity;
