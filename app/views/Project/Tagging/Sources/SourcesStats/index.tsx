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
            stats {
                numberOfEntries
                numberOfLeads
                numberOfLeadsTaggedAndControlled
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

    const totalControlledEntries = 0; // FIXME get values form server
    const totalVerifiedEntries = 0; // FIXME get values form server

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
                    title={_ts('sourcesStats', 'sourcesTaggedLabel')}
                    variant="complement2"
                    size="large"
                />
                <ProgressLine
                    progress={calcPercent(
                        sourcesStats?.project?.stats?.numberOfLeadsTaggedAndControlled,
                        sourcesStats?.project?.stats?.numberOfLeads,
                    )}
                    title={_ts('sourcesStats', 'sourcesTaggedValidatedLabel')}
                    variant="complement1"
                    size="large"
                />
                <ProgressLine
                    progress={calcPercent(
                        (
                            sourcesStats?.project?.stats?.numberOfLeads ?? 0
                            - (sourcesStats?.project?.stats?.numberOfLeadsTagged ?? 0)
                        ),
                        sourcesStats?.project?.stats?.numberOfLeads,
                    )}
                    title={_ts('home.recentProjects', 'sourcesUntaggedLabel')}
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
                        totalVerifiedEntries,
                        sourcesStats?.project?.stats?.numberOfEntries,
                    )}
                    title="Entries Verified"
                    variant="complement1"
                    size="large"
                />
                <ProgressLine
                    progress={calcPercent(
                        totalControlledEntries,
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
