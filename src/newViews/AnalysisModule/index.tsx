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
    ContainerCard,
    Pager,
    Button,
    Card,
    Container,
    InformationCard,
    PercentageInformationCard,
    ListView,
} from '@the-deep/deep-ui';

import Timeline from '#newComponents/viz/Timeline';

import { useRequest, useLazyRequest } from '#utils/request';
import RechartsLegend from '#newComponents/ui/RechartsLegend';
import { SubNavbar } from '#components/general/Navbar';
import { getDateWithTimezone } from '#utils/common';
import Cloak from '#components/general/Cloak';
import {
    shortMonthNamesMap,
    calcPercent,
} from '#utils/safeCommon';
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
function shouldHideEdit({
    hasAnalysisFramework,
    entryPermissions,
}: {
    hasAnalysisFramework: boolean;
    entryPermissions: {
        create: boolean;
        modify: boolean;
    };
}) {
    return (!hasAnalysisFramework || !(entryPermissions.create || entryPermissions.modify));
}

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
    const [dateRangeFilter, setDateRangeFilter] = useState<Filter | undefined>(undefined);

    const analysisQueryOptions = useMemo(() => {
        const endDate = dateRangeFilter?.endDate ? new Date(dateRangeFilter?.endDate) : new Date();
        endDate.setDate(endDate.getDate() + 1);
        // A day added to include 24 hours of endDate

        return ({
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
            created_at__gte: dateRangeFilter?.startDate
                ? getDateWithTimezone(dateRangeFilter.startDate) : undefined,
            created_at__lt: dateRangeFilter?.endDate
                ? getDateWithTimezone(encodeDate(endDate)) : undefined,
        });
    }, [activePage, dateRangeFilter]);

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
        response: overviewResponse,
        retrigger: retriggerAnalaysisOverview,
    } = useRequest<AnalysisOverview>(
        {
            url: `server://projects/${activeProject}/analysis-overview/`,
            method: 'GET',
            failureHeader: _ts('analysis', 'analysisModule'),
        },
    );

    const handleRetriggers = useCallback(() => {
        triggerGetAnalysis();
        retriggerAnalaysisOverview();
    }, [triggerGetAnalysis, retriggerAnalaysisOverview]);

    const {
        pending: pendingAnalysisDelete,
        trigger: deleteAnalysisTrigger,
        context: analysisIdToDelete,
    } = useLazyRequest<unknown, number>(
        {
            url: ctx => `server://projects/${activeProject}/analysis/${ctx}/`,
            method: 'DELETE',
            onSuccess: handleRetriggers,
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
        retriggerAnalaysisOverview();
        setModalHidden();
    }, [setModalHidden, triggerGetAnalysis, retriggerAnalaysisOverview]);

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
        onAnalysisCloseSuccess: handleRetriggers,
        onAnalysisPillarDelete: handleRetriggers,
        pendingAnalysisDelete: pendingAnalysisDelete && analysisIdToDelete === key,
    }), [
        handleRetriggers,
        handleAnalysisEditClick,
        handleAnalysisToDeleteClick,
        pendingAnalysisDelete,
        analysisIdToDelete,
    ]);

    return (
        <div className={_cs(styles.analysisModule, className)}>
            <SubNavbar>
                <Cloak
                    hide={shouldHideEdit}
                    render={(
                        <div className={styles.subNavbar}>
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
                        </div>
                    )}
                />
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
                    emptyMessage={_ts('analysis', 'noAnalysisCreatedLabel')}
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
