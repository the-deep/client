import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { BiSort } from 'react-icons/bi';
import { useQuery, gql } from '@apollo/client';
import {
    Container,
    Header,
    Heading,
    ListView,
    Kraken,
    QuickActionButton,
    useModalState,
} from '@the-deep/deep-ui';

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
    ProjectStatSummaryQuery,
    ProjectStatSummaryQueryVariables,
} from '#generated/types';

import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import { PROJECT_DETAIL_FRAGMENT } from '#gqlFragments';

import ProjectItem, { RecentProjectItemProps } from './ProjectItem';
import Summary from './Summary';
import Activity from './Activity';
import Assignment from './Assignment';
import RecentActivity from './RecentActivity';
import ProjectReorderModal from './ProjectReorderModal';

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
        id
        clientId
        order
        project {
            ...ProjectDetail
        }
    }
}
`;

const PROJECT_STAT_SUMMARY = gql`
query ProjectStatSummary {
    userProjectStatSummary {
        projectsCount
        recentEntriesActivities {
            count
            date
            projectId
        }
        recentEntriesProjectDetails {
            count
            id
            title
        }
        totalLeadsCount
        totalLeadsTaggedAndControlledCount
        totalLeadsTaggedCount
    }
}
`;

type ProjectDetail = NonNullable<FetchProjectQuery>['project'];
export type PinnedProjectDetailType = NonNullable<UserPinnedProjectsQuery>['userPinnedProjects'][number];

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

    const [
        projectReorderModalShown,
        showProjectReorderModal,
        hideProjectReorderModal,
    ] = useModalState(false);

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
        data: summaryResponse,
    } = useQuery<ProjectStatSummaryQuery, ProjectStatSummaryQueryVariables>(
        PROJECT_STAT_SUMMARY,
    );

    const [
        pinnedProjects,
        setPinnedProjects,
    ] = useState<PinnedProjectDetailType[] | undefined>([]);

    const {
        data: pinnedProjectsResponse,
        refetch: retriggerPinnedProjectsList,
    } = useQuery<UserPinnedProjectsQuery, UserPinnedProjectsQueryVariables>(
        USER_PINNED_PROJECTS,
        {
            notifyOnNetworkStatusChange: true,
            onCompleted: (response) => {
                const count = response?.userPinnedProjects.length;
                setPinButtonDisabled(count >= MAX_PINNED_PROJECT_LIMIT);
                const pinnedProjectList = response?.userPinnedProjects
                && pinnedProjectsResponse?.userPinnedProjects?.filter(
                    (item) => isDefined(item.project?.id),
                );
                setPinnedProjects(pinnedProjectList);
            },
        },
    );

    // NOTE: This is an order changed list outside of state maintained due to apollo caching
    const pinnedProjectsList = useMemo(() => (
        pinnedProjectsResponse?.userPinnedProjects
        && pinnedProjectsResponse?.userPinnedProjects?.filter(
            (item) => isDefined(item.project?.id),
        )
    ), [pinnedProjectsResponse]);

    const recentProjects: ProjectDetail[] | undefined = useMemo(() => {
        if (recentProjectsResponse?.recentProjects) {
            return recentProjectsResponse.recentProjects;
        }
        return [];
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
            pinnedId: pinnedProjectsList?.find((item) => item.project.id === data?.id)?.id,
            isPinned: data?.isProjectPinned,
            onProjectPinChange: retriggerPinnedProjectsList,
            disablePinButton: pinButtonDisabled,
        }),
        [
            pinnedProjectsList,
            retriggerPinnedProjectsList,
            pinButtonDisabled,
        ],
    );

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
            pinnedId: data.id,
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
                summaryResponse={summaryResponse?.userProjectStatSummary}
            />
            <Container
                className={styles.projectTaggingActivity}
                heading="Projects Tagging Activity"
                headingDescription="Last 3 months"
                inlineHeadingDescription
                spacing="loose"
            >
                <Activity
                    data={summaryResponse?.userProjectStatSummary?.recentEntriesActivities}
                    projectDetails={summaryResponse?.userProjectStatSummary
                        ?.recentEntriesProjectDetails ?? []}
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
                        pinnedId={pinnedProjectsList?.find(
                            (item) => item.project.id === selectedProject,
                        )?.id}
                        allowedPermissions={selectedProjectDetail?.allowedPermissions}
                        recentActiveUsers={selectedProjectDetail?.recentActiveUsers}
                        isPinned={selectedProjectDetail?.isProjectPinned}
                        onProjectPinChange={retriggerPinnedProjectsList}
                        disablePinButton={pinButtonDisabled}
                    />
                )}
                {(pinnedProjectsList?.length ?? 0) >= 1 && (
                    <>
                        <Header
                            className={styles.pinnedProjectHeader}
                            headingSize="medium"
                            heading="Pinned Projects"
                            actions={(
                                <QuickActionButton
                                    name={undefined}
                                    title="Reorder pinned projects"
                                    onClick={showProjectReorderModal}
                                    big
                                >
                                    <BiSort />
                                </QuickActionButton>
                            )}
                        />
                        <ListView
                            className={styles.projectList}
                            data={pinnedProjectsList}
                            rendererParams={pinnedProjectsRendererParams}
                            renderer={ProjectItem}
                            pending={false}
                            keySelector={pinnedProjectKeySelector}
                            filtered={false}
                            errored={false}
                        />
                    </>
                )}
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
                {projectReorderModalShown && (
                    <ProjectReorderModal
                        onModalClose={hideProjectReorderModal}
                        pinnedProjects={pinnedProjects ?? []}
                        onSuccess={retriggerPinnedProjectsList}
                        setPinnedProjects={setPinnedProjects}
                    />
                )}
            </Container>
        </PageContent>
    );
}

export default Home;
