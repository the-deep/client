import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    Container,
    Heading,
    ListView,
    Kraken,
} from '@the-deep/deep-ui';

import { useRequest } from '#base/utils/restRequest';

import { Project } from '#base/types/project';
import PageContent from '#components/PageContent';
import ProjectSelectInput from '#components/selections/ProjectSelectInput';
import routes from '#base/configs/routes';

import _ts from '#ts';
import {
    RecentProjectsQuery,
    RecentProjectsQueryVariables,
    FetchProjectQuery,
    FetchProjectQueryVariables,
    UserPinnedProjectsQuery,
    UserPinnedProjectsQueryVariables,
} from '#generated/types';

import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import { PROJECT_DETAIL_FRAGMENT } from '#gqlFragments';
import { ProjectsSummary } from '#types';

import ProjectItem, { RecentProjectItemProps } from './ProjectItem';
import Summary from './Summary';
import Activity from './Activity';
import Assignment from './Assignment';
import RecentActivity from './RecentActivity';

import styles from './styles.css';

const RECENT_PROJECTS = gql`
${PROJECT_DETAIL_FRAGMENT}
query RecentProjects{
    recentProjects {
        ...ProjectDetail
    }
}
`;

const FETCH_PROJECT = gql`
${PROJECT_DETAIL_FRAGMENT}
query FetchProject($projectId: ID!) {
    project(id: $projectId) {
        ...ProjectDetail
    }
}
`;

const USER_PINNED_PROJECTS = gql`
${PROJECT_DETAIL_FRAGMENT}
query userPinnedProjects {
    userPinnedProjects{
        clientId
        order
        project {
            ...ProjectDetail
        }
    }
}
`;

type ProjectDetail = NonNullable<FetchProjectQuery>['project'];
type PinnedProjectDetailType = NonNullable<UserPinnedProjectsQuery>['userPinnedProjects'][number];

const recentProjectKeySelector = (d: ProjectDetail) => d?.id ?? '';
const pinnedProjectKeySelector = (d: PinnedProjectDetailType) => d.project?.id ?? '';

const MAX_PINNED_PROJECT_LIMIT = 5;

interface ViewProps {
    className?: string;
}

