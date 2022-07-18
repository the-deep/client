import React, { useMemo } from 'react';
import { _cs, doesObjectHaveNoData } from '@togglecorp/fujs';
import { IoBookmarks, IoDocument } from 'react-icons/io5';
import { Card } from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';

import ProgressLine from '#components/ProgressLine';
import StatsInformationCard from '#components/StatsInformationCard';
import {
    PartialFormType as PartialFilterFormType,
    FormType as FilterFormType,
} from '#components/leadFilters/SourcesFilter/schema';
import { getProjectSourcesQueryVariables } from '#components/leadFilters/SourcesFilter';
import {
    ProjectSourceStatsQuery,
    ProjectSourceStatsQueryVariables,
    LeadsFilterDataInputType,
} from '#generated/types';
import { calcPercent } from '#utils/common';
import _ts from '#ts';

import styles from './styles.css';

const PROJECT_SOURCE_STATS = gql`
    query ProjectSourceStats(
        $projectId: ID!,
        $filters: LeadsFilterDataInputType,
    ) {
        project(id: $projectId) {
            id
            stats(filters: $filters) {
                numberOfEntries
                numberOfEntriesControlled
                numberOfEntriesVerified
                numberOfLeads
                numberOfLeadsInProgress
                numberOfLeadsNotTagged
                numberOfLeadsTagged
                filteredNumberOfEntries
                filteredNumberOfEntriesControlled
                filteredNumberOfEntriesVerified
                filteredNumberOfLeads
                filteredNumberOfLeadsInProgress
                filteredNumberOfLeadsNotTagged
                filteredNumberOfLeadsTagged
            }
        }
    }
`;

interface Props {
    className?: string;
    projectId: string;
    filters: PartialFilterFormType;
}

function SourcesStats(props: Props) {
    const {
        className,
        projectId,
        filters,
    } = props;

    const finalFilters = useMemo(() => (
        getProjectSourcesQueryVariables(
            filters as Omit<FilterFormType, 'projectId'>,
        )
    ), [filters]);

    const {
        data: sourcesStats,
    } = useQuery<ProjectSourceStatsQuery, ProjectSourceStatsQueryVariables>(
        PROJECT_SOURCE_STATS,
        {
            variables: {
                projectId,
                filters: finalFilters as LeadsFilterDataInputType,
            },
        },
    );

    const stats = sourcesStats?.project?.stats;

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(filters, ['', null])
    ), [filters]);

    return (
        <div className={_cs(styles.sourcesStats, className)}>
            <Card className={styles.leadStatsCard}>
                <StatsInformationCard
                    className={styles.infoCard}
                    icon={(
                        <IoBookmarks />
                    )}
                    label={_ts('sourcesStats', 'totalSources')}
                    filteredValue={stats?.filteredNumberOfLeads ?? undefined}
                    totalValue={stats?.numberOfLeads ?? 0}
                    isFiltered={!isFilterEmpty}
                    variant="accent"
                />
                <ProgressLine
                    progress={(
                        isFilterEmpty
                            ? calcPercent(stats?.numberOfLeadsTagged, stats?.numberOfLeads)
                            : calcPercent(
                                stats?.filteredNumberOfLeadsTagged,
                                stats?.filteredNumberOfLeads,
                            )
                    )}
                    // FIXME: Use translation
                    title="Sources Tagged"
                    variant="complement2"
                    size="large"
                />
                <ProgressLine
                    progress={(
                        isFilterEmpty
                            ? calcPercent(
                                stats?.numberOfLeadsInProgress,
                                stats?.numberOfLeads,
                            )
                            : calcPercent(
                                stats?.filteredNumberOfLeadsInProgress,
                                stats?.filteredNumberOfLeads,
                            )
                    )}
                    // FIXME: Use translation
                    title="Sources In Progress"
                    variant="complement1"
                    size="large"
                />
                <ProgressLine
                    progress={(
                        isFilterEmpty
                            ? calcPercent(
                                stats?.numberOfLeadsNotTagged,
                                stats?.numberOfLeads,
                            )
                            : calcPercent(
                                stats?.filteredNumberOfLeadsNotTagged,
                                stats?.filteredNumberOfLeads,
                            )
                    )}
                    // FIXME: Use translation
                    title="Sources Not Tagged"
                    variant="complement3"
                    size="large"
                />
            </Card>
            <Card className={styles.entryStatsCard}>
                <StatsInformationCard
                    className={styles.infoCard}
                    icon={(
                        <IoDocument />
                    )}
                    label={_ts('sourcesStats', 'totalEntries')}
                    totalValue={stats?.numberOfEntries ?? 0}
                    filteredValue={stats?.filteredNumberOfEntries ?? undefined}
                    isFiltered={!isFilterEmpty}
                    variant="accent"
                />
                <ProgressLine
                    progress={(
                        isFilterEmpty
                            ? calcPercent(
                                stats?.numberOfEntriesVerified,
                                stats?.numberOfEntries,
                            )
                            : calcPercent(
                                stats?.filteredNumberOfEntriesVerified,
                                stats?.filteredNumberOfEntries,
                            )
                    )}
                    title="Entries Verified"
                    variant="complement1"
                    size="large"
                />
                <ProgressLine
                    progress={(
                        isFilterEmpty
                            ? calcPercent(
                                stats?.numberOfEntriesControlled,
                                stats?.numberOfEntries,
                            )
                            : calcPercent(
                                stats?.filteredNumberOfEntriesControlled,
                                stats?.filteredNumberOfEntries,
                            )
                    )}
                    title="Entries Controlled"
                    variant="complement2"
                    size="large"
                />
            </Card>
        </div>
    );
}

export default SourcesStats;
