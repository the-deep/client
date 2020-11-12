import React from 'react';
import { EntrySummary } from '#typings/entry';
import ListView from '#rscv/List/ListView';
import _ts from '#ts';

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
    totalLeads: _ts('entries.qualityControl', 'totalLeads'),
    totalSources: _ts('entries.qualityControl', 'totalSources'),
    totalUniqueAuthors: _ts('entries.qualityControl', 'totalUniqueAuthors'),
    totalUnverifiedEntries: _ts('entries.qualityControl', 'totalUnverifiedEntries'),
    totalVerifiedEntries: _ts('entries.qualityControl', 'totalVerifiedEntries'),
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

    if (!stats) {
        return null;
    }
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

export default EntriesStats;
