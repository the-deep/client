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

    const {
        numberOfEntries,
        numberOfLeads,
        numberOfLeadsTaggedAndControlled,
        numberOfLeadsTagged,
    } = sourcesStats?.project?.stats ?? {};
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
                    value={numberOfLeads ?? 0}
                    variant="accent"
                />
                <ProgressLine
                    progress={((numberOfLeadsTagged ?? 0) / (numberOfLeads ?? 0)) * 100}
                    title={_ts('sourcesStats', 'sourcesTaggedLabel')}
                    variant="complement2"
                    size="large"
                />
                <ProgressLine
                    progress={
                        ((numberOfLeadsTaggedAndControlled ?? 0) / (numberOfLeads ?? 0)) * 100
                    }
                    title={_ts('sourcesStats', 'sourcesTaggedValidatedLabel')}
                    variant="complement1"
                    size="large"
                />
                <ProgressLine
                    progress={((
                        (numberOfLeads ?? 0) - (numberOfLeadsTagged ?? 0)) / (numberOfLeads ?? 0)
                    ) * 100}
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
                    value={numberOfEntries ?? 0}
                    variant="accent"
                />
                <ProgressLine
                    progress={((totalVerifiedEntries ?? 0) / (numberOfEntries ?? 0)) * 100}
                    title="Entries Verified"
                    variant="complement1"
                    size="large"
                />
                <ProgressLine
                    progress={((totalControlledEntries ?? 0) / (numberOfEntries ?? 0)) * 100}
                    title="Entries Controlled"
                    variant="complement2"
                    size="large"
                />
            </Card>
        </div>
    );
}

export default SourcesStats;
