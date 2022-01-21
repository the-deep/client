import React, { useCallback, useMemo } from 'react';
import { FiEdit2 } from 'react-icons/fi';
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
    NumberOutput,
    InformationCard,
    Element,
    List,
    TextOutput,
    DateOutput,
    DateRangeOutput,
    Message,
    Kraken,
} from '@the-deep/deep-ui';

import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import ProgressLine from '#components/ProgressLine';
import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import routes from '#base/configs/routes';

import {
    DateCountType,
    UserEntityCountType,
    ProjectPermission,
} from '#generated/types';

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

const topUserKeySelector = (d: UserEntityCountType) => d?.id ?? '';

export interface RecentProjectItemProps {
    className?: string;
    projectId?: string;
    title?: string;
    isPrivate?: boolean;
    startDate: string | null | undefined;
    endDate: string | null | undefined;
    description?: string;
    projectOwnerName: string | null | undefined;
    analysisFrameworkTitle: string | undefined;
    analysisFramework: string | undefined;
    totalUsers: number | null | undefined;
    totalSources: number | null | undefined;
    totalSourcesTagged: number | null | undefined;
    totalSourcesInProgress: number | null | undefined;
    entriesActivity: DateCountType[] | null | undefined;
    topTaggers: UserEntityCountType[] | null | undefined;
    topSourcers: UserEntityCountType[] | null | undefined;
    allowedPermissions: ProjectPermission[] | null | undefined;
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
        totalSourcesInProgress = 0,
        topTaggers,
        topSourcers,
        entriesActivity,
        allowedPermissions,
    } = props;

    const topTaggersRendererParams = useCallback((_: unknown, data: UserEntityCountType) => ({
        className: styles.recentlyActiveItem,
        label: data.name,
        labelContainerClassName: styles.recentlyActiveUserName,
        hideLabelColon: true,
        value: (
            <DateOutput
                className={styles.recentActivityDate}
                // FIXME: Get this information from server
                value={null}
                format="hh:mm aaa, MMM dd, yyyy"
            />
        ),
    }), []);

    const userStatsRendererParams = useCallback((_: unknown, data: UserEntityCountType) => ({
        className: styles.recentlyActiveItem,
        label: data.name,
        labelContainerClassName: styles.recentlyActiveUserName,
        hideLabelColon: true,
        value: (
            <NumberOutput
                className={styles.recentActivityDate}
                value={data.count ?? 0}
            />
        ),
    }), []);

    const convertedProjectActivity = useMemo(() => (
        entriesActivity?.map((pa) => ({
            count: pa.count,
            date: pa.date ? (new Date(pa.date)).getTime() : undefined,
        })).sort((a, b) => compareDate(a.date, b.date))
    ), [entriesActivity]);

    const canEditProject = allowedPermissions?.includes('UPDATE_PROJECT');

    return (
        <ContainerCard
            spacing="loose"
            className={_cs(className, styles.projectItem)}
            heading={title}
            headingSize="small"
            headingDescription={(
                <DateRangeOutput
                    className={styles.projectDateRange}
                    startDate={startDate}
                    endDate={endDate}
                />
            )}
            headerActions={(
                <>
                    <Element
                        className={styles.privacyBadge}
                        actions={isPrivate && (
                            <IoLockOpenOutline />
                        )}
                    >
                        {isPrivate ? (
                            _ts('home.recentProjects', 'privateProjectLabel')
                        ) : (
                            _ts('home.recentProjects', 'publicProjectLabel')
                        )}
                    </Element>
                    {canEditProject && (
                        <SmartButtonLikeLink
                            variant="tertiary"
                            route={routes.projectEdit}
                            attrs={{
                                projectId,
                            }}
                            icons={(
                                <FiEdit2 />
                            )}
                        >
                            {_ts('home.recentProjects', 'editProjectButtonLabel')}
                        </SmartButtonLikeLink>
                    )}
                </>
            )}
            contentClassName={styles.content}
            borderBelowHeader
            borderBelowHeaderWidth="thin"
            // TODO: there should be two different urls for editing and viewing entry
            footerActions={(
                <SmartButtonLikeLink
                    route={routes.tagging}
                    attrs={{
                        projectId,
                    }}
                >
                    {allowedPermissions?.includes('UPDATE_ENTRY')
                        ? _ts('home', 'continueTaggingButton')
                        : _ts('home', 'viewTaggingButton')}
                </SmartButtonLikeLink>
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
                        {/*
                        // TODO: Add recently active users
                        <TextOutput
                            label={_ts('home.recentProjects', 'recentlyActiveUsersLabel')}
                            block
                            hideLabelColon
                            valueContainerClassName={styles.recentlyActiveList}
                            value={(
                                <List
                                    data={topTaggers ?? undefined}
                                    keySelector={topUserKeySelector}
                                    rendererParams={topTaggersRendererParams}
                                    renderer={TextOutput}
                                />
                            )}
                        />
                        */}
                        {canEditProject && (
                            <>
                                <TextOutput
                                    label="Top Taggers"
                                    block
                                    hideLabelColon
                                    valueContainerClassName={styles.recentlyActiveList}
                                    value={(
                                        <List
                                            data={topTaggers ?? undefined}
                                            keySelector={topUserKeySelector}
                                            rendererParams={userStatsRendererParams}
                                            renderer={TextOutput}
                                        />
                                    )}
                                />
                                <TextOutput
                                    label="Top Sourcers"
                                    block
                                    hideLabelColon
                                    valueContainerClassName={styles.recentlyActiveList}
                                    value={(
                                        <List
                                            data={topSourcers ?? undefined}
                                            keySelector={topUserKeySelector}
                                            rendererParams={userStatsRendererParams}
                                            renderer={TextOutput}
                                        />
                                    )}
                                />
                            </>
                        )}
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
                    value={totalSources ?? 0}
                    variant="accent"
                />
                <Card className={styles.progressLines}>
                    <ProgressLine
                        progress={((totalSourcesTagged ?? 0) / (totalSources ?? 0)) * 100}
                        title="Sources tagged"
                        variant="complement1"
                    />
                    <ProgressLine
                        progress={((totalSourcesInProgress ?? 0) / (totalSources ?? 0)) * 100}
                        title="Sources in progress"
                        variant="complement2"
                    />
                    <ProgressLine
                        progress={
                            // eslint-disable-next-line max-len
                            (((totalSources ?? 0) - (totalSourcesTagged ?? 0) - (totalSourcesInProgress ?? 0)) / (totalSources ?? 0)) * 100
                        }
                        title="Sources not tagged"
                        variant="complement3"
                    />
                </Card>
                <ContainerCard
                    className={styles.entriesActivityContainer}
                    heading={_ts('home.recentProjects', 'projectActivityLabel')}
                    contentClassName={styles.chartContainer}
                    headingSize="extraSmall"
                >
                    <ResponsiveContainer className={styles.responsiveContainer}>
                        {((convertedProjectActivity?.length ?? 0) > 0) ? (
                            <AreaChart data={convertedProjectActivity}>
                                <defs>
                                    <linearGradient id="entriesActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--dui-color-accent)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--dui-color-accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    type="number"
                                    scale="time"
                                    domain={['dataMin', 'dataMax']}
                                    allowDuplicatedCategory={false}
                                    tick={{ strokeWidth: 1 }}
                                    tickFormatter={minTickFormatter}
                                    interval="preserveStartEnd"
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
                                    connectNulls
                                    activeDot
                                />
                            </AreaChart>
                        ) : (
                            <Message
                                icon={
                                    <Kraken variant="sleep" />
                                }
                                message="This project does not have any activity."
                            />
                        )}
                    </ResponsiveContainer>
                </ContainerCard>
            </div>
        </ContainerCard>
    );
}

export default ProjectItem;
