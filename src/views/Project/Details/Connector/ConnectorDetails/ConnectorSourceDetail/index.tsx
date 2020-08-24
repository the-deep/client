import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    AreaChart,
    XAxis,
    YAxis,
    Tooltip,
    Area,
} from 'recharts';

import TextOutput from '#components/general/TextOutput';

import { PublishedDateCount } from '#typings';

import styles from './styles.scss';

interface OwnProps {
    title: string;
    noOfLeads: number;
    className?: string;
    broken?: boolean;
    publishedDates?: PublishedDateCount[];
}

const tickFormatter = (value: number | string) => {
    const date = new Date(value);
    return date.toDateString();
};

function ProjectConnectorSourceDetail(props: OwnProps) {
    const {
        noOfLeads,
        broken,
        title,
        className,
        publishedDates,
    } = props;

    const convertedPublishedDates = useMemo(() => (
        publishedDates?.map(pd => ({
            count: pd.count,
            date: (new Date(pd.date)).getTime(),
        }))
    ), [publishedDates]);

    return (
        <div className={_cs(styles.sourceDetail, className)}>
            <div className={styles.detailsContainer}>
                {title}
                <TextOutput
                    label="Leads"
                    value={noOfLeads}
                    type="block"
                />
            </div>
            <div className={styles.chartContainer}>
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
                        stroke={broken ? 'var(--color-danger)' : 'var(--color-success)'}
                        fillOpacity={1}
                        fill={broken ? 'url(#red)' : 'url(#green)'}
                    />
                </AreaChart>
            </div>
        </div>
    );
}

ProjectConnectorSourceDetail.defaultProps = {
    className: undefined,
    broken: false,
    publishedDates: undefined,
};

export default ProjectConnectorSourceDetail;
