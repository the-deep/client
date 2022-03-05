import React, { useMemo } from 'react';
import {
    _cs,
    compareDate,
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

// TODO: Remove this after we get stats from server
const sourceActivity = [
    {
        date: '2020-02-03',
        count: 35,
    },
    {
        date: '2020-02-05',
        count: 2,
    },
    {
        date: '2020-02-09',
        count: 20,
    },
];

interface Props {
    className?: string;
    source: Source;
}

function ConnectorSource(props: Props) {
    const {
        className,
        source,
    } = props;

    const convertedSourceActivity = useMemo(() => (
        sourceActivity?.map((activity) => ({
            count: activity.count,
            date: activity.date ? (new Date(activity.date)).getTime() : undefined,
        })).sort((a, b) => compareDate(a.date, b.date))
    ), []);

    return (
        <ContainerCard
            className={_cs(className, styles.connectorSource)}
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
                <ResponsiveContainer className={styles.responsiveContainer}>
                    {((convertedSourceActivity?.length ?? 0) > 0) ? (
                        <AreaChart data={convertedSourceActivity}>
                            <defs>
                                <linearGradient id="activity" x1="0" y1="0" x2="0" y2="1">
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
                                fill="url(#activity)"
                                strokeWidth={2}
                                connectNulls
                                activeDot
                            />
                        </AreaChart>
                    ) : (
                        <Message
                            icon={
                                <Kraken variant="sleep" />
                            }
                            message="This connector does not have any sources fetched."
                        />
                    )}
                </ResponsiveContainer>
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
                    label="This week"
                    valuePrecision={0}
                    // FIXME: Fetch this from server
                    value={20}
                />
                <InformationCard
                    className={styles.info}
                    variant="accent"
                    label="This month"
                    valuePrecision={0}
                    // FIXME: Fetch this from server
                    value={26}
                />
            </Container>
        </ContainerCard>
    );
}

export default ConnectorSource;
