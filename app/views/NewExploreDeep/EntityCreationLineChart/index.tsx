import React, { useMemo, useCallback } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    ContainerCard,
} from '@the-deep/deep-ui';
import {
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Area,
    Tooltip,
} from 'recharts';

import {
    formatDate,
    formatMonth,
    formatYear,
    getTimeseriesWithoutGaps,
} from '#utils/temporal';

import ResolutionSelectInput from './ResolutionSelectInput';
import ChartTypeSelectInput from './ChartTypeSelectInput';

import styles from './styles.css';

type Timeseries = {
    date: string;
    count: number;
}

interface Props {
    className?: string;
    heading: string;
    timeseries: Timeseries[] | undefined;
}

function EntityCreationLineChart(props: Props) {
    const {
        className,
        heading,
        timeseries,
    } = props;

    const [resolution, setResolution] = React.useState<'year' | 'month' | 'day'>('day');
    const [chartType, setChartType] = React.useState<'step' | 'spark'>('spark');

    const timeFormatter = useMemo(() => {
        if (resolution === 'day') {
            return formatDate;
        }
        return resolution === 'month' ? formatMonth : formatYear;
    }, [resolution]);

    const timeseriesWithoutGaps = useMemo(
        () => getTimeseriesWithoutGaps(timeseries, resolution),
        [timeseries, resolution],
    );

    const timeSpentLabelFormatter = useCallback((value: number) => (
        [value, `Total ${heading}`]
    ), [heading]);

    return (
        <ContainerCard
            className={_cs(styles.entityCreationLineChart, className)}
            heading={heading}
            headingSize="extraSmall"
            spacing="loose"
            contentClassName={styles.content}
            headerActions={(
                <>
                    <ResolutionSelectInput
                        value={resolution}
                        onChange={setResolution}
                    />
                    <ChartTypeSelectInput
                        value={chartType}
                        onChange={setChartType}
                    />
                </>
            )}
            borderBelowHeaderWidth="thin"
            borderBelowHeader
        >
            <ResponsiveContainer className={styles.responsiveContainer}>
                <AreaChart
                    data={timeseriesWithoutGaps}
                >
                    <defs>
                        <linearGradient id="stat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--dui-color-accent)" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="var(--dui-color-accent)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        allowDuplicatedCategory={false}
                        tick={{ strokeWidth: 1 }}
                        tickFormatter={timeFormatter}
                        minTickGap={20}
                        interval="preserveStartEnd"
                        padding={{ left: 10, right: 30 }}
                        hide
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        type="number"
                        dataKey="total"
                        padding={{ top: 0, bottom: 0 }}
                        hide
                    />
                    <Tooltip
                        labelFormatter={timeFormatter}
                        formatter={timeSpentLabelFormatter}
                    />
                    <Area
                        type={chartType === 'step' ? 'step' : 'monotoneX'}
                        dataKey="total"
                        stroke="var(--dui-color-accent)"
                        fillOpacity={1}
                        fill="url(#stat)"
                        strokeWidth={2}
                        connectNulls
                        activeDot
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ContainerCard>
    );
}

export default EntityCreationLineChart;
