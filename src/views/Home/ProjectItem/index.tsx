import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    compareDate,
    reverseRoute,
} from '@togglecorp/fujs';
import { IoBookmarkOutline } from 'react-icons/io5';

import {
    ContainerCard,
    Card,
    ButtonLikeLink,
} from '@the-deep/deep-ui';

import FormattedDate from '#rscv/FormattedDate';
import DateRangeOutput from '#dui/DateRangeOutput';
import List from '#rscv/List';
import Icon from '#rscg/Icon';
import TextOutput from '#components/general/TextOutput';
import InformationCard from '#dui/InformationCard';
import ProgressLine from '#components/viz/ProgressLine';

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
} from '#typings';
import { pathNames } from '#constants';

import _ts from '#ts';

import styles from './styles.scss';

const emptyComponent = () => null;

interface RecentlyActiveUserProps {
    className?: string;
    name: string;
    date: string;
}

function RecentlyActiveUser(props: RecentlyActiveUserProps) {
    const {
        className,
        name,
        date,
    } = props;

    return (
        <div className={_cs(className, styles.recentlyActiveUser)}>
            <div className={styles.name}>
                {name}
            </div>
            <FormattedDate
                className={styles.date}
                // FIXME: Remove this fallback
                value={date ?? Date.now()}
                mode="hh:mmaaa, MMM dd, yyyy"
                emptyComponent={emptyComponent}
            />
        </div>
    );
}

const tickFormatter = (value: number | string) => {
    const date = new Date(value);
    return date.toDateString();
};

const minTickFormatter = (value: number | string) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
};

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
    totalUsers: number;
    totalSources: number;
    totalSourcesTagged: number;
    totalSourcesValidated: number;
    projectActivity: CountTimeSeries[];
    recentlyActive: UserActivityStat[];
}

const recentlyActiveKeySelector = (d: UserActivityStat) => d.id;

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
        totalUsers,
        totalSources = 0,
        totalSourcesTagged = 0,
        totalSourcesValidated = 0,
        recentlyActive,
        projectActivity,
    } = props;

    const recentlyActiveRendererParams = useCallback((key, data) => ({
        name: data.name,
        date: data.date,
    }), []);

    const convertedProjectActivity = useMemo(() => (
        projectActivity?.map(pa => ({
            count: pa.count,
            date: (new Date(pa.date)).getTime(),
        })).sort((a, b) => compareDate(a.date, b.date))
    ), [projectActivity]);

    return (
        <ContainerCard
            className={_cs(className, styles.projectItem)}
            heading={title}
            sub
            headerDescription={(
                <DateRangeOutput
                    startDate={startDate}
                    endDate={endDate}
                />
            )}
            headerActions={(
                <>
                    <div className={styles.privacyLabel}>
                        {isPrivate ? (
                            _ts('home.recentProjects', 'privateProjectLabel')
                        ) : (
                            _ts('home.recentProjects', 'publicProjectLabel')
                        )}
                    </div>
                    <Icon
                        className={styles.privacyIcon}
                        name={isPrivate ? 'locked' : 'unlocked'}
                    />
                    <ButtonLikeLink
                        className={styles.link}
                        variant="tertiary"
                        to={reverseRoute(pathNames.editProject, { projectId })}
                        icons={(
                            <Icon
                                name="edit"
                            />
                        )}
                    >
                        {_ts('home.recentProjects', 'editProjectButtonLabel')}
                    </ButtonLikeLink>
                </>
            )}
            contentClassName={styles.content}
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
                            type="small-block"
                        />
                        <TextOutput
                            label={_ts('home.recentProjects', 'analysisFrameworkLabel')}
                            value={analysisFrameworkTitle}
                            type="small-block"
                        />
                        <TextOutput
                            label={_ts('home.recentProjects', 'teamMembersTitle')}
                            value={totalUsers}
                            type="small-block"
                            isNumericValue
                        />
                    </div>
                    <div className={styles.column}>
                        <TextOutput
                            label={_ts('home.recentProjects', 'recentlyActiveUsersLabel')}
                            type="small-block"
                            value={(
                                <List
                                    data={recentlyActive}
                                    keySelector={recentlyActiveKeySelector}
                                    rendererParams={recentlyActiveRendererParams}
                                    renderer={RecentlyActiveUser}
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
                            <Tooltip labelFormatter={tickFormatter} />
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

export default ProjectItem;
