import React, { useEffect, useMemo } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { IoBookmarks, IoDocument } from 'react-icons/io5';
import {
    Card,
    InformationCard,
} from '@the-deep/deep-ui';

import { LeadSummary, ProjectStat } from '#typings';
import _ts from '#ts';
import { useRequest } from '#utils/request';
import ProgressLine from '#newComponents/viz/ProgressLine';

import { FilterFormType as Filters, getFiltersForRequest } from '../utils';
import styles from './styles.scss';

interface Props {
    className?: string;
    projectId: number;
    filters?: Filters;
    refreshTimestamp: number;
}

function SourcesStats(props: Props) {
    const {
        className,
        projectId,
        filters,
        refreshTimestamp,
    } = props;

    const leadsRequestBody = useMemo(() => ({
        ...getFiltersForRequest(filters),
        project: projectId,
    }), [projectId, filters]);

    const {
        response: leadsSummary,
        retrigger: retriggerLeadsSummary,
    } = useRequest<LeadSummary>({
        url: 'server://v2/leads/summary/',
        skip: isNotDefined(projectId),
        method: 'POST',
        body: leadsRequestBody,
        failureHeader: _ts('projectEdit', 'frameworkDetails'),
    });

    const {
        response: projectStats,
        retrigger: retriggerProjectStats,
    } = useRequest<ProjectStat>({
        skip: isNotDefined(projectId),
        url: `server://projects-stat/${projectId}/`,
        method: 'GET',
        failureHeader: _ts('home', 'projectDetails'),
    });

    useEffect(() => {
        retriggerLeadsSummary();
        retriggerProjectStats();
    }, [retriggerLeadsSummary, retriggerProjectStats, refreshTimestamp]);

    const {
        total = 0,
        totalEntries = 0,
        totalVerifiedEntries = 0,
        totalUnverifiedEntries = 0,
    } = leadsSummary ?? {};

    const {
        numberOfLeads = 0,
        numberOfLeadsTagged = 0,
        numberOfLeadsTaggedAndVerified = 0,
    } = projectStats ?? {};

    return (
        <div className={_cs(className, styles.sourcesStats)}>
            <Card className={styles.container}>
                <InformationCard
                    className={styles.infoCard}
                    icon={(
                        <IoBookmarks />
                    )}
                    label={_ts('sourcesStats', 'totalSources')}
                    value={total}
                    variant="accent"
                />
                <ProgressLine
                    progress={(numberOfLeadsTagged / numberOfLeads) * 100}
                    title={_ts('sourcesStats', 'sourcesTaggedLabel')}
                    variant="complement2"
                    size="large"
                />
                <ProgressLine
                    progress={(numberOfLeadsTaggedAndVerified / numberOfLeads) * 100}
                    title={_ts('sourcesStats', 'sourcesTaggedValidatedLabel')}
                    variant="complement1"
                    size="large"
                />
                <ProgressLine
                    progress={((numberOfLeads - numberOfLeadsTagged) / numberOfLeads) * 100}
                    title={_ts('home.recentProjects', 'sourcesUntaggedLabel')}
                    variant="complement3"
                    size="large"
                />
            </Card>
            <Card className={styles.container}>
                <InformationCard
                    className={styles.infoCard}
                    icon={(
                        <IoDocument />
                    )}
                    label={_ts('sourcesStats', 'totalEntries')}
                    value={totalEntries}
                    variant="accent"
                />
                <ProgressLine
                    progress={(totalVerifiedEntries / totalEntries) * 100}
                    title={_ts('sourcesStats', 'totalVerifiedEntries')}
                    variant="complement1"
                    size="large"
                />
                <ProgressLine
                    progress={(totalUnverifiedEntries / totalEntries) * 100}
                    title={_ts('sourcesStats', 'totalUnverifiedEntries')}
                    variant="complement2"
                    size="large"
                />
            </Card>
        </div>
    );
}

export default SourcesStats;
