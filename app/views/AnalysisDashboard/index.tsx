import React, {
    useContext,
    useMemo,
    useState,
    useCallback,
} from 'react';

import { gql, useMutation, useQuery } from '@apollo/client';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { getOperationName } from 'apollo-link';
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

import { ProjectContext } from '#base/context/ProjectContext';
import RechartsLegend from '#components/RechartsLegend';
import Timeline from '#components/Timeline';
import {
    AnalysisSummaryQuery,
    AnalysisSummaryQueryVariables,
    DeleteAnalysisMutation,
    DeleteAnalysisMutationVariables,
} from '#generated/types';

import Analysis, { type Props as AnalysisItemProps } from './Analysis';
import AnalysisEditModal from './AnalysisEditModal';
import styles from './styles.css';

export const ANALYSIS_SUMMARY = gql`
    query AnalysisSummary(
        $projectId: ID!,
        $createdAtGte: DateTime,
        $modifiedAt: DateTime,
        $createdAtLte: DateTime,
        $page: Int,
        $pageSize: Int,
    ) {
        project(id: $projectId) {
            analyses(
                createdAtGte: $createdAtGte,
                createdAtLte: $createdAtLte,
                modifiedAt: $modifiedAt,
                page: $page,
                pageSize: $pageSize,
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
                        analysisId
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
                    id
                    count
                    title
                }
            }
            analyticalStatements {
                results {
                    id
                    entriesCount
                    statement
                }
            }
            analysisPillars {
                results {
                    assignee {
                        displayName
                        id
                    }
                        title
                        analyzedEntriesCount
                        analysisId
                        id
                        createdAt
                        statements {
                            id
                            statement
                            entriesCount
                        }
                    }
            }
        }
    }
`;

const DELETE_ANALYSIS = gql`
    mutation DeleteAnalysis(
        $projectId: ID!,
        $analysisId: ID!,
    ) {
        project(id: $projectId) {
            id
            analysisDelete(id: $analysisId) {
                ok
                errors
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

const analysisSummaryKeySelector = (item: AnalysisSummaryType) => item.id;

const labelSelector = (item: AuthoringOrganizations) => item.title;
const valueSelector = (item: AuthoringOrganizations) => item.count;
const tickFormatter = (title: string) => title;

const timelineLabelSelector = (item: TimelineData): string => item.label;
const timelineValueSelector = (item: TimelineData): number => item.value;
const timelineKeySelector = (item: TimelineData): string => item.key;

const timelineTickSelector = (item: number) => {
    const date = new Date(item);
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

    const activeProject = project?.id ? project.id : undefined;

    const [
        showAnalysisAddModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

    const alert = useAlert();

    const [activePage, setActivePage] = useState<number | undefined>(1);
    const [analysisToEdit, setAnalysisToEdit] = useState<string>();
    const [dateRangeFilter, setDateRangeFilter] = useState<Filter | undefined>(undefined);

    const variables = useMemo(
        (): AnalysisSummaryQueryVariables | undefined => (
            (project) ? ({
                projectId: project.id,
                page: activePage,
                pageSize: maxItemsPerPage,
                createdAtGte: convertDateToIsoDateTime(dateRangeFilter?.startDate),
                createdAtLte: convertDateToIsoDateTime(
                    dateRangeFilter?.endDate, { endOfDay: true },
                ),
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
        refetch: getProjectAnalysis,
    } = useQuery<AnalysisSummaryQuery, AnalysisSummaryQueryVariables>(
        ANALYSIS_SUMMARY,
        {
            variables,
        },
    );

    const [
        deleteAnalysis,
        {
            loading: deleteAnalysisPending,
        },
    ] = useMutation<DeleteAnalysisMutation, DeleteAnalysisMutationVariables>(
        DELETE_ANALYSIS,
        {
            refetchQueries: [getOperationName(ANALYSIS_SUMMARY)].filter(isDefined),
            onCompleted: (response) => {
                if (response?.project?.analysisDelete?.ok) {
                    alert.show(
                        'Successfully deleted analysis.',
                        { variant: 'success' },
                    );
                    getProjectAnalysis();
                } else {
                    alert.show(
                        'Failed to delete analysis.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete analysis.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const piechartData = analysisSummaryData?.project?.analysisOverview?.authoringOrganizations
        ?? [];

    const timelineData = useMemo(
        () => (
            analysisSummaryData?.project?.analyses?.results?.map((analyses) => ({
                key: analyses.id,
                value: new Date(analyses.createdAt).getTime(),
                label: analyses.title,
            })) ?? []
        ),
        [analysisSummaryData?.project?.analyses?.results],
    );

    const handleAnalysisEditSuccess = useCallback(() => {
        getProjectAnalysis();
        setModalHidden();
    }, [setModalHidden, getProjectAnalysis]);

    const handleAnalysisEditClick = useCallback((analysisId: string) => {
        setAnalysisToEdit(analysisId);
        setModalVisible();
    }, [setModalVisible]);

    const handleNewAnalysisCreateClick = useCallback(() => {
        setAnalysisToEdit(undefined);
        setModalVisible();
    }, [setModalVisible]);

    const handleAnalysisDeleteClick = useCallback(
        (analysisId: string) => {
            if (project) {
                deleteAnalysis({
                    variables: {
                        projectId: project.id,
                        analysisId,
                    },
                });
            }
        }, [
            deleteAnalysis,
            project,
        ],
    );

    const analyzedEntriesCount = analysisSummaryData
        ?.project?.analysisOverview?.analyzedEntriesCount;
    const analyzedLeadsCount = analysisSummaryData
        ?.project?.analysisOverview?.analyzedLeadsCount;
    const totalEntriesCount = analysisSummaryData
        ?.project?.analysisOverview?.totalEntriesCount;
    const totalLeadsCount = analysisSummaryData
        ?.project?.analysisOverview?.totalLeadsCount;

    const analysisRendererParams = useCallback(
        (id: string, data: AnalysisSummaryType): AnalysisItemProps => ({
            analysisId: id,
            onEdit: handleAnalysisEditClick,
            onDelete: handleAnalysisDeleteClick,
            title: data.title,
            startDate: data.startDate,
            endDate: data.endDate,
            teamLeadName: data.teamLead?.displayName,
            createdAt: data.createdAt,
            pillars: data.pillars,
            pillarsPending: analysisSummaryLoading,
            analyzedLeads: analyzedLeadsCount,
            analyzedEntries: analyzedEntriesCount,
            totalSources: totalLeadsCount,
            totalEntries: totalEntriesCount,
            onAnalysisCloseSuccess: getProjectAnalysis,
            onAnalysisPillarDelete: getProjectAnalysis,
            pendingAnalysisDelete: deleteAnalysisPending && data.id === id,
        }), [
            analyzedEntriesCount,
            analyzedLeadsCount,
            totalLeadsCount,
            totalEntriesCount,
            getProjectAnalysis,
            handleAnalysisEditClick,
            handleAnalysisDeleteClick,
            deleteAnalysisPending,
            analysisSummaryLoading,
        ],
    );

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
                footerActions={isDefined(analysisSummaryData) && (
                    <Pager
                        activePage={Number(activePage)}
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
            {showAnalysisAddModal && activeProject && analysisToEdit && (
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
