import React, { useMemo, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    isNotDefined,
    reverseRoute,
} from '@togglecorp/fujs';
import {
    ButtonLikeLink,
    Container,
    SelectInput,
    PendingMessage,
} from '@the-deep/deep-ui';
import { GiShrug } from 'react-icons/gi';
import { Redirect } from 'react-router-dom';

import List from '#rscv/List';

import Badge from '#components/viewer/Badge';
import { pathNames } from '#constants';
import { useRequest } from '#utils/request';
import featuresMapping from '#constants/features';

import {
    AppState,
    ProjectElement,
    UserActivityStat,
    CountTimeSeries,
    ProjectStat,
    ProjectsSummary,
    User,
} from '#typings';

import {
    activeUserSelector,
    activeProjectIdFromStateSelector,
    currentUserProjectsSelector,
} from '#redux';

import _ts from '#ts';

import ProjectItem from './ProjectItem';
import Summary from './Summary';
import Activity from './Activity';
import Assignment from './Assignment';
import RecentActivity from './RecentActivity';

import styles from './styles.scss';

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

const projectKeySelector = (option: ProjectElement) => (option.id);
const projectLabelSelector = (option: ProjectElement) => (option.title);

const recentProjectKeySelector = (option: RecentProjectItemProps) => option.projectId;

const mapStateToProps = (state: AppState) => ({
    userProjects: currentUserProjectsSelector(state),
    activeUser: activeUserSelector(state),
    activeProject: activeProjectIdFromStateSelector(state),
});

interface ViewProps {
    userProjects: ProjectElement[];
    activeUser: User;
    activeProject: number;
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
        userProjects,
        activeUser: {
            accessibleFeatures = [],
        },
        activeProject,
        className,
    } = props;

    const [selectedProject, setSelectedProject] = useState<number | undefined>(undefined);

    const optionLabelSelector = useCallback((option: ProjectElement) => (
        <div className={styles.selectOption}>
            {option.title}
            {option.isPrivate && (
                <Badge
                    icon="locked"
                    className={
                        _cs(
                            styles.badge,
                            selectedProject === option.id && styles.active,
                        )
                    }
                    noBorder
                    tooltip={_ts('home', 'privateProjectBadgeTooltip')}
                />
            )}
        </div>
    ), [selectedProject]);

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
            recentProject => getRecentProjectStat(recentProject),
        );
    }, [projectDashboardData, selectedProject, recentProjectsResponse]);

    const handleProjectChange = setSelectedProject;

    const accessNewUi = accessibleFeatures.find(f => f.key === featuresMapping.newUi);

    if (!accessNewUi && activeProject) {
        const routeTo = reverseRoute(pathNames.dashboard, { projectId: activeProject });

        return (
            <Redirect to={{ pathname: routeTo }} />
        );
    }

    const pageDataPending = summaryPending || recentProjectsPending || projectStatsPending;

    return (
        <div className={_cs(styles.home, className)}>
            { pageDataPending && <PendingMessage /> }
            <div className={styles.mainContent}>
                <div className={styles.topSection}>
                    <Summary
                        heading={_ts('home', 'summaryOfMyProjectsHeading')}
                        className={styles.summaryContainer}
                        summaryResponse={summaryResponse}
                    />
                    <Container
                        className={styles.taggingActivityContainer}
                        heading={_ts('home', 'projectTaggingActivityHeading')}
                        contentClassName={styles.content}
                    >
                        <Activity
                            className={styles.taggingActivity}
                            data={summaryResponse?.recentEntriesActivity}
                        />
                    </Container>
                </div>
                <div className={styles.bottomSection}>
                    <Container
                        heading={_ts('home', 'recentProjectsHeading')}
                        contentClassName={styles.bottomSectionContent}
                        headerActions={(
                            <>
                                <SelectInput
                                    name=""
                                    keySelector={projectKeySelector}
                                    labelSelector={projectLabelSelector}
                                    optionLabelSelector={optionLabelSelector}
                                    options={userProjects}
                                    placeholder={_ts('components.navbar', 'selectEventPlaceholder')}
                                    value={selectedProject}
                                    onChange={handleProjectChange}
                                />
                                <ButtonLikeLink
                                    variant="primary"
                                    to={reverseRoute(pathNames.editProject, {})}
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
                </div>
            </div>
            <div className={styles.sideContent}>
                <Assignment />
                <RecentActivity />
            </div>
        </div>
    );
}

export default connect(mapStateToProps)(Home);
