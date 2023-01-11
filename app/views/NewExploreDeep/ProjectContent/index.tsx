import React, { useMemo, useState } from 'react';
import {
    _cs,
    listToMap,
    isDefined,
    compareNumber,
} from '@togglecorp/fujs';
import {
    Tabs,
    Tab,
    ContainerCard,
    SegmentInput,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import {
    IoMapOutline,
    IoList,
    IoStatsChartSharp,
    IoTrendingUpSharp,
} from 'react-icons/io5';
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
    resolveTime,
    getTimestamps,
} from '#utils/temporal';
import { mergeItems } from '#utils/common';

import TableView from './TableView';
import MapView, { Projects as ProjectsByRegion } from './MapView';

import styles from './styles.css';

interface ResolutionOption {
    key: 'day' | 'month' | 'year';
    label: React.ReactNode;
}

const resolutionKeySelector = (d: ResolutionOption) => d.key;
const resolutionLabelSelector = (d: ResolutionOption) => d.label;

const resolutionOptions: ResolutionOption[] = [
    {
        key: 'day',
        label: 'D',
    },
    {
        key: 'month',
        label: 'M',
    },
    {
        key: 'year',
        label: 'Y',
    },
];

interface ChartTypeOption {
    key: 'step' | 'spark';
    label: React.ReactNode;
}
const chartTypeKeySelector = (d: ChartTypeOption) => d.key;
const chartTypeLabelSelector = (d: ChartTypeOption) => d.label;

const chartTypeOptions: ChartTypeOption[] = [
    {
        key: 'step',
        label: <IoStatsChartSharp />,
    },
    {
        key: 'spark',
        label: <IoTrendingUpSharp />,
    },
];

type Timeseries = {
    date: string;
    projectCount: number;
}

function timeSpentLabelFormatter(value: number) {
    return [value, 'Total projects'];
}

interface Props {
    className?: string;
    timeseries: Timeseries[] | undefined;
    projectsByRegion: ProjectsByRegion[] | undefined;
    readOnlyMode: boolean;
}

function ProjectContent(props: Props) {
    const {
        className,
        timeseries,
        projectsByRegion,
        readOnlyMode,
    } = props;
    console.warn('i am here', projectsByRegion);

    const [activeView, setActiveView] = useState<'map' | 'table' | undefined>('map');
    const [resolution, setResolution] = React.useState<'year' | 'month' | 'day'>('day');
    const [chartType, setChartType] = React.useState<'step' | 'spark'>('spark');

    const timeseriesData = useMemo(
        () => {
            const values = (timeseries ?? [])
                .filter((item) => isDefined(item.date))
                .map((item) => ({
                    date: resolveTime(item.date, resolution).getTime(),
                    total: item.projectCount,
                }))
                .filter((item) => item.total > 0);

            return mergeItems(
                values,
                (item) => String(item.date),
                (foo, bar) => ({
                    date: foo.date,
                    total: foo.total + bar.total,
                }),
            ).sort((a, b) => compareNumber(a.date, b.date));
        },
        [timeseries, resolution],
    );

    const timeFormatter = useMemo(() => {
        if (resolution === 'day') {
            return formatDate;
        }
        return resolution === 'month' ? formatMonth : formatYear;
    }, [resolution]);

    const timeseriesWithoutGaps = useMemo(
        () => {
            if (!timeseriesData || timeseriesData.length <= 0) {
                return [
                    {
                        total: 0,
                        date: resolveTime(new Date(), resolution).getTime(),
                    },
                ];
            }

            const mapping = listToMap(
                timeseriesData,
                (item) => new Date(item.date).getTime(),
                (item) => item.total,
            );

            const timestamps = getTimestamps(
                timeseriesData[0].date,
                timeseriesData[timeseriesData.length - 1].date,
                resolution,
            );

            return timestamps.map((item) => ({
                total: mapping[item] ?? 0,
                date: item,
            }));
        },
        [timeseriesData, resolution],
    );

    return (
        <div className={_cs(className, styles.projectContent)}>
            <Tabs
                // NOTE: Only showing map in readonly mode
                value={readOnlyMode ? 'map' : activeView}
                onChange={setActiveView}
            >
                {!readOnlyMode && (
                    <TabList className={styles.tabs}>
                        <Tab
                            name="table"
                            className={styles.tab}
                            transparentBorder
                        >
                            <IoList />
                        </Tab>
                        <Tab
                            name="map"
                            className={styles.tab}
                            transparentBorder
                        >
                            <IoMapOutline />
                        </Tab>
                    </TabList>
                )}
                <TabPanel name="table">
                    <TableView
                        filters={undefined}
                    />
                </TabPanel>
                <TabPanel name="map">
                    <MapView
                        projects={projectsByRegion}
                    />
                </TabPanel>
            </Tabs>
            <ContainerCard
                className={styles.chartContainer}
                heading="Newly Created Projects"
                headingSize="extraSmall"
                contentClassName={styles.content}
                headerActions={(
                    <>
                        <SegmentInput
                            className={className}
                            name={undefined}
                            onChange={setResolution}
                            options={resolutionOptions}
                            keySelector={resolutionKeySelector}
                            labelSelector={resolutionLabelSelector}
                            value={resolution}
                        />
                        <SegmentInput
                            className={className}
                            name={undefined}
                            onChange={setChartType}
                            options={chartTypeOptions}
                            keySelector={chartTypeKeySelector}
                            labelSelector={chartTypeLabelSelector}
                            value={chartType}
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
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            type="number"
                            dataKey="total"
                            padding={{ top: 0, bottom: 0 }}
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
        </div>
    );
}

export default ProjectContent;
