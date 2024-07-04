import React, {
    useContext,
    useMemo,
    useState,
    useCallback,
} from 'react';

import { gql, useQuery } from '@apollo/client';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    IoDocumentOutline,
    IoCheckmarkCircle,
    IoBookmarkOutline,
    IoDocumentTextOutline,
    IoPieChart,
    IoStatsChart,
    IoAdd,
} from 'react-icons/io5';
import {
    PieChart,
    Pie,
    ResponsiveContainer,
    Tooltip,
    Legend,
    Cell,
} from 'recharts';
import {
    DateRangeInput,
    useAlert,
    ContainerCard,
    Pager,
    Card,
    Container,
    InformationCard,
    PercentageInformationCard,
    ListView,
    Kraken,
    useModalState,
    Button,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import {
    convertDateToIsoDateTime,
    shortMonthNamesMap,
    calcPercent,
} from '#utils/common';
import { SubNavbarActions } from '#components/SubNavbar';

import { useLazyRequest } from '#base/utils/restRequest';
import { ProjectContext } from '#base/context/ProjectContext';
import RechartsLegend from '#components/RechartsLegend';
import Timeline from '#components/Timeline';
import {
    AnalysisSummaryQuery,
    AnalysisSummaryQueryVariables,
} from '#generated/types';

import Analysis from './Analysis';
import AnalysisEditModal from './AnalysisEditModal';
import styles from './styles.css';

const ANALYSIS_SUMMARY = gql`
    query AnalysisSummary(
        $project: ID!,
        $createdAtGte: DateTime,
        $modifiedAt: DateTime,
        $createdAtLte: DateTime,
    ) {
        project(id: $project) {
        analyses(
            createdAtGte: $createdAtGte,
            createdAtLte: $createdAtLte,
            modifiedAt: $modifiedAt,
        ) {
        results {
            id
            analyzedEntriesCount
            analyzedLeadsCount
            modifiedAt
            createdAt
            startDate
            endDate
            title
            teamLead {
                id
                displayName
            }
            pillars {
                id
                title
                createdAt
                analysis
                analyzedEntriesCount
                assignee {
                    displayName
                    id
                }
            }
        }
            totalCount
        }
        analysisOverview {
            analyzedEntriesCount
            analyzedLeadsCount
            totalEntriesCount
            totalLeadsCount
            authoringOrganizations {
                count
                id
                title
            }
        }
    }
}
`;

export type AnalysisSummaryType = NonNullable<NonNullable<NonNullable<AnalysisSummaryQuery['project']>['analyses']>['results']>[number];
type AuthoringOrganizations = NonNullable<NonNullable<NonNullable<AnalysisSummaryQuery['project']>['analysisOverview']>['authoringOrganizations']>[number];

const maxItemsPerPage = 5;

const colorScheme = [
    '#008eff',
    '#1a3ed0',
    '#00c9f0',
    '#2878bf',
    '#71efff',
    '#42b7df',
    '#0053af',
    '#3f9fcf',
    '#5fd1ef',
];

type Filter = {
    startDate: string;
    endDate: string;
};

type TimelineData = {
    key: string;
    value: number;
    label: string;
};

const analysisSummaryKeySelector = (d: AnalysisSummaryType) => d.id;

const labelSelector = (item: AuthoringOrganizations) => item.title;
const valueSelector = (item: AuthoringOrganizations) => item.count;
const tickFormatter = (title: string) => title;

const timelineLabelSelector = (d: TimelineData): string => d.label;
const timelineValueSelector = (d: TimelineData): number => d.value;
const timelineKeySelector = (d: TimelineData): string => d.key;

const timelineTickSelector = (d: number) => {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = date.getMonth();

    return `${year}-${shortMonthNamesMap[month]}`;
};

interface AnalysisDashboardProps {
    className?: string;
}

function AnalysisDashboard(props: AnalysisDashboardProps) {
    const {
        className,
    } = props;

    const {
        project,
    } = useContext(ProjectContext);

    const activeProject = project?.id ? +project.id : undefined;

    const [
        showAnalysisAddModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

    const alert = useAlert();

    const [activePage, setActivePage] = useState(1);
    const [analysisToEdit, setAnalysisToEdit] = useState<string | undefined>();
    const [dateRangeFilter, setDateRangeFilter] = useState<Filter | undefined>(undefined);

    const variables = useMemo(
        () => ((project) ? ({
            project: project.id,
            page: activePage,
            pageSize: maxItemsPerPage,
            createdAtGte: convertDateToIsoDateTime(dateRangeFilter?.startDate),
            createdAtLte: convertDateToIsoDateTime(dateRangeFilter?.endDate, { endOfDay: true }),
        }) : undefined),
        [
            project,
            activePage,
            dateRangeFilter?.startDate,
            dateRangeFilter?.endDate,
        ],
    );

    const {
        data: analysisSummaryData,
        loading: analysisSummaryLoading,
        refetch,
    } = useQuery<AnalysisSummaryQuery, AnalysisSummaryQueryVariables>(
        ANALYSIS_SUMMARY,
        {
            variables,
        },
    );

    const {
        pending: pendingAnalysisDelete,
        trigger: deleteAnalysisTrigger,
        context: analysisIdToDelete,
    } = useLazyRequest<unknown, string>(
        {
            url: (ctx) => `server://projects/${activeProject}/analysis/${ctx}/`,
            method: 'DELETE',
            onSuccess: () => {
                refetch();
                alert.show(
                    _ts('analysis', 'analysisDeleteSuccessful'),
                    {
                        variant: 'success',
                    },
                );
            },
            failureMessage: 'Failed to delete analysis.',
        },
    );

    const piechartData = analysisSummaryData?.project?.analysisOverview?.authoringOrganizations
        ?? [];

    const timelineData = useMemo(
        () => (
            analysisSummaryData?.project?.analyses?.results?.map((d) => ({
                key: d.id,
                value: new Date(d.createdAt).getTime(),
                label: d.title,
            })) ?? []
        ),
        [analysisSummaryData?.project?.analyses?.results],
    );

    const handleAnalysisToDeleteClick = deleteAnalysisTrigger;

    const handleAnalysisEditSuccess = useCallback(() => {
        refetch();
        setModalHidden();
    }, [setModalHidden, refetch]);

    const handleAnalysisEditClick = useCallback((analysisId: string | undefined) => {
        setAnalysisToEdit(analysisId);
        setModalVisible();
    }, [setModalVisible]);

    const handleNewAnalysisCreateClick = useCallback(() => {
        setAnalysisToEdit(undefined);
        setModalVisible();
    }, [setModalVisible]);

    const analysisRendererParams = useCallback((id: string, data: AnalysisSummaryType) => ({
        analysisId: id,
        onEdit: handleAnalysisEditClick,
        onDelete: handleAnalysisToDeleteClick,
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        teamLeadName: data.teamLead?.displayName,
        createdAt: data.createdAt,
        modifiedAt: data.modifiedAt,
        pillars: data.pillars,
        pillarsPending: analysisSummaryLoading,
        analyzedLeads: data.analyzedLeadsCount,
        analyzedEntries: data.analyzedEntriesCount,
        // FIX ME: Add `Total Lead count`
        totalSources: data?.analyzedLeadsCount,
        // FIX ME: Add `Total Entries count`
        totalEntries: data?.analyzedEntriesCount,
        onAnalysisCloseSuccess: refetch,
        onAnalysisPillarDelete: refetch,
        pendingAnalysisDelete: pendingAnalysisDelete && analysisIdToDelete === id,
    }), [
        refetch,
        handleAnalysisEditClick,
        handleAnalysisToDeleteClick,
        pendingAnalysisDelete,
        analysisIdToDelete,
        analysisSummaryLoading,
    ]);
    const canTagEntry = project?.allowedPermissions?.includes('UPDATE_ENTRY');

    return (
        <div className={_cs(styles.analysisModule, className)}>
            <SubNavbarActions>
                {canTagEntry && (
                    <Button
                        name={undefined}
                        variant="primary"
                        onClick={handleNewAnalysisCreateClick}
                        icons={(
                            <IoAdd />
                        )}
                    >
                        {_ts('analysis', 'setupNewAnalysisButtonLabel')}
                    </Button>
                )}
            </SubNavbarActions>
            <Container
                className={styles.summary}
                contentClassName={styles.summaryContent}
                heading={_ts('analysis', 'analysesOverview')}
            >
                <div className={styles.infoCardContainer}>
                    <InformationCard
                        coloredBackground
                        icon={<IoDocumentTextOutline />}
                        label={_ts('analysis', 'totalSourcesLabel')}
                        value={analysisSummaryData?.project?.analysisOverview?.totalLeadsCount}
                        variant="accent"
                    />
                    <InformationCard
                        coloredBackground
                        icon={<IoBookmarkOutline />}
                        label={_ts('analysis', 'totalEntriesLabel')}
                        value={analysisSummaryData?.project?.analysisOverview?.totalEntriesCount}
                        variant="complement1"
                    />
                    <PercentageInformationCard
                        value={calcPercent(
                            analysisSummaryData?.project?.analysisOverview?.analyzedLeadsCount,
                            analysisSummaryData?.project?.analysisOverview?.totalLeadsCount,
                        )}
                        label={_ts('analysis', 'sourcesAnalyzedLabel')}
                        variant="complement1"
                        icon={<IoDocumentOutline />}
                    />
                    <PercentageInformationCard
                        value={calcPercent(
                            analysisSummaryData?.project?.analysisOverview?.analyzedEntriesCount,
                            analysisSummaryData?.project?.analysisOverview?.totalEntriesCount,
                        )}
                        variant="complement2"
                        label={_ts('analysis', 'entriesAnalyzedLabel')}
                        icon={<IoCheckmarkCircle />}
                    />
                </div>
                <ContainerCard
                    className={styles.pieChartContainer}
                    footerContent={_ts('analysis', 'sourcesByTypeLabel')}
                    contentClassName={styles.pieChartContent}
                >
                    {piechartData?.length > 0 ? (
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={piechartData}
                                    dataKey={valueSelector}
                                    nameKey={labelSelector}
                                >
                                    {piechartData.map((
                                        entry: AuthoringOrganizations,
                                        index: number,
                                    ) => (
                                        <Cell
                                            key={entry.id}
                                            fill={colorScheme[
                                                index % colorScheme.length
                                            ]}
                                        />
                                    ))}
                                </Pie>
                                <Legend
                                    verticalAlign="bottom"
                                    content={<RechartsLegend className={styles.legend} />}
                                />
                                <Tooltip
                                    labelFormatter={tickFormatter}
                                    isAnimationActive={false}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.emptyChart}>
                            <IoPieChart
                                className={styles.icon}
                            />
                            <div className={styles.text}>
                                {/* FIXME: use strings with appropriate wording */}
                                Chart not available
                            </div>
                        </div>
                    )}
                </ContainerCard>
                <Card className={styles.analysesTimelineContainer}>
                    {timelineData?.length > 0 ? (
                        <Timeline
                            data={timelineData}
                            labelSelector={timelineLabelSelector}
                            valueSelector={timelineValueSelector}
                            keySelector={timelineKeySelector}
                            tickLabelSelector={timelineTickSelector}
                        />
                    ) : (
                        <div className={styles.emptyChart}>
                            <IoStatsChart
                                className={styles.icon}
                            />
                            <div className={styles.text}>
                                {/* FIXME: use strings with appropriate wording */}
                                Chart not available
                            </div>
                        </div>
                    )}
                </Card>
            </Container>
            <Container
                className={styles.allAnalyses}
                contentClassName={styles.analysesContainer}
                heading={_ts('analysis', 'allAnalyses')}
                headingDescription={analysisSummaryData?.project?.analyses?.totalCount}
                headerDescriptionClassName={styles.headingDescription}
                inlineHeadingDescription
                headerActions={(
                    <DateRangeInput
                        name="dateFilter"
                        value={dateRangeFilter}
                        onChange={setDateRangeFilter}
                        variant="general"
                    />
                )}
                footerActions={(
                    <Pager
                        activePage={activePage}
                        itemsCount={analysisSummaryData?.project?.analyses?.totalCount ?? 0}
                        maxItemsPerPage={maxItemsPerPage}
                        onActivePageChange={setActivePage}
                        itemsPerPageControlHidden
                    />
                )}
            >
                <ListView
                    className={styles.analysisList}
                    data={analysisSummaryData?.project?.analyses?.results}
                    renderer={Analysis}
                    rendererParams={analysisRendererParams}
                    keySelector={analysisSummaryKeySelector}
                    pending={analysisSummaryLoading}
                    filtered={!!dateRangeFilter}
                    errored={false}
                    emptyMessage={_ts('analysis', 'noAnalysisCreatedLabel')}
                    emptyIcon={(
                        <Kraken
                            size="large"
                            variant="experiment"
                        />
                    )}
                    messageIconShown
                    messageShown
                />
            </Container>
            {showAnalysisAddModal && activeProject && (
                <AnalysisEditModal
                    onSuccess={handleAnalysisEditSuccess}
                    onModalClose={setModalHidden}
                    projectId={activeProject}
                    analysisToEdit={analysisToEdit}
                />
            )}
        </div>
    );
}
export default AnalysisDashboard;
