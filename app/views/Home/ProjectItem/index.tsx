import React, { useCallback, useMemo } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import {
    _cs,
    compareDate,
    isDefined,
} from '@togglecorp/fujs';
import {
    IoBookmarkOutline,
    IoLockOpenOutline,
} from 'react-icons/io5';
import {
    RiPushpinFill,
    RiUnpinFill,
} from 'react-icons/ri';
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
    QuickActionButton,
    useAlert,
} from '@the-deep/deep-ui';
import { useMutation, gql } from '@apollo/client';

import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import SmartQuickActionLink from '#base/components/SmartQuickActionLink';
import ProgressLine from '#components/ProgressLine';
import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import routes from '#base/configs/routes';

import {
    DateCountType,
    UserEntityCountType,
    UserEntityDateType,
    ProjectPermission,
    PinProjectMutation,
    PinProjectMutationVariables,
    UnpinProjectMutation,
    UnpinProjectMutationVariables,
} from '#generated/types';

import _ts from '#ts';

import styles from './styles.css';

const PIN_PROJECT = gql`
mutation PinProject ($projectId: ID!) {
    createUserPinnedProject(
        data: {
            project: $projectId
        }
    ) {
        errors
        ok
    }
}
`;

const UNPIN_PROJECT = gql`
mutation UnpinProject ($projectId: ID!) {
    deleteUserPinnedProject (
        id: $projectId
    ) {
        errors
        ok
    }
}
`;

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

const topUserKeySelector = (d: UserEntityCountType) => d?.userId;
const activeUserKeySelector = (d: UserEntityDateType) => d?.userId;

export interface RecentProjectItemProps {
    className?: string;
    projectId: string | undefined;
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
    recentActiveUsers: UserEntityDateType[] | null | undefined;
    isPinned?: boolean;
    onProjectPinChange: () => void;
    disablePinButton: boolean;
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
        recentActiveUsers,
        isPinned,
        onProjectPinChange,
        disablePinButton,
    } = props;

    const alert = useAlert();

    const [
        pinProject,
    ] = useMutation<PinProjectMutation, PinProjectMutationVariables>(
        PIN_PROJECT,
        {
            onCompleted: (response) => {
                const pinProjectResponse = response?.createUserPinnedProject;
                if (pinProjectResponse?.ok) {
                    onProjectPinChange();
                    alert.show(
                        'Project successfully pinned.',
                        { variant: 'success' },
                    );
                } else {
                    alert.show(
                        'An error occured while pinning a project.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'An error occured while pinning a project.',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        unpinProject,
    ] = useMutation<UnpinProjectMutation, UnpinProjectMutationVariables>(
        UNPIN_PROJECT,
        {
            onCompleted: (response) => {
                const unpinProjectResponse = response?.deleteUserPinnedProject;
                if (unpinProjectResponse?.ok) {
                    onProjectPinChange();
                    alert.show(
                        'Project successfully unpinned.',
                        { variant: 'success' },
                    );
                } else {
                    alert.show(
                        'An error occured while unpinning a project.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'An error occured while pinning a project.',
                    { variant: 'error' },
                );
            },
        },
    );

    const activeUserRendererParams = useCallback((_: unknown, data: UserEntityDateType) => ({
        className: styles.recentlyActiveItem,
        label: data.name,
        labelContainerClassName: styles.recentlyActiveUserName,
        hideLabelColon: true,
        value: (
            <DateOutput
                className={styles.recentActivityDate}
                // FIXME: Get this information from server
                value={data.date}
                format="hh:mm aaa, dd MMM, yyyy"
            />
        ),
    }), []);

    const userStatsRendererParams = useCallback((_: unknown, data: UserEntityCountType) => ({
        className: styles.recentlyActiveItem,
        label: data.name ?? 'Anon',
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
            activity: pa.count,
            date: pa.date ? (new Date(pa.date)).getTime() : undefined,
        })).sort((a, b) => compareDate(a.date, b.date))
    ), [entriesActivity]);

    const canEditProject = allowedPermissions?.includes('UPDATE_PROJECT');

    const handleUnpinProject = useCallback((id: string) => {
        unpinProject({
            variables: {
                projectId: id,
            },
        });
    }, [
        unpinProject,
    ]);

    const handlePinProject = useCallback((id: string) => {
        pinProject({
            variables: {
                projectId: id,
            },
        });
    }, [
        pinProject,
    ]);

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
                    {isDefined(projectId) && (isPinned ? (
                        <QuickActionButton
                            name={projectId}
                            onClick={handleUnpinProject}
                            title="Unpin this project"
                        >
                            <RiUnpinFill />
                        </QuickActionButton>
                    ) : (
                        <QuickActionButton
                            name={projectId}
                            onClick={handlePinProject}
                            title={disablePinButton ? 'You can only pin 5 projects.' : 'Pin this project'}
                            disabled={disablePinButton}
                        >
                            <RiPushpinFill />
                        </QuickActionButton>
                    ))}
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
                        <SmartQuickActionLink
                            variant="tertiary"
                            route={routes.projectEdit}
                            title="Edit Project"
                            attrs={{
                                projectId,
                            }}
                        >
                            <FiEdit2 />
                        </SmartQuickActionLink>
                    )}
                    <SmartButtonLikeLink
                        route={routes.tagging}
                        attrs={{
                            projectId,
                        }}
                    >
                        Open Project
                    </SmartButtonLikeLink>
                </>
            )}
            contentClassName={styles.content}
            borderBelowHeader
            borderBelowHeaderWidth="thin"
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
                                    data={recentActiveUsers ?? undefined}
                                    keySelector={activeUserKeySelector}
                                    rendererParams={activeUserRendererParams}
                                    renderer={TextOutput}
                                />
                            )}
                        />
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
                                    name="Number of Entries"
                                    dataKey="activity"
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
