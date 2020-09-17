import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    AreaChart,
    XAxis,
    YAxis,
    Tooltip,
    Area,
} from 'recharts';

import Message from '#rscv/Message';
import TextOutput from '#components/general/TextOutput';
import Image from '#rscv/Image';

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
    } = props;

    const convertedPublishedDates = useMemo(() => (
        statistics?.publishedDates?.map(pd => ({
            count: pd.count,
            date: (new Date(pd.date)).getTime(),
        }))
    ), [statistics]);

    return (
        <div className={_cs(styles.sourceDetail, className)}>
            <div className={styles.detailsContainer}>
                <Image
                    className={styles.imageContainer}
                    imageClassName={styles.image}
                    alt=""
                    src={logo}
                />
                <h3>{title}</h3>
                <TextOutput
                    label="Leads"
                    value={totalLeads}
                    type="block"
                />
            </div>
            <div className={styles.chartContainer}>
                {status === 'processing' ? (
                    <Message>
                        {/* FIXME: Use translation */ }
                        Processing...
                    </Message>
                ) : (
                    <AreaChart
                        width={240}
                        height={160}
                        data={convertedPublishedDates}
                    >
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
                            tick={false}
                        />
                        <YAxis />
                        <Tooltip labelFormatter={tickFormatter} />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke={status === 'failure' ? 'var(--color-danger)' : 'var(--color-success)'}
                            fillOpacity={1}
                            fill={status === 'failure' ? 'url(#red)' : 'url(#green)'}
                        />
                    </AreaChart>
                )}
            </div>
        </div>
    );
}

ProjectConnectorSourceDetail.defaultProps = {
    className: undefined,
};

export default ProjectConnectorSourceDetail;