function Home(props: ViewProps) {
    const {
        className,
    } = props;

    const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
    const [projects, setProjects] = useState<
        Pick<Project, 'id' | 'title' | 'isPrivate'>[] | undefined | null
    >(undefined);
    const [
        pinButtonDisabled,
        setPinButtonDisabled,
    ] = useState<boolean>(false);

    const {
        data: recentProjectsResponse,
        loading: recentProjectsPending,
    } = useQuery<RecentProjectsQuery, RecentProjectsQueryVariables>(
        RECENT_PROJECTS,
    );

    const variables = useMemo(() => (
        selectedProject
            ? ({ projectId: selectedProject })
            : undefined
    ), [selectedProject]);

    const {
        data: selectedProjectResponse,
        loading: selectedProjectPending,
    } = useQuery<FetchProjectQuery, FetchProjectQueryVariables>(
        FETCH_PROJECT,
        {
            skip: !variables,
            variables,
        },
    );

    const {
        data: pinnedProjectsResponse,
        loading: pinnedProjectsPending,
        refetch: retriggerPinnedProjectsList,
    } = useQuery<UserPinnedProjectsQuery, UserPinnedProjectsQueryVariables>(
        USER_PINNED_PROJECTS,
        {
            onCompleted: (response) => {
                const count = response?.userPinnedProjects.length;
                setPinButtonDisabled(count >= MAX_PINNED_PROJECT_LIMIT);
            },
        },
    );

    const {
        response: summaryResponse,
    } = useRequest<ProjectsSummary>({
        url: 'server://projects-stat/summary/',
        method: 'GET',
    });

    const recentProjects: ProjectDetail[] | undefined = useMemo(() => {
        /*
        if (selectedProject && selectedProjectResponse?.project) {
            return [selectedProjectResponse.project];
        }
         */
        if (recentProjectsResponse?.recentProjects) {
            return recentProjectsResponse.recentProjects;
        }
        return undefined;
    }, [recentProjectsResponse]);

    const selectedProjectDetail: ProjectDetail | undefined = useMemo(() => {
        if (selectedProject && selectedProjectResponse?.project) {
            return selectedProjectResponse.project;
        }
        return undefined;
    }, [
        selectedProject,
        selectedProjectResponse,
    ]);

    const recentProjectsRendererParams = useCallback(
        (_: string, data: ProjectDetail): RecentProjectItemProps => ({
            projectId: data?.id,
            title: data?.title,
            isPrivate: data?.isPrivate,
            startDate: data?.startDate,
            endDate: data?.endDate,
            description: data?.description,
            projectOwnerName: data?.createdBy?.displayName,
            analysisFrameworkTitle: data?.analysisFramework?.title,
            analysisFramework: data?.analysisFramework?.id,
            totalUsers: data?.stats?.numberOfUsers,
            totalSources: data?.stats?.numberOfLeads,
            totalSourcesInProgress: data?.stats?.numberOfLeadsInProgress,
            totalSourcesTagged: data?.stats?.numberOfLeadsTagged,
            entriesActivity: data?.stats?.entriesActivity,
            recentActiveUsers: data?.recentActiveUsers,
            topTaggers: data?.topTaggers,
            topSourcers: data?.topSourcers,
            allowedPermissions: data?.allowedPermissions,
            isPinned: data?.isProjectPinned,
            onProjectPinChange: retriggerPinnedProjectsList,
            disablePinButton: pinButtonDisabled,
        }),
        [
            retriggerPinnedProjectsList,
            pinButtonDisabled,
        ],
    );

    const pinnedProjects = pinnedProjectsResponse?.userPinnedProjects;

    const pinnedProjectsRendererParams = useCallback(
        (_: string, data: PinnedProjectDetailType): RecentProjectItemProps => ({
            projectId: data.project?.id,
            title: data.project?.title,
            isPrivate: data.project?.isPrivate,
            startDate: data.project?.startDate,
            endDate: data.project?.endDate,
            description: data.project?.description,
            projectOwnerName: data.project?.createdBy?.displayName,
            analysisFrameworkTitle: data.project?.analysisFramework?.title,
            analysisFramework: data.project?.analysisFramework?.id,
            totalUsers: data.project?.stats?.numberOfUsers,
            totalSources: data.project?.stats?.numberOfLeads,
            totalSourcesInProgress: data.project?.stats?.numberOfLeadsInProgress,
            totalSourcesTagged: data.project?.stats?.numberOfLeadsTagged,
            entriesActivity: data.project?.stats?.entriesActivity,
            recentActiveUsers: data.project?.recentActiveUsers,
            topTaggers: data.project?.topTaggers,
            topSourcers: data.project?.topSourcers,
            allowedPermissions: data.project?.allowedPermissions,
            isPinned: true,
            onProjectPinChange: retriggerPinnedProjectsList,
            disablePinButton: pinButtonDisabled,
        }),
        [
            retriggerPinnedProjectsList,
            pinButtonDisabled,
        ],
    );

    return (
        <PageContent
            className={_cs(styles.home, className)}
            rightSideContentClassName={styles.rightContent}
            rightSideContent={(
                <>
                    <Assignment />
                    <RecentActivity />
                </>
            )}
            mainContentClassName={styles.mainContent}
        >
            <Summary
                className={styles.summary}
                summaryResponse={summaryResponse}
            />
            <Container
                className={styles.projectTaggingActivity}
                heading="Projects Tagging Activity"
                headingDescription="Last 3 months"
                inlineHeadingDescription
                spacing="loose"
            >
                <Activity
                    data={summaryResponse?.recentEntriesActivity}
                />
            </Container>
            <Container
                spacing="loose"
                className={styles.recentProjects}
                headerActions={(
                    <>
                        <ProjectSelectInput
                            className={styles.projectSelect}
                            name=""
                            options={projects}
                            onOptionsChange={setProjects}
                            placeholder={_ts('components.navbar', 'selectEventPlaceholder')}
                            value={selectedProject}
                            onChange={setSelectedProject}
                            variant="general"
                        />
                        <SmartButtonLikeLink
                            variant="primary"
                            route={routes.projectCreate}
                        >
                            {_ts('home', 'setupNewProjectButtonLabel')}
                        </SmartButtonLikeLink>
                    </>
                )}
                contentClassName={styles.content}
            >
                {isDefined(selectedProject) && (
                    <ProjectItem
                        projectId={selectedProject}
                        className={styles.selectedProject}
                        title={selectedProjectDetail?.title}
                        startDate={selectedProjectDetail?.startDate}
                        endDate={selectedProjectDetail?.endDate}
                        isPrivate={selectedProjectDetail?.isPrivate}
                        description={selectedProjectDetail?.description}
                        projectOwnerName={selectedProjectDetail?.createdBy?.displayName}
                        analysisFrameworkTitle={selectedProjectDetail?.analysisFramework?.title}
                        analysisFramework={selectedProjectDetail?.analysisFramework?.id}
                        totalUsers={selectedProjectDetail?.stats?.numberOfUsers}
                        totalSources={selectedProjectDetail?.stats?.numberOfLeads}
                        totalSourcesTagged={selectedProjectDetail?.stats?.numberOfLeadsTagged}
                        totalSourcesInProgress={selectedProjectDetail
                            ?.stats?.numberOfLeadsInProgress}
                        topTaggers={selectedProjectDetail?.topTaggers}
                        topSourcers={selectedProjectDetail?.topSourcers}
                        entriesActivity={selectedProjectDetail?.stats?.entriesActivity}
                        allowedPermissions={selectedProjectDetail?.allowedPermissions}
                        recentActiveUsers={selectedProjectDetail?.recentActiveUsers}
                        isPinned={selectedProjectDetail?.isProjectPinned}
                        onProjectPinChange={retriggerPinnedProjectsList}
                        disablePinButton={pinButtonDisabled}
                    />
                )}
                <Heading size="medium">
                    Pinned Projects
                </Heading>
                <ListView
                    className={styles.projectList}
                    data={pinnedProjects}
                    rendererParams={pinnedProjectsRendererParams}
                    renderer={ProjectItem}
                    pending={pinnedProjectsPending}
                    keySelector={pinnedProjectKeySelector}
                    filtered={false}
                    errored={false}
                    emptyIcon={(
                        <Kraken
                            variant="search"
                            size="medium"
                        />
                    )}
                    emptyMessage={(
                        <div className={styles.emptyText}>
                            {/* FIXME: use strings with appropriate wording */}
                            Looks like you do not have any recent project,
                            <br />
                            please select a project to view it&apos;s details
                        </div>
                    )}
                    messageIconShown
                    messageShown
                />
                <Heading size="medium">
                    Recent Projects
                </Heading>
                <ListView
                    className={styles.projectList}
                    data={recentProjects}
                    rendererParams={recentProjectsRendererParams}
                    renderer={ProjectItem}
                    pending={selectedProjectPending || recentProjectsPending}
                    keySelector={recentProjectKeySelector}
                    filtered={false}
                    errored={false}
                    emptyIcon={(
                        <Kraken
                            variant="search"
                            size="medium"
                        />
                    )}
                    emptyMessage={(
                        <div className={styles.emptyText}>
                            {/* FIXME: use strings with appropriate wording */}
                            Looks like you do not have any recent project,
                            <br />
                            please select a project to view it&apos;s details
                        </div>
                    )}
                    messageIconShown
                    messageShown
                />
            </Container>
        </PageContent>
    );
}

export default Home;
