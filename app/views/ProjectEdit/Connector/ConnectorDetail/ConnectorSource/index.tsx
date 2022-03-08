import React, { useMemo } from 'react';
import {
    _cs,
    sum,
    compareDate,
    isDefined,
} from '@togglecorp/fujs';
import {
    InformationCard,
    TextOutput,
    DateOutput,
    Container,
    ContainerCard,
    Message,
    Kraken,
} from '@the-deep/deep-ui';
import {
    CartesianGrid,
    AreaChart,
    XAxis,
    YAxis,
    Tooltip,
    Area,
    ResponsiveContainer,
} from 'recharts';

import { Source } from '../index';

import styles from './styles.css';

const tickFormatter = (value: number | string) => {
    const date = new Date(value);
    return date.toDateString();
};

const minTickFormatter = (value: number | string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
};

interface Props {
    className?: string;
    source: Source;
    isActive: boolean | undefined;
}

function ConnectorSource(props: Props) {
    const {
        className,
        source,
        isActive,
    } = props;

    const convertedSourceActivity = useMemo(() => (
        source.stats?.map((stat) => ({
            count: stat?.count,
            date: stat?.date ? (new Date(stat.date)).getTime() : undefined,
        })).sort((a, b) => compareDate(a.date, b.date))
    ), [source.stats]);

    const {
        last7DaysCount,
        last30DaysCount,
    } = useMemo(() => {
        const date = new Date().getTime();
        const sevenDaysAgo = date - 24 * 60 * 60 * 1000 * 7;
        const thirtyDaysAgo = date - 24 * 60 * 60 * 1000 * 30;

        const temp7Count = sum(
            (convertedSourceActivity ?? [])
                .filter((stat) => (stat.date ?? 0) >= sevenDaysAgo)
                .map((stat) => stat.count)
                .filter(isDefined),
        );

        const temp30Count = sum(
            (convertedSourceActivity ?? [])
                .filter((stat) => (stat.date ?? 0) >= thirtyDaysAgo)
                .map((stat) => stat.count)
                .filter(isDefined),
        );

        return {
            last7DaysCount: temp7Count,
            last30DaysCount: temp30Count,
        };
    }, [convertedSourceActivity]);

    return (
        <ContainerCard
            className={_cs(
                className,
                styles.connectorSource,
                !isActive && styles.inactive,
            )}
            headingSize="small"
            headingClassName={styles.heading}
            heading={source.title}
            headingDescription={(
                <TextOutput
                    label="Last updated on"
                    value={(
                        <DateOutput
                            value={source.lastFetchedAt}
                        />
                    )}
                />
            )}
        >
            <div className={styles.chartContainer}>
                {((convertedSourceActivity?.length ?? 0) > 0) ? (
                    <ResponsiveContainer className={styles.responsiveContainer}>
                        <AreaChart data={convertedSourceActivity}>
                            <defs>
                                <linearGradient id="stat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--dui-color-accent)" stopOpacity={0.2} />
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
                                tickFormatter={minTickFormatter}
                                interval="preserveStartEnd"
                                padding={{ left: 10, right: 10 }}
                            />
                            <YAxis hide />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip
                                labelFormatter={tickFormatter}
                                isAnimationActive={false}
                            />
                            <Area
                                name="Number of Items"
                                dataKey="count"
                                stroke="var(--dui-color-accent)"
                                fillOpacity={1}
                                fill="url(#stat)"
                                strokeWidth={2}
                                connectNulls
                                activeDot
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <Message
                        pendingContainerClassName={styles.pending}
                        icon={
                            <Kraken variant="sleep" />
                        }
                        message="This connector does not have any sources fetched."
                        pending={isActive && source.status === 'PROCESSING'}
                        pendingMessage="DEEP is currently fetching sources from this portal."
                        errored={source.status === 'FAILURE'}
                        erroredEmptyMessage="DEEP was unable to fetch sources from this portal."
                        erroredEmptyIcon={
                            <Kraken variant="fat" />
                        }
                    />
                )}
            </div>
            <Container
                className={styles.infoContainers}
                heading="Sources found"
                headingSize="extraSmall"
                spacing="compact"
                contentClassName={styles.infoContainersContent}
            >
                <InformationCard
                    className={styles.info}
                    variant="accent"
                    label="Last 7 days"
                    valuePrecision={0}
                    value={last7DaysCount}
                />
                <InformationCard
                    className={styles.info}
                    variant="accent"
                    label="Last 30 days"
                    valuePrecision={0}
                    value={last30DaysCount}
                />
            </Container>
        </ContainerCard>
    );
}

export default ConnectorSource;
