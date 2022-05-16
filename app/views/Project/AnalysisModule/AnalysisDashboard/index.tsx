import React, {
    useContext,
    useMemo,
    useState,
    useCallback,
} from 'react';
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
import {
    AnalysisSummary,
    MultiResponse,
} from '#types';
import _ts from '#ts';
import {
    convertDateToIsoDateTime,
    shortMonthNamesMap,
    calcPercent,
} from '#utils/common';
import { SubNavbarActions } from '#components/SubNavbar';

import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import Analysis from '../Analysis';
import AnalysisEditModal from '../AnalysisEditModal';
import { ProjectContext } from '#base/context/ProjectContext';
import RechartsLegend from '#components/RechartsLegend';
import Timeline from '#components/Timeline';
import styles from './styles.css';

const analysisKeySelector = (d: AnalysisSummary) => d.id;
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
interface AnalysisList {
    id: number;
    title: string;
    createdAt: string;
}
interface AuthoringOrganizations {
    count: number;
    organizationTypeId: number;
    organizationTypeTitle: string;
}
interface TimelineData {
    key: number;
    value: number;
    label: string;
}

const labelSelector = (item: AuthoringOrganizations) => item.organizationTypeTitle;
const valueSelector = (item: AuthoringOrganizations) => item.count;
const tickFormatter = (title: string) => ({ title });

const timelineLabelSelector = (item: TimelineData) => item.label;
const timelineValueSelector = (item: TimelineData) => item.value;
const timelineKeySelector = (item: TimelineData) => item.key;

const timelineTickSelector = (d: number) => {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = date.getMonth();

    return `${year}-${shortMonthNamesMap[month]}`;
};
interface AnalysisOverview {
    analysisList: AnalysisList[];
    entriesTotal: number;
    analyzedEntriesCount: number;
    sourcesTotal: number;
    analyzedSourceCount: number;
    authoringOrganizations: AuthoringOrganizations[];
}
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
    const [analysisToEdit, setAnalysisToEdit] = useState();
    const [dateRangeFilter, setDateRangeFilter] = useState<Filter | undefined>(undefined);

    const analysisQueryOptions = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
        created_at__gte: convertDateToIsoDateTime(dateRangeFilter?.startDate),
        created_at__lte: convertDateToIsoDateTime(dateRangeFilter?.endDate, { endOfDay: true }),
    }), [activePage, dateRangeFilter]);

    const {
        pending: pendingAnalyses,
        response: analysesResponse,
        retrigger: triggerGetAnalysis,
    } = useRequest<MultiResponse<AnalysisSummary>>({
        url: `server://projects/${activeProject}/analysis/summary/`,
        method: 'GET',
        query: analysisQueryOptions,
        preserveResponse: true,
    });

    const {
        response: overviewResponse,
        retrigger: retriggerAnalysisOverview,
    } = useRequest<AnalysisOverview>(
        {
            url: `server://projects/${activeProject}/analysis-overview/`,
            method: 'GET',
        },
    );

    const handleRetriggers = useCallback(() => {
        triggerGetAnalysis();
        retriggerAnalysisOverview();
    }, [triggerGetAnalysis, retriggerAnalysisOverview]);

    const {
        pending: pendingAnalysisDelete,
        trigger: deleteAnalysisTrigger,
        context: analysisIdToDelete,
    } = useLazyRequest<unknown, number>(
        {
            url: (ctx) => `server://projects/${activeProject}/analysis/${ctx}/`,
            method: 'DELETE',
            onSuccess: () => {
                handleRetriggers();
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

    const piechartData = overviewResponse?.authoringOrganizations ?? [];

    const timelineData: TimelineData[] = useMemo(
        () => (
            overviewResponse?.analysisList?.map((d) => ({
                key: d.id,
                value: new Date(d.createdAt).getTime(),
                label: d.title,
            })) ?? []
        ),
        [overviewResponse?.analysisList],
    );

    const handleAnalysisToDeleteClick = deleteAnalysisTrigger;

    const handleAnalysisEditSuccess = useCallback(() => {
        triggerGetAnalysis();
        retriggerAnalysisOverview();
        setModalHidden();
    }, [setModalHidden, triggerGetAnalysis, retriggerAnalysisOverview]);

    const handleAnalysisEditClick = useCallback((analysisId) => {
        setAnalysisToEdit(analysisId);
        setModalVisible();
    }, [setModalVisible]);

    const handleNewAnalysisCreateClick = useCallback(() => {
        setAnalysisToEdit(undefined);
        setModalVisible();
    }, [setModalVisible]);

    const analysisRendererParams = useCallback((key: number, data: AnalysisSummary) => ({
        analysisId: key,
        onEdit: handleAnalysisEditClick,
        onDelete: handleAnalysisToDeleteClick,
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        teamLeadName: data.teamLeadDetails?.displayName,
        createdAt: data.createdAt,
        modifiedAt: data.modifiedAt,
        pillars: data.pillars,
        pillarsPending: pendingAnalyses,
        analyzedSources: data.analyzedSources,
        analyzedEntries: data.analyzedEntries,
        totalSources: data.totalSources,
        totalEntries: data.totalEntries,
        onAnalysisCloseSuccess: handleRetriggers,
        onAnalysisPillarDelete: handleRetriggers,
        pendingAnalysisDelete: pendingAnalysisDelete && analysisIdToDelete === key,
    }), [
        handleRetriggers,
        handleAnalysisEditClick,
        handleAnalysisToDeleteClick,
        pendingAnalysisDelete,
        analysisIdToDelete,
        pendingAnalyses,
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
                        value={overviewResponse?.sourcesTotal}
                        variant="accent"
                    />
                    <InformationCard
                        coloredBackground
                        icon={<IoBookmarkOutline />}
                        label={_ts('analysis', 'totalEntriesLabel')}
                        value={overviewResponse?.entriesTotal}
                        variant="complement1"
                    />
                    <PercentageInformationCard
                        value={calcPercent(
                            overviewResponse?.analyzedSourceCount,
                            overviewResponse?.sourcesTotal,
                        )}
                        label={_ts('analysis', 'sourcesAnalyzedLabel')}
                        variant="complement1"
                        icon={<IoDocumentOutline />}
                    />
                    <PercentageInformationCard
                        value={calcPercent(
                            overviewResponse?.analyzedEntriesCount,
                            overviewResponse?.entriesTotal,
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
                                            key={entry.organizationTypeId}
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
                headingDescription={analysesResponse?.count}
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
                        itemsCount={analysesResponse?.count ?? 0}
                        maxItemsPerPage={maxItemsPerPage}
                        onActivePageChange={setActivePage}
                        itemsPerPageControlHidden
                    />
                )}
            >
                <ListView
                    className={styles.analysisList}
                    data={analysesResponse?.results}
                    renderer={Analysis}
                    rendererParams={analysisRendererParams}
                    keySelector={analysisKeySelector}
                    pending={pendingAnalyses}
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
