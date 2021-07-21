import React, { useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { FiEdit2 } from 'react-icons/fi';
import {
    _cs,
    compareDate,
    reverseRoute,
} from '@togglecorp/fujs';
import {
    IoBookmarkOutline,
    IoLockOpenOutline,
} from 'react-icons/io5';

import {
    ContainerCard,
    Card,
    ButtonLikeLink,
    InformationCard,
    ElementFragments,
    TextOutput,
} from '@the-deep/deep-ui';

import FormattedDate from '#rscv/FormattedDate';
import DateRangeOutput from '#newComponents/ui/DateRangeOutput';
import List from '#rscv/List';
import ProgressLine from '#newComponents/viz/ProgressLine';
import FrameworkImageButton from '#newComponents/viewer/FrameworkImageButton';

import {
    AreaChart,
    XAxis,
    YAxis,
    Tooltip,
    Area,
    ResponsiveContainer,
} from 'recharts';

import {
    UserActivityStat,
    CountTimeSeries,
    AppState,
    ProjectRolesMap,
} from '#typings';
import { pathNames } from '#constants';
import { projectRolesSelector } from '#redux';

import _ts from '#ts';

import styles from './styles.scss';

const emptyComponent = () => null;

const tickFormatter = (value: number | string) => {
    const date = new Date(value);
    return date.toDateString();
};

const minTickFormatter = (value: number | string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
};

const recentlyActiveKeySelector = (d: UserActivityStat) => d.id;

const mapStateToProps = (state: AppState) => ({
    projectRoles: projectRolesSelector(state),
});
interface PropsFromState {
    projectRoles: ProjectRolesMap;
}

interface RecentProjectItemProps {
    className?: string;
    role: number;
    projectId: number;
    title: string;
    isPrivate: boolean;
    startDate?: string;
    endDate?: string;
    description?: string;
    projectOwnerName: string;
    analysisFrameworkTitle?: string;
    analysisFramework?: number;
    totalUsers: number;
    totalSources: number;
    totalSourcesTagged: number;
    totalSourcesValidated: number;
    projectActivity: CountTimeSeries[];
    recentlyActive: UserActivityStat[];
}

function ProjectItem(props: RecentProjectItemProps & PropsFromState) {
    const {
        className,
        title,
        startDate,
        endDate,
        isPrivate,
        description,
        projectId,
        projectOwnerName,
        analysisFrameworkTitle,
        analysisFramework,
        totalUsers,
        totalSources = 0,
        totalSourcesTagged = 0,
        totalSourcesValidated = 0,
        recentlyActive,
        projectActivity,
        projectRoles,
        role,
    } = props;

    const recentlyActiveRendererParams = useCallback((key, data) => ({
        className: styles.recentlyActiveItem,
        label: data.name,
        labelContainerClassName: styles.recentlyActiveUserName,
        hideLabelColon: true,
        value: (
            <FormattedDate
                className={styles.recentActivityDate}
                // FIXME: Remove this fallback
                value={data.date ?? Date.now()}
                mode="hh:mmaaa, MMM dd, yyyy"
                emptyComponent={emptyComponent}
            />
        ),
    }), []);

    const convertedProjectActivity = useMemo(() => (
        projectActivity?.map(pa => ({
            count: pa.count,
            date: (new Date(pa.date)).getTime(),
        })).sort((a, b) => compareDate(a.date, b.date))
    ), [projectActivity]);

    const canEditProject = projectRoles[role]?.setupPermissions?.modify;
    const canAddEntries = projectRoles[role]?.entryPermissions?.modify;

    return (
        <ContainerCard
            className={_cs(className, styles.projectItem)}
            heading={title}
            headingSize="small"
            headerDescription={(
                <DateRangeOutput
                    startDate={startDate}
                    endDate={endDate}
                />
            )}
            headerActions={(
                <>
                    <div className={styles.privacyBadge}>
                        <ElementFragments
                            actions={isPrivate && (
                                <IoLockOpenOutline />
                            )}
                        >
                            {isPrivate ? (
                                _ts('home.recentProjects', 'privateProjectLabel')
                            ) : (
                                _ts('home.recentProjects', 'publicProjectLabel')
                            )}
                        </ElementFragments>
                    </div>
                    {canEditProject && (
                        <ButtonLikeLink
                            variant="tertiary"
                            to={reverseRoute(pathNames.editProject, { projectId })}
                            icons={(
                                <FiEdit2 />
                            )}
                        >
                            {_ts('home.recentProjects', 'editProjectButtonLabel')}
                        </ButtonLikeLink>
                    )}
                </>
            )}
            contentClassName={styles.content}
            horizontallyCompactContent
            footerActions={(
                <ButtonLikeLink
                    to={reverseRoute(pathNames.leads, { projectId })}
                >
                    {canAddEntries
                        ? _ts('home', 'continueTaggingButton')
                        : _ts('home', 'viewTaggingButton')
                    }
                </ButtonLikeLink>
            )}
        >
            <div className={styles.info}>
                <div className={styles.basicDetails}>
                    <div className={styles.description}>
                        {description}
                    </div>
                </div>
                <div className={styles.metadata}>
                    <div className={styles.column}>
                        <TextOutput
                            label={_ts('home.recentProjects', 'projectOwnerLabel')}
                            value={projectOwnerName}
                            block
                            hideLabelColon
                        />
                        <TextOutput
                            label={_ts('home.recentProjects', 'analysisFrameworkLabel')}
                            value={analysisFramework && (
                                <FrameworkImageButton
                                    frameworkId={analysisFramework}
                                    label={analysisFrameworkTitle}
                                />
                            )}
                            hideLabelColon
                            block
                        />
                        <TextOutput
                            label={_ts('home.recentProjects', 'teamMembersTitle')}
                            value={totalUsers}
                            valueType="number"
                            hideLabelColon
                            block
                        />
                    </div>
                    <div className={styles.column}>
                        <TextOutput
                            label={_ts('home.recentProjects', 'recentlyActiveUsersLabel')}
                            block
                            hideLabelColon
                            valueContainerClassName={styles.recentlyActiveList}
                            value={(
                                <List
                                    data={recentlyActive}
                                    keySelector={recentlyActiveKeySelector}
                                    rendererParams={recentlyActiveRendererParams}
                                    renderer={TextOutput}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.charts}>
                <InformationCard
                    className={styles.totalSources}
                    icon={(
                        <IoBookmarkOutline className={styles.bookmarkIcon} />
                    )}
                    label={_ts('home.recentProjects', 'totalSourcesLabel')}
                    value={totalSources}
                    variant="accent"
                />
                <Card className={styles.progressLines}>
                    <ProgressLine
                        progress={(totalSourcesValidated / totalSources) * 100}
                        title={_ts('home.recentProjects', 'sourcesTaggedValidatedLabel')}
                        variant="complement1"
                    />
                    <ProgressLine
                        progress={(totalSourcesTagged / totalSources) * 100}
                        title={_ts('home.recentProjects', 'sourcesTaggedLabel')}
                        variant="complement2"
                    />
                    <ProgressLine
                        progress={
                            ((totalSources - totalSourcesTagged) / totalSources) * 100
                        }
                        title={_ts('home.recentProjects', 'sourcesUntaggedLabel')}
                        variant="complement3"
                    />
                </Card>
                <ContainerCard
                    className={styles.projectActivityContainer}
                    heading={_ts('home.recentProjects', 'projectActivityLabel')}
                    headerClassName={styles.chartHeader}
                    contentClassName={styles.chartContainer}
                    sub
                >
                    <ResponsiveContainer className={styles.responsiveContainer}>
                        <AreaChart data={convertedProjectActivity} >
                            <defs>
                                <linearGradient id="projectActivity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--dui-color-accent)" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="var(--dui-color-accent)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                tick={{ strokeWidth: 1 }}
                                tickFormatter={minTickFormatter}
                                padding={{ left: 10, right: 10 }}
                            />
                            <YAxis hide />
                            <Tooltip
                                labelFormatter={tickFormatter}
                                isAnimationActive={false}
                            />
                            <Area
                                dataKey="count"
                                stroke="var(--dui-color-accent)"
                                fillOpacity={1}
                                fill="url(#projectActivity)"
                                strokeWidth={2}
                                dot
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ContainerCard>
            </div>
        </ContainerCard>
    );
}

export default connect(mapStateToProps)(ProjectItem);
