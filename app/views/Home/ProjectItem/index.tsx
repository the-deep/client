import React, { useCallback, useMemo } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import {
    generatePath,
} from 'react-router-dom';
import {
    _cs,
    compareDate,
} from '@togglecorp/fujs';
import {
    IoBookmarkOutline,
    IoLockOpenOutline,
} from 'react-icons/io5';
import {
    AreaChart,
    XAxis,
    YAxis,
    Tooltip,
    Area,
    ResponsiveContainer,
} from 'recharts';

import {
    ContainerCard,
    Card,
    ButtonLikeLink,
    InformationCard,
    ElementFragments,
    List,
    TextOutput,
    DateOutput,
    DateRangeOutput,
} from '@the-deep/deep-ui';

import ProgressLine from '#components/ProgressLine';
import FrameworkImageButton from '#components/FrameworkImageButton';
import routes from '#base/configs/routes';

import {
    UserActivityStat,
    CountTimeSeries,
} from '#types';

import _ts from '#ts';

import styles from './styles.css';

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

interface RecentProjectItemProps {
    className?: string;
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
    entriesActivity: CountTimeSeries[];
    recentlyActive: UserActivityStat[];
}

function ProjectItem(props: RecentProjectItemProps) {
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
        entriesActivity,
    } = props;

    const recentlyActiveRendererParams = useCallback((_, data) => ({
        className: styles.recentlyActiveItem,
        label: data.name,
        labelContainerClassName: styles.recentlyActiveUserName,
        hideLabelColon: true,
        value: (
            <DateOutput
                className={styles.recentActivityDate}
                // FIXME: Remove this fallback
                value={data.date ?? Date.now()}
                format="hh:mmaaa, MMM dd, yyyy"
            />
        ),
    }), []);

    const convertedProjectActivity = useMemo(() => (
        entriesActivity?.map((pa) => ({
            count: pa.count,
            date: (new Date(pa.date)).getTime(),
        })).sort((a, b) => compareDate(a.date, b.date))
    ), [entriesActivity]);

    // TODO: get these from server later on
    const canEditProject = true;
    const canAddEntries = true;

    const routeToTagging = generatePath(
        routes.tagging.path,
        {
            projectId,
        },
    );

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
                            to={generatePath(routes.projectEdit.path, { projectId })}
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
            spacing="comfortable"
            footerActions={(
                <ButtonLikeLink
                    to={routeToTagging ?? ''}
                >
                    {(canAddEntries
                        ? _ts('home', 'continueTaggingButton')
                        : _ts('home', 'viewTaggingButton')
                    )}
                </ButtonLikeLink>
            )}
        >
            <div className={styles.info}>
                {description && (
                    <div className={styles.basicDetails}>
                        {description}
                    </div>
                )}
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
                    className={styles.entriesActivityContainer}
                    heading={_ts('home.recentProjects', 'projectActivityLabel')}
                    headerClassName={styles.chartHeader}
                    contentClassName={styles.chartContainer}
                >
                    <ResponsiveContainer className={styles.responsiveContainer}>
                        <AreaChart data={convertedProjectActivity}>
                            <defs>
                                <linearGradient id="entriesActivity" x1="0" y1="0" x2="0" y2="1">
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
                                fill="url(#entriesActivity)"
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

export default ProjectItem;
