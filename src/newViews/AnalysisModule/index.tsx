import React, { useMemo, useState, useCallback } from 'react';
import {
    encodeDate,
    _cs,
} from '@togglecorp/fujs';
import { connect } from 'react-redux';
import {
    IoDocumentOutline,
    IoCheckmarkCircle,
    IoBookmarkOutline,
    IoDocumentTextOutline,
    IoPieChart,
    IoStatsChart,
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
    ContainerCard,
    Pager,
    Button,
    Card,
    Container,
    InformationCard,
    PercentageInformationCard,
    ListView,
} from '@the-deep/deep-ui';

import Icon from '#rscg/Icon';
import DateFilter from '#rsci/DateFilter';
import Timeline from '#newComponents/viz/Timeline';

import { useRequest, useLazyRequest } from '#utils/request';
import RechartsLegend from '#newComponents/ui/RechartsLegend';
import { SubNavbar } from '#components/general/Navbar';
import { getDateWithTimezone } from '#utils/common';
import { shortMonthNamesMap } from '#utils/safeCommon';
import {
    useModalState,
} from '#hooks/stateManagement';

import {
    AppState,
    AnalysisSummary,
    MultiResponse,
} from '#typings';

import _ts from '#ts';
import { activeProjectIdFromStateSelector } from '#redux';

import Analysis from './Analysis';
import AnalysisEditModal from './AnalysisEditModal';
import styles from './styles.scss';

function EmptyAnalysisContainer() {
    return (
        <div className={styles.emptyContainer}>
            {_ts('analysis', 'noAnalysisCreatedLabel')}
        </div>
    );
}

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});

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
    startDate?: string;
    endDate?: string;
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

interface AnalysisModuleProps {
    className?: string;
    activeProject: number;
}

function AnalysisModule(props: AnalysisModuleProps) {
    const {
        className,
        activeProject,
    } = props;

    const [
        showAnalysisAddModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

    const [activePage, setActivePage] = useState(1);
    const [analysisToEdit, setAnalysisToEdit] = useState();
    const [filter, setFilter] = useState<Filter | undefined>(undefined);

    const analysisQueryOptions = useMemo(() => {
        const endDate = filter?.endDate ? new Date(filter?.endDate) : new Date();
        endDate.setDate(endDate.getDate() + 1);
        // A day added to include 24 hours of endDate

        return ({
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
            created_at__gte: filter?.startDate ? getDateWithTimezone(filter.startDate) : undefined,
            created_at__lt: filter?.endDate ? getDateWithTimezone(encodeDate(endDate)) : undefined,
        });
    }, [activePage, filter]);

    const {
        pending: pendingAnalyses,
        response: analysesResponse,
        retrigger: triggerGetAnalysis,
    } = useRequest<MultiResponse<AnalysisSummary>>({
        url: `server://projects/${activeProject}/analysis/summary/`,
        method: 'GET',
        query: analysisQueryOptions,
        failureHeader: _ts('analysis', 'analysisModule'),
    });

    const {
        pending: pendingAnalysisDelete,
        trigger: deleteAnalysisTrigger,
        context: analysisIdToDelete,
    } = useLazyRequest<unknown, number>(
        {
            url: ctx => `server://projects/${activeProject}/analysis/${ctx}/`,
            method: 'DELETE',
            onSuccess: triggerGetAnalysis,
        },
    );

    const {
        response: overviewResponse,
    } = useRequest<AnalysisOverview>(
        {
            url: `server://projects/${activeProject}/analysis-overview/`,
            method: 'GET',
            failureHeader: _ts('analysis', 'analysisModule'),
        },
    );

    const piechartData = overviewResponse?.authoringOrganizations ?? [];

    const timelineData: TimelineData[] = useMemo(() => (overviewResponse?.analysisList?.map(d => ({
        key: d.id,
        value: new Date(d.createdAt).getTime(),
        label: d.title,
    })) ?? []), [overviewResponse?.analysisList]);

    const handleAnalysisToDeleteClick = deleteAnalysisTrigger;

    const handleAnalysisEditSuccess = useCallback(() => {
        triggerGetAnalysis();
        setModalHidden();
    }, [setModalHidden, triggerGetAnalysis]);

    const handleAnalysisEditClick = useCallback((analysisId) => {
        setAnalysisToEdit(analysisId);
        setModalVisible();
    }, [setModalVisible]);

    const handleNewAnalysisCreateClick = useCallback(() => {
        setAnalysisToEdit(undefined);
        setModalVisible();
    }, [setModalVisible]);

    const analysisRendererParams = useCallback((key: number, data: AnalysisSummary) => ({
        className: styles.analysis,
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
        analyzedSources: data.analyzedSources,
        analyzedEntries: data.analyzedEntries,
        totalSources: data.totalSources,
        totalEntries: data.totalEntries,
        triggerAnalysisList: triggerGetAnalysis,
        onAnalysisPillarDelete: triggerGetAnalysis,
        pendingAnalysisDelete: pendingAnalysisDelete && analysisIdToDelete === key,
    }), [
        handleAnalysisEditClick,
        handleAnalysisToDeleteClick,
        triggerGetAnalysis,
        pendingAnalysisDelete,
        analysisIdToDelete,
    ]);

    return (
        <div className={_cs(styles.analysisModule, className)}>
            <SubNavbar>
                <div className={styles.subNavbar}>
                    <Button
                        name={undefined}
                        variant="primary"
                        onClick={handleNewAnalysisCreateClick}
                        icons={(
                            <Icon name="add" />
                        )}
                    >
                        {_ts('analysis', 'setupNewAnalysisButtonLabel')}
                    </Button>
                </div>
            </SubNavbar>
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
                        value={overviewResponse?.analyzedSourceCount}
                        label={_ts('analysis', 'sourcesAnalyzedLabel')}
                        variant="complement1"
                        icon={<IoDocumentOutline />}
                    />
                    <PercentageInformationCard
                        value={overviewResponse?.analyzedEntriesCount}
                        variant="complement2"
                        label={_ts('analysis', 'entriesAnalyzedLabel')}
                        icon={<IoCheckmarkCircle />}
                    />
                </div>
                <ContainerCard
                    className={styles.pieChartContainer}
                    footerContent={_ts('analysis', 'sourcesByTypeLabel')}
                >
                    { piechartData?.length > 0 ? (
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
                                <Tooltip labelFormatter={tickFormatter} />
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
                inlineHeadingDescription
                headerActions={(
                    <DateFilter
                        placeholder={_ts('analysis', 'selectAnalysisDate')}
                        value={filter}
                        onChange={setFilter}
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
                    emptyMessage={EmptyAnalysisContainer}
                />
            </Container>
            {showAnalysisAddModal && (
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
export default connect(mapStateToProps)(AnalysisModule);
