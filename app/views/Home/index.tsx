import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
    ButtonLikeLink,
    Container,
    PendingMessage,
    ListView,
} from '@the-deep/deep-ui';
import { GiShrug } from 'react-icons/gi';

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
} from '#generated/types';

import { ProjectsSummary } from '#types';

import ProjectItem, { RecentProjectItemProps } from './ProjectItem';
import Summary from './Summary';
import Activity from './Activity';
import Assignment from './Assignment';
import RecentActivity from './RecentActivity';

import styles from './styles.css';

const RECENT_PROJECTS = gql`
query RecentProjects{
    recentProjects {
        id
        title
        isPrivate
        description
        startDate
        endDate
        analysisFramework {
            id
            title
        }
        createdBy {
            displayName
        }
        leads {
            totalCount
        }
        userGroups {
            memberships {
                role
            }
        }
        topTaggers {
            count
            name
        }
        stats {
            numberOfLeads
            numberOfLeadsTagged
            numberOfLeadsTaggedAndControlled
            numberOfUsers
            entriesActivity {
                count
                date
            }
            leadsActivity {
                count
                date
            }
            numberOfEntries
        }
        allowedPermissions
    }
}
`;

const FETCH_PROJECT = gql`
query FetchProject($projectId: ID!) {
    project(id: $projectId) {
        id
        title
        isPrivate
        description
        startDate
        endDate
        analysisFramework {
            id
            title
        }
        createdBy {
            displayName
        }
        leads {
            totalCount
        }
        userGroups {
            memberships {
                role
            }
        }
        topTaggers {
            count
            name
        }
        stats {
            numberOfLeads
            numberOfLeadsTagged
            numberOfLeadsTaggedAndControlled
            numberOfUsers
            entriesActivity {
                count
                date
            }
            leadsActivity {
                count
                date
            }
            numberOfEntries
        }
        allowedPermissions
    }
}
`;

type ProjectDetail = NonNullable<FetchProjectQuery>['project'];

const recentProjectKeySelector = (d: ProjectDetail) => d?.id ?? '';

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
        pending: summaryPending,
        response: summaryResponse,
    } = useRequest<ProjectsSummary>({
        url: 'server://projects-stat/summary/',
        method: 'GET',
        failureHeader: _ts('home', 'summaryOfMyProjectsHeading'),
    });

    const recentProjectsRendererParams = useCallback(
        (_, data: ProjectDetail): RecentProjectItemProps => ({
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
            totalSourcesTagged: data?.stats?.numberOfLeadsTagged,
            totalSourcesValidated: data?.stats?.numberOfLeadsTaggedAndControlled,
            entriesActivity: data?.stats?.entriesActivity,
            topTaggers: data?.topTaggers,
            allowedPermissions: data?.allowedPermissions,
        }),
        [],
    );

    const pageDataPending = summaryPending
    || recentProjectsPending
    || selectedProjectPending;

    const recentProjects: ProjectDetail[] | undefined = useMemo(() => {
        if (selectedProject && selectedProjectResponse?.project) {
            return [selectedProjectResponse.project];
        }
        if (recentProjectsResponse?.recentProjects) {
            return recentProjectsResponse.recentProjects;
        }
        return undefined;
    }, [selectedProject, selectedProjectResponse, recentProjectsResponse]);

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
                spacing="loose"
            >
                <Activity
                    data={summaryResponse?.recentEntriesActivity}
                />
            </Container>
            <Container
                spacing="loose"
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
                            to={generatePath(routes.projectCreate.path, {})}
                        >
                            {_ts('home', 'setupNewProjectButtonLabel')}
                        </ButtonLikeLink>
                    </>
                )}
            >
                <ListView
                    className={styles.projectList}
                    data={recentProjects}
                    rendererParams={recentProjectsRendererParams}
                    renderer={ProjectItem}
                    keySelector={recentProjectKeySelector}
                    emptyIcon={(<GiShrug />)}
                    emptyMessage={(
                        <div className={styles.emptyText}>
                            {/* FIXME: use strings with appropriate wording */}
                            Looks like you do not have any recent project,
                            <br />
                            please select a project to view it&apos;s details
                        </div>
                    )}
                />
            </Container>
        </PageContent>
    );
}

export default Home;
