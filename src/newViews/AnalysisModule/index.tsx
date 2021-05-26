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
    Pager,
    Button,
    Card,
    Container,
    InformationCard,
    PercentageInformationCard,
} from '@the-deep/deep-ui';

import Icon from '#rscg/Icon';
import ListView from '#rscv/List/ListView';
import DateFilter from '#rsci/DateFilter';
import Timeline from '#components/viz/Timeline';

import { useRequest, useLazyRequest } from '#utils/request';
import RechartsLegend from '#components/ui/RechartsLegend';
import { SubNavbar } from '#components/general/Navbar';
import { notifyOnFailure } from '#utils/requestNotify';
import { getDateWithTimezone } from '#utils/common';
import { shortMonthNamesMap } from '#utils/safeCommon';
import {
    useModalState,
} from '#hooks/stateManagement';

import {
    AppState,
    AnalysisElement,
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

const analysisKeySelector = (d: AnalysisElement) => d.id;
const maxItemsPerPage = 5;
const colorScheme = [
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

/*
const dummyAuthoringOrganizations: AuthoringOrganizations[] = [
    { count: 10, organizationTypeId: 1, organizationTypeTitle: 'NGOs' },
    { count: 6, organizationTypeId: 1, organizationTypeTitle: 'Government' },
    { count: 16, organizationTypeId: 1, organizationTypeTitle: 'UN Agency' },
];
 */

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
        setModalShow,
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
        retrigger: getAnalysisTrigger,
    } = useRequest<MultiResponse<AnalysisElement>>({
        url: `server://projects/${activeProject}/analysis/`,
        method: 'GET',
        query: analysisQueryOptions,
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('analysis', 'analysisModule'))({ error: errorBody }),
    });

    const {
        pending: pendingAnalysisClone,
        trigger: cloneAnalysisTrigger,
        context,
    } = useLazyRequest<unknown, { title: string, value: number }>(
        {
            url: ctx => `server://projects/${activeProject}/analysis/${ctx.value}/clone-analysis/`,
            body: ctx => ({ title: ctx.title }),
            method: 'POST',
            onSuccess: () => {
                getAnalysisTrigger();
            },
        },
    );
    const analysisIdToClone = context?.value;

    const {
        pending: pendingAnalysisDelete,
        trigger: deleteAnalysisTrigger,
        context: analysisIdToDelete,
    } = useLazyRequest<unknown, number>(
        {
            url: ctx => `server://projects/${activeProject}/analysis/${ctx}/`,
            method: 'DELETE',
            onSuccess: () => {
                getAnalysisTrigger();
            },
        },
    );

    const {
        response: overviewResponse,
    } = useRequest<AnalysisOverview>(
        {
            url: `server://projects/${activeProject}/analysis-overview/`,
            method: 'GET',
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('analysis', 'analysisModule'))({ error: errorBody }),
        },
    );

    const piechartData = overviewResponse?.authoringOrganizations ?? [];

    const timelineData: TimelineData[] = useMemo(() => (analysesResponse?.results?.map(d => ({
        key: d.id,
        value: new Date(d.createdAt).getTime(),
        label: d.title,
    })) ?? []), [analysesResponse?.results]);

    const handleAnalysisToDeleteClick = deleteAnalysisTrigger;

    const handleAnalysisToCloneClick = useCallback(
        (value: number, title: string) => {
            cloneAnalysisTrigger({ title, value });
        },
        [cloneAnalysisTrigger],
    );

    const analysisObjectToEdit = useMemo(() => (
        analysesResponse?.results?.find(a => a.id === analysisToEdit)
    ), [analysesResponse?.results, analysisToEdit]);

    const handleAnalysisEditSuccess = useCallback(() => {
        getAnalysisTrigger();
        setModalHidden();
    }, [setModalHidden, getAnalysisTrigger]);

    const handleAnalysisEditClick = useCallback((analysisId) => {
        setAnalysisToEdit(analysisId);
        setModalShow();
    }, [setModalShow]);

    const handleNewAnalysisCreateClick = useCallback(() => {
        setAnalysisToEdit(undefined);
        setModalShow();
    }, [setModalShow]);

    const analysisRendererParams = useCallback((key: number, data: AnalysisElement) => ({
        className: styles.analysis,
        analysisId: key,
        onEdit: handleAnalysisEditClick,
        onDelete: handleAnalysisToDeleteClick,
        onClone: handleAnalysisToCloneClick,
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        teamLeadName: data.teamLeadName,
        createdAt: data.createdAt,
        modifiedAt: data.modifiedAt,
        analysisPillars: data.analysisPillar,
        onAnalysisPillarDelete: getAnalysisTrigger,
        pendingAnalysisDelete: pendingAnalysisDelete && analysisIdToDelete === key,
        pendingAnalysisClone: pendingAnalysisClone && analysisIdToClone === key,
    }), [
        handleAnalysisEditClick,
        handleAnalysisToDeleteClick,
        handleAnalysisToCloneClick,
        getAnalysisTrigger,
        pendingAnalysisDelete,
        pendingAnalysisClone,
        analysisIdToDelete,
        analysisIdToClone,
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
                headingClassName={styles.header}
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
                <Card className={styles.pieChartContainer}>
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
                </Card>
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
                heading={(
                    <div className={styles.heading}>
                        {_ts('analysis', 'allAnalyses')}
                        <span className={styles.lightText}>
                            {analysesResponse?.count}
                        </span>
                    </div>
                )}
                headerActions={(
                    <DateFilter
                        placeholder={_ts('analysis', 'selectAnalysisDate')}
                        value={filter}
                        onChange={setFilter}
                    />
                )}
                headerClassName={styles.header}
                footerClassName={styles.footer}
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
                    emptyComponent={EmptyAnalysisContainer}
                />
            </Container>
            {showAnalysisAddModal && (
                <AnalysisEditModal
                    onSuccess={handleAnalysisEditSuccess}
                    onModalClose={setModalHidden}
                    projectId={activeProject}
                    value={analysisObjectToEdit}
                />
            )}
        </div>
    );
}
export default connect(mapStateToProps)(AnalysisModule);
