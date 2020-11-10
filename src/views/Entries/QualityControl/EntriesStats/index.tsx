import React from 'react';
import { EntrySummary } from '#typings/entry';
import ListView from '#rscv/List/ListView';

import styles from './styles.css';

interface ComponentProps {
    stats?: EntrySummary;
}

interface Stats {
    id: string;
    title: string;
    value?: number;
}

const entryStats: { [ key in (keyof EntrySummary)]: string } = {
    totalLeads: 'Total Leads',
    totalSources: 'Total Sources',
    totalUniqueAuthors: 'Total Unique Authours',
    totalUnverifiedEntries: 'Total Unverified Entries',
    totalVerifiedEntries: 'Total Verified Entries',
};

function EntryStat({ title, value }: Stats) {
    return (
        <div className={styles.stat}>
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
        </div>
    );
}

function EntriesStats(props: ComponentProps) {
    const {
        stats,
    } = props;

    if (stats) {
        const statsList: Stats[] = Object.entries(stats).map(([k, v]) => ({
            id: k,
            title: entryStats[k as keyof EntrySummary],
            value: v,
        }));

        const statsKeySelector = (d: Stats) => d.id;
        const statsRendererParams = (_: string, d: Stats) => d;

        return (
            <div>
                <ListView
                    className={styles.stats}
                    renderer={EntryStat}
                    data={statsList}
                    keySelector={statsKeySelector}
                    rendererParams={statsRendererParams}
                />
            </div>
        );
    }
    return (null);
}

export default EntriesStats;
