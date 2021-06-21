import React, { useMemo, useCallback } from 'react';
import { mapToList } from '@togglecorp/fujs';
import { EntrySummary } from '#typings';
import {
    ListView,
    InformationCard,
} from '@the-deep/deep-ui';
import _ts from '#ts';

interface Stats {
    key: string;
    label: string;
    value: number;
}

type EntriesStatsKeys = Omit<EntrySummary, 'orgTypeCount' | 'countPerTocItem'>;

const entriesStatsLabelMap: { [ key in (keyof EntriesStatsKeys)]: string } = {
    totalLeads: _ts('entriesStats', 'totalLeads'),
    totalSources: _ts('entriesStats', 'totalSources'),
    totalUnverifiedEntries: _ts('entriesStats', 'totalUnverifiedEntries'),
    totalVerifiedEntries: _ts('entriesStats', 'totalVerifiedEntries'),
};
const statsKeySelector = (d: Stats) => d.key;

interface Props {
    className?: string;
    stats?: EntrySummary;
}

function EntriesStats(props: Props) {
    const {
        className,
        stats,
    } = props;

    const statsList: Stats[] = useMemo(() =>
        mapToList(
            entriesStatsLabelMap,
            (e, k) => ({
                key: k.toString(),
                label: e,
                value: stats ? stats[k as keyof EntriesStatsKeys] : 0,
            }),
        ),
    [stats]);

    const statsRendererParams = useCallback((_: string, data: Stats) => ({
        label: data.label,
        value: data.value,
        variant: 'complement1' as const, // FIXME change to matching variant when available
        coloredBackground: true,
    }), []);

    return (
        <ListView
            className={className}
            data={statsList}
            keySelector={statsKeySelector}
            renderer={InformationCard}
            rendererParams={statsRendererParams}
        />
    );
}

export default EntriesStats;
