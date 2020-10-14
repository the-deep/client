import React, { useMemo } from 'react';
import {
    _cs,
    compareDate,
} from '@togglecorp/fujs';
import {
    AreaChart,
    XAxis,
    YAxis,
    Tooltip,
    Area,
    ResponsiveContainer,
} from 'recharts';

import Icon from '#rscg/Icon';
import Message from '#rscv/Message';
import FormattedDate from '#rscv/FormattedDate';

import {
    ConnectorSourceStatistics,
    ConnectorSourceStatus,
} from '#typings';

import styles from './styles.scss';

interface OwnProps {
    title: string;
    className?: string;
    statistics: ConnectorSourceStatistics;
    status: ConnectorSourceStatus;
    totalLeads: number;
    lastCalculatedAt?: string;
    logo?: string;
}

const tickFormatter = (value: number | string) => {
    const date = new Date(value);
    return date.toDateString();
};

function ProjectConnectorSourceDetail(props: OwnProps) {
    const {
        status,
        title,
        className,
        statistics,
        totalLeads,
        logo,
        lastCalculatedAt,
    } = props;

    const convertedPublishedDates = useMemo(() => (
        statistics?.publishedDates?.map(pd => ({
            count: pd.count,
            date: (new Date(pd.date)).getTime(),
        })).sort((a, b) => compareDate(a.date, b.date))
    ), [statistics]);

    return (
        <div className={_cs(styles.sourceDetail, className)}>
            <header className={styles.header}>
                <div className={styles.imgContainer}>
                    { logo ? (
                        <img
                            className={styles.img}
                            alt={title}
                            src={logo}
                        />
                    ) : (
                        <Icon
                            className={styles.icon}
                            name="link"
                        />
                    )}
                </div>
                <h5 className={styles.heading}>
                    {title}
                </h5>
            </header>
            <div className={styles.content}>
                <div className={styles.detailsContainer}>
                    <div className={styles.updatedOn}>
                        <div className={styles.label}>
                            {/* FIXME: Use translation */}
                            Last updated on
                        </div>
                        <FormattedDate
                            className={styles.date}
                            value={lastCalculatedAt}
                            mode="dd-MM-yyyy"
                        />
                    </div>
                    <div className={styles.leadStatus}>
                        <div className={styles.value}>
                            { totalLeads }
                        </div>
                        <div className={styles.label}>
                            Leads
                        </div>
                    </div>
                </div>
                <div className={styles.chartContainer}>
                    {(status === 'processing' || !convertedPublishedDates || convertedPublishedDates.length === 0) ? (
                        <Message className={styles.emptyMessage}>
                            <Icon
                                name="barChart"
                                className={styles.icon}
                            />
                            {/* FIXME: Use translation */ }
                            Data not available for charts
                        </Message>
                    ) : (
                        <ResponsiveContainer className={styles.responsiveContainer}>
                            <AreaChart data={convertedPublishedDates} >
                                <defs>
                                    <linearGradient id="red" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    type="number"
                                    domain={['dataMin', 'dataMax']}
                                    hide
                                    tick={false}
                                />
                                <YAxis hide />
                                <Tooltip labelFormatter={tickFormatter} />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke={status === 'failure' ? 'var(--color-danger)' : 'var(--color-success)'}
                                    fillOpacity={1}
                                    fill={status === 'failure' ? 'url(#red)' : 'url(#green)'}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

ProjectConnectorSourceDetail.defaultProps = {
    className: undefined,
};

export default ProjectConnectorSourceDetail;
