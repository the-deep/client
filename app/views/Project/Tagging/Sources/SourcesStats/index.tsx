import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoBookmarks, IoDocument } from 'react-icons/io5';
import {
    Card,
    InformationCard,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import _ts from '#ts';
import ProgressLine from '#components/ProgressLine';
import {
    ProjectSourceStatsQuery,
    ProjectSourceStatsQueryVariables,
} from '#generated/types';
import {
    calcPercent,
} from '#utils/common';
import styles from './styles.css';

const PROJECT_SOURCE_STATS = gql`
    query ProjectSourceStats(
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            id
            stats {
                numberOfEntries
                numberOfEntriesControlled
                numberOfEntriesVerified
                numberOfLeads
                numberOfLeadsInProgress
                numberOfLeadsNotTagged
                numberOfLeadsTagged
            }
        }
    }
`;

interface Props {
    className?: string;
    projectId: string;
}

function SourcesStats(props: Props) {
    const {
        className,
        projectId,
    } = props;

    const {
        data: sourcesStats,
    } = useQuery<ProjectSourceStatsQuery, ProjectSourceStatsQueryVariables>(
        PROJECT_SOURCE_STATS,
        {
            variables: {
                projectId,
            },
        },
    );

    return (
        <div className={_cs(styles.sourcesStats, className)}>
            <Card className={styles.leadStatsCard}>
                <InformationCard
                    className={styles.infoCard}
                    icon={(
                        <IoBookmarks />
                    )}
                    label={_ts('sourcesStats', 'totalSources')}
                    value={sourcesStats?.project?.stats?.numberOfLeads ?? 0}
                    variant="accent"
                />
                <ProgressLine
                    progress={calcPercent(
                        sourcesStats?.project?.stats?.numberOfLeadsTagged,
                        sourcesStats?.project?.stats?.numberOfLeads,
                    )}
                    // FIXME: Use translation
                    title="Sources Tagged"
                    variant="complement2"
                    size="large"
                />
                <ProgressLine
                    progress={calcPercent(
                        sourcesStats?.project?.stats?.numberOfLeadsInProgress,
                        sourcesStats?.project?.stats?.numberOfLeads,
                    )}
                    // FIXME: Use translation
                    title="Sources In Progress"
                    variant="complement1"
                    size="large"
                />
                <ProgressLine
                    progress={calcPercent(
                        sourcesStats?.project?.stats?.numberOfLeadsNotTagged,
                        sourcesStats?.project?.stats?.numberOfLeads,
                    )}
                    // FIXME: Use translation
                    title="Sources Not Tagged"
                    variant="complement3"
                    size="large"
                />
            </Card>
            <Card className={styles.entryStatsCard}>
                <InformationCard
                    className={styles.infoCard}
                    icon={(
                        <IoDocument />
                    )}
                    label={_ts('sourcesStats', 'totalEntries')}
                    value={sourcesStats?.project?.stats?.numberOfEntries ?? 0}
                    variant="accent"
                />
                <ProgressLine
                    progress={calcPercent(
                        sourcesStats?.project?.stats?.numberOfEntriesVerified,
                        sourcesStats?.project?.stats?.numberOfEntries,
                    )}
                    title="Entries Verified"
                    variant="complement1"
                    size="large"
                />
                <ProgressLine
                    progress={calcPercent(
                        sourcesStats?.project?.stats?.numberOfEntriesControlled,
                        sourcesStats?.project?.stats?.numberOfEntries,
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
