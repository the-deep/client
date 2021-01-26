import React, { useMemo, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    isDefined,
    reverseRoute,
} from '@togglecorp/fujs';

import Page from '#rscv/Page';
import SelectInput from '#rsci/SelectInput';
import ListView from '#rscv/List/ListView';

import Badge from '#components/viewer/Badge';
import ButtonLikeLink from '#components/general/ButtonLikeLink';
import { pathNames } from '#constants';
import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';

import {
    AppState,
    ProjectElement,
    ProjectDetails,
    ProjectStats,
    UserActivityStat,
    CountTimeSeries,
} from '#typings';

import {
    currentUserProjectsSelector,
} from '#redux';

import _ts from '#ts';

import ProjectItem from './ProjectItem';
import Summary from './Summary';

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
});

interface ViewProps {
    userProjects: ProjectElement[];
}

function Home(props: ViewProps) {
    const {
        userProjects,
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
                    tooltip={_ts('home', 'priivateProjectBadgeTooltip')}
                />
            )}
        </div>
    ), [selectedProject]);

    const [
        projectStatsPending,
        projectStats,
        ,
        triggerProjectStats,
    ] = useRequest<ProjectStats>({
        url: `server://projects-stat/${selectedProject}/dashboard/`,
        method: 'GET',
        autoTrigger: isDefined(selectedProject),
        onFailure: (error, errorBody) => {
            notifyOnFailure(_ts('home', 'projectDetails'))({ error: errorBody });
        },
    });

    const [
        projectDetailsPending,
        projectDetails,
        ,
        triggerProjectDetails,
    ] = useRequest<ProjectDetails>({
        url: `server://projects/${selectedProject}/`,
        method: 'GET',
        autoTrigger: isDefined(selectedProject),
        onFailure: (error, errorBody) => {
            notifyOnFailure(_ts('home', 'projectDetails'))({ error: errorBody });
        },
    });

    const projectDashboardData = useMemo(() => {
        if (!selectedProject || !projectDetails || !projectStats) {
            return undefined;
        }
        return ({
            projectId: projectDetails.id,
            title: projectDetails.title,
            isPrivate: projectStats.isPrivate,
            description: projectDetails.description,
            startDate: projectDetails.startDate,
            endDate: projectDetails.endDate,
            projectOwnerName: projectDetails.createdByName,
            analysisFrameworkTitle: projectDetails.analysisFrameworkTitle,
            totalUsers: projectStats.numberOfUsers,
            totalSources: projectStats.numberOfLeads,
            // TODO: Use better activity after API is ready
            totalSourcesTagged: projectStats.numberOfLeads,
            // TODO: Use better activity after API is ready
            totalSourcesValidated: projectStats.numberOfLeads,
            // TODO: Use better activity after API is ready
            projectActivity: projectStats.entriesActivity,
            // TODO: Use better activity after API is ready
            recentlyActive: projectStats.topTaggers,
        });
    }, [projectDetails, projectStats, selectedProject]);

    const recentProjectsRendererParams = useCallback((key, data) => ({
        ...data,
    }), []);

    const finalRecentProjects: RecentProjectItemProps[] = useMemo(() => {
        if (projectDashboardData) {
            return [projectDashboardData];
        }
        return [];
    }, [projectDashboardData]);

    const handleProjectChange = useCallback((newSelectedProject) => {
        setSelectedProject(newSelectedProject);
        triggerProjectDetails();
        triggerProjectStats();
    }, [triggerProjectDetails, triggerProjectStats]);

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
                                <Summary className={styles.content} />
                            </div>
                            <div className={styles.projectTaggingActivity}>
                                <header className={styles.header}>
                                    <h2 className={styles.heading}>
                                        {_ts('home', 'projectTaggingActivityHeading')}
                                    </h2>
                                </header>
                                <div className={styles.content} />
                            </div>
                        </div>
                        <div className={styles.leftBottomContainer}>
                            <header className={styles.header}>
                                <h2 className={styles.heading}>
                                    {_ts('home', 'recentProjectsHeading')}
                                </h2>
                                <SelectInput
                                    hideClearButton
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
                                    type="primary"
                                    to={reverseRoute(pathNames.projects, {})}
                                >
                                    {_ts('home', 'setupNewProjectButtonLabel')}
                                </ButtonLikeLink>
                            </header>
                            <ListView
                                data={finalRecentProjects}
                                rendererParams={recentProjectsRendererParams}
                                renderer={ProjectItem}
                                keySelector={recentProjectKeySelector}
                                pending={projectDetailsPending || projectStatsPending}
                            />
                        </div>
                    </div>
                    <div className={styles.rightContainer} />
                </>
            )}
        />
    );
}

export default connect(mapStateToProps)(Home);
