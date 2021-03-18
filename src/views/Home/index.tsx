import React, { useMemo, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    isDefined,
    reverseRoute,
} from '@togglecorp/fujs';
import { Redirect } from 'react-router-dom';

import Page from '#rscv/Page';
import SelectInput from '#rsci/SelectInput';
import ListView from '#rscv/List/ListView';

import Badge from '#components/viewer/Badge';
import Header from '#dui/Header';
import ButtonLikeLink from '#dui/ButtonLikeLink';
import { pathNames } from '#constants';
import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
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
    activeProject?: number;
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

    const [
        pendingRecentProjects,
        recentProjectsResponse,
    ] = useRequest<ProjectStat[]>({
        url: 'server://projects-stat/recent/',
        method: 'GET',
        autoTrigger: true,
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('home', 'recentProjectsTitle'))({ error: errorBody }),
    });

    const [
        summaryPending,
        summaryResponse,
    ] = useRequest<ProjectsSummary>({
        url: 'server://projects-stat/summary/',
        method: 'GET',
        autoTrigger: true,
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('home', 'summaryOfMyProjectsHeading'))({ error: errorBody }),
    });

    const [
        projectStatsPending,
        projectStats,
        ,
        triggerProjectStats,
    ] = useRequest<ProjectStat>({
        url: `server://projects-stat/${selectedProject}/`,
        method: 'GET',
        autoTrigger: isDefined(selectedProject),
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('home', 'projectDetails'))({ error: errorBody });
        },
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

    const handleProjectChange = useCallback((newSelectedProject) => {
        setSelectedProject(newSelectedProject);
        if (isDefined(newSelectedProject)) {
            triggerProjectStats();
        }
    }, [triggerProjectStats]);

    const accessNewUi = accessibleFeatures.find(f => f.key === featuresMapping.newUi);

    if (!accessNewUi) {
        const routeTo = reverseRoute(pathNames.dashboard, { projectId: activeProject });
        return (
            <Redirect
                to={{
                    pathname: routeTo,
                }}
            />
        );
    }

    return (
        <Page
            className={styles.home}
            mainContentClassName={styles.mainContent}
            mainContent={(
                <>
                    <div className={styles.leftContainer}>
                        <div className={styles.leftTopContainer}>
                            <div className={styles.summaryContainer}>
                                <header className={styles.header}>
                                    <h2 className={styles.heading}>
                                        {_ts('home', 'summaryOfMyProjectsHeading')}
                                    </h2>
                                </header>
                                <Summary
                                    pending={summaryPending}
                                    summaryResponse={summaryResponse}
                                    className={styles.content}
                                />
                            </div>
                            <div className={styles.projectTaggingActivity}>
                                <header className={styles.header}>
                                    <h2 className={styles.heading}>
                                        {_ts('home', 'projectTaggingActivityHeading')}
                                    </h2>
                                </header>
                                <Activity
                                    className={styles.content}
                                    pending={summaryPending}
                                    recentActivity={summaryResponse?.recentEntriesActivity}
                                />
                            </div>
                        </div>
                        <div className={styles.leftBottomContainer}>
                            <Header
                                heading={_ts('home', 'recentProjectsHeading')}
                                headingSize="large"
                                className={styles.header}
                                actions={(
                                    <>
                                        <SelectInput
                                            keySelector={projectKeySelector}
                                            labelSelector={projectLabelSelector}
                                            optionLabelSelector={optionLabelSelector}
                                            options={userProjects}
                                            placeholder={_ts('components.navbar', 'selectEventPlaceholder')}
                                            showHintAndError={false}
                                            showLabel={false}
                                            className={styles.projectSelectInput}
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
                            />
                            <ListView
                                data={finalRecentProjects}
                                rendererParams={recentProjectsRendererParams}
                                renderer={ProjectItem}
                                keySelector={recentProjectKeySelector}
                                pending={projectStatsPending || pendingRecentProjects}
                            />
                        </div>
                    </div>
                    <div className={styles.rightContainer}>
                        <Assignment />
                        <RecentActivity />
                    </div>
                </>
            )}
        />
    );
}

export default connect(mapStateToProps)(Home);
