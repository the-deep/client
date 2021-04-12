import React, { useMemo } from 'react';

import {
    LineChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Line,
    ResponsiveContainer,
} from 'recharts';

import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    ProjectRecentActivity,
} from '#typings';
import { _cs, compareDate, getHexFromString } from '@togglecorp/fujs';
import styles from './styles.scss';

interface Props {
    className?: string;
    pending: boolean;
    recentActivity?: ProjectRecentActivity;
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

const colors = ['#1A3ED0', '#008EFF', '#00C9F0', '#FFB443', '#333', '4f4f4f', '#828282'];

function Activity(props: Props) {
    const {
        className,
        pending,
        recentActivity,
    } = props;

    const data = useMemo(() => recentActivity?.projects.map((v, i) => ({
        title: v.title,
        color: colors[i] ?? getHexFromString(v.title),
        data: recentActivity?.activities.filter(a => a.project === v.id)
            .map(a => ({
                date: new Date(a.date).getTime(),
                value: a.count,
            }))
            .sort((a, b) => compareDate(a.date, b.date)),
    })) ?? [], [recentActivity]);

    return (
        <div className={_cs(className, styles.activity)}>
            {pending && <LoadingAnimation />}
            <ResponsiveContainer className={styles.container}>
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
                    />
                    <Legend
                        verticalAlign="top"
                        align="center"
                    />
                    {data.map(s => (
                        <Line
                            dataKey="value"
                            data={s.data}
                            name={s.title}
                            key={s.title}
                            stroke={s.color}
                            strokeWidth={2}
                            connectNulls
                            dot
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default Activity;
