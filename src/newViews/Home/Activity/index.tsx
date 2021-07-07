import React, { useMemo } from 'react';
import { IoStatsChart } from 'react-icons/io5';
import {
    _cs,
    compareDate,
    getHexFromString,
    listToMap,
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

import RechartsLegend from '#newComponents/ui/RechartsLegend';
import { ProjectRecentActivity } from '#typings';
import styles from './styles.scss';

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

    const projectMap = React.useMemo(() => listToMap(
        data?.projects ?? [],
        d => d.id,
        d => ({
            title: d.title,
            color: getHexFromString(d.title),
        }),
    ), [data]);

    const projectIdList = Object.keys(projectMap);
    const renderData = useMemo(() => (
        data?.activities.map(a => ({
            date: new Date(a.date).getTime(),
            value: a.count,
        })).sort((a, b) => compareDate(a.date, b.date)) ?? []
    ), [data]);

    return (
        <Card className={_cs(className, styles.activity)}>
            { renderData.length > 0 ? (
                <ResponsiveContainer className={styles.container}>
                    <LineChart data={renderData}>
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
                        <Tooltip labelFormatter={dateFormatter} />
                        <Legend
                            verticalAlign="top"
                            align="left"
                            content={RechartsLegend}
                        />
                        {projectIdList.map(p => (
                            <Line
                                dataKey="value"
                                name={projectMap[p].title}
                                key={projectMap[p].title}
                                stroke={projectMap[p].color}
                                strokeWidth={2}
                                connectNulls
                                dot
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
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
        </Card>
    );
}

export default Activity;
