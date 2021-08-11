import React, { useMemo, useState, useCallback } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    ButtonLikeLink,
    Container,
    PendingMessage,
    List,
} from '@the-deep/deep-ui';
import { GiShrug } from 'react-icons/gi';

import { useRequest } from '#base/utils/restRequest';

import {
    UserActivityStat,
    CountTimeSeries,
    ProjectStat,
    ProjectsSummary,
} from '#types';
import { Project } from '#base/types/project';
import PageContent from '#components/PageContent';
import ProjectSelectInput from '#components/ProjectSelectInput';

import _ts from '#ts';

import ProjectItem from './ProjectItem';
import Summary from './Summary';
import Activity from './Activity';
import Assignment from './Assignment';
import RecentActivity from './RecentActivity';

import styles from './styles.css';

interface RecentProjectItemProps {
    projectId: number;
    title: string;
    isPrivate: boolean;
    description?: string;
    projectOwnerName: string;
    analysisFrameworkTitle?: string;
    startDate?: string;
    endDate?: string;
    totalUsers: number;
    totalSources: number;
    totalSourcesTagged: number;
    totalSourcesValidated: number;
    projectActivity: CountTimeSeries[];
    recentlyActive: UserActivityStat[];
}

const recentProjectKeySelector = (option: RecentProjectItemProps) => option.projectId;

interface ViewProps {
    className?: string;
}

const getRecentProjectStat = (projectStat: ProjectStat) => ({
    projectId: projectStat.id,
    title: projectStat.title,
    isPrivate: projectStat.isPrivate,
    description: projectStat.description,
    startDate: projectStat.startDate,
    endDate: projectStat.endDate,
    projectOwnerName: projectStat.createdByName,
    analysisFrameworkTitle: projectStat.analysisFrameworkTitle,
    analysisFramework: projectStat.analysisFramework,
    totalUsers: projectStat.numberOfUsers,
    totalSources: projectStat.numberOfLeads,
    totalSourcesTagged: projectStat.numberOfLeadsTagged,
    totalSourcesValidated: projectStat.numberOfLeadsTaggedAndVerified,
    projectActivity: projectStat.entriesActivity,
    role: projectStat.role,
    // TODO: Use better activity after API is ready
    recentlyActive: projectStat.topTaggers,
});

function Home(props: ViewProps) {
    const {
        className,
    } = props;

    const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
    const [projects, setProjects] = useState<
        Pick<Project, 'id' | 'title' | 'isPrivate'>[] | undefined | null
    >(undefined);

    const {
        pending: recentProjectsPending,
        response: recentProjectsResponse,
    } = useRequest<ProjectStat[]>({
        url: 'server://projects-stat/recent/',
        method: 'GET',
        failureHeader: _ts('home', 'recentProjectsTitle'),
    });

    const {
        pending: summaryPending,
        response: summaryResponse,
    } = useRequest<ProjectsSummary>({
        url: 'server://projects-stat/summary/',
        method: 'GET',
        failureHeader: _ts('home', 'summaryOfMyProjectsHeading'),
    });

    const {
        pending: projectStatsPending,
        response: projectStats,
    } = useRequest<ProjectStat>({
        skip: isNotDefined(selectedProject),
        url: `server://projects-stat/${selectedProject}/`,
        method: 'GET',
        failureHeader: _ts('home', 'projectDetails'),
    });

    const projectDashboardData = useMemo(() => {
        if (!selectedProject || !projectStats) {
            return undefined;
        }
        return getRecentProjectStat(projectStats);
    }, [projectStats, selectedProject]);

    const recentProjectsRendererParams = useCallback((_, data) => ({
        className: styles.projectItem,
        ...data,
    }), []);

    const finalRecentProjects: RecentProjectItemProps[] = useMemo(() => {
        if (selectedProject && projectDashboardData) {
            return [projectDashboardData];
        }
        return (recentProjectsResponse ?? []).map(
            (recentProject) => getRecentProjectStat(recentProject),
        );
    }, [projectDashboardData, selectedProject, recentProjectsResponse]);

    const pageDataPending = summaryPending || recentProjectsPending || projectStatsPending;

    return (
        <PageContent
            className={_cs(styles.home, className)}
            rightSideContent={(
                <>
                    <Assignment />
                    <RecentActivity />
                </>
            )}
            mainContentClassName={styles.mainContent}
        >
            { pageDataPending && <PendingMessage /> }
            <Summary
                className={styles.summary}
                summaryResponse={summaryResponse}
            />
            <Container
                className={styles.projectTaggingActivity}
                heading="Projects Tagging Activity"
                headingDescription="Last 3 months"
                inlineHeadingDescription
            >
                <Activity
                    data={summaryResponse?.recentEntriesActivity}
                />
            </Container>
            <Container
                className={styles.recentProjects}
                heading={_ts('home', 'recentProjectsHeading')}
                headerActions={(
                    <>
                        <ProjectSelectInput
                            name=""
                            options={projects}
                            onOptionsChange={setProjects}
                            placeholder={_ts('components.navbar', 'selectEventPlaceholder')}
                            value={selectedProject}
                            onChange={setSelectedProject}
                            variant="general"
                        />
                        <ButtonLikeLink
                            variant="primary"
                            // FIXME: Add route to new project edit later
                            to=""
                        >
                            {_ts('home', 'setupNewProjectButtonLabel')}
                        </ButtonLikeLink>
                    </>
                )}
            >
                {finalRecentProjects.length > 0 ? (
                    <List
                        data={finalRecentProjects}
                        rendererParams={recentProjectsRendererParams}
                        renderer={ProjectItem}
                        keySelector={recentProjectKeySelector}
                    />
                ) : (
                    <div className={styles.emptyRecentProject}>
                        <GiShrug className={styles.icon} />
                        <div className={styles.text}>
                            {/* FIXME: use strings with appropriate wording */}
                            Looks like you do not have any recent project,
                            <br />
                            please select a project to view it&apos;s details
                        </div>
                    </div>
                )}
            </Container>
        </PageContent>
    );
}

export default Home;
