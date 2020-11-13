import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { EntrySummary } from '#typings/entry';
import ListView from '#rscv/List/ListView';
import _ts from '#ts';

import styles from './styles.css';

interface Stats {
    id: string;
    title: string;
    value?: number;
}

type StaticEntrySummary = Omit<EntrySummary, 'orgTypeCount'>;

const staticEntryStatTitles: { [ key in (keyof StaticEntrySummary)]: string } = {
    totalLeads: _ts('entries.qualityControl', 'totalLeads'),
    totalSources: _ts('entries.qualityControl', 'totalSources'),
    totalUnverifiedEntries: _ts('entries.qualityControl', 'totalUnverifiedEntries'),
    totalVerifiedEntries: _ts('entries.qualityControl', 'totalVerifiedEntries'),
};

interface EntryStatProps {
    title: string;
    value: number;
    max: number;
    className?: string;
}

function EntryStat({
    title,
    value = 0,
    max,
}: EntryStatProps) {
    const weight = value / max;
    const saturation = Math.min(100, 100 * weight);

    return (
        <div
            className={styles.stat}
            style={{
                filter: `grayscale(${100 - saturation}%)`,
            }}
        >
            <div className={styles.value}>
                {value}
            </div>
            <div className={styles.title}>
                {title}
            </div>
        </div>
    );
}

const statsKeySelector = (d: Stats) => d.id;
const defaultStats: EntrySummary = {
    totalLeads: 0,
    totalSources: 0,
    totalUnverifiedEntries: 0,
    totalVerifiedEntries: 0,
    orgTypeCount: [],
};

interface ComponentProps {
    className?: string;
    stats?: EntrySummary;
}

function EntriesStats(props: ComponentProps) {
    const {
        stats = defaultStats,
        className,
    } = props;

    const {
        orgTypeCount,
        ...staticStats
    } = stats;

    const statsList: Stats[] = Object.entries({ ...staticStats }).map(([k, v]) => ({
        id: k,
        title: staticEntryStatTitles[k as keyof StaticEntrySummary],
        value: v,
    }));

    orgTypeCount.forEach((orgType) => {
        statsList.push({
            id: String(orgType.org.id),
            title: orgType.org.shortName ?? orgType.org.title,
            value: orgType.count,
        });
    });

    const max = Math.max(...statsList.map(d => d.value || 0));
    const statsRendererParams = (_: string, d: Stats) => ({
        ...d,
        max,
    } as EntryStatProps);

    return (
        <ListView
            className={_cs(className, styles.entriesStats)}
            renderer={EntryStat}
            data={statsList}
            keySelector={statsKeySelector}
            rendererParams={statsRendererParams}
        />
    );
}

export default EntriesStats;
