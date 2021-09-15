import React, { useState, useCallback } from 'react';
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
    ProjectDetailType,
} from '#generated/types';

import { ProjectsSummary } from '#types';

import ProjectItem from './ProjectItem';
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
      }
    }
`;

const recentProjectKeySelector = (d: ProjectDetailType) => d.id;

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

    const {
        pending: summaryPending,
        response: summaryResponse,
    } = useRequest<ProjectsSummary>({
        url: 'server://projects-stat/summary/',
        method: 'GET',
        failureHeader: _ts('home', 'summaryOfMyProjectsHeading'),
    });

    const recentProjectsRendererParams = useCallback((_, data) => ({
        ...data,
        projectId: data.id,
    }), []);

    const pageDataPending = summaryPending || recentProjectsPending;

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
                    data={recentProjectsResponse?.recentProjects ?? []}
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
