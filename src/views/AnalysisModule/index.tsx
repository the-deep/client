import React, { useMemo, useState, useCallback } from 'react';
import { encodeDate } from '@togglecorp/fujs';
import { connect } from 'react-redux';
import colorBrewer from 'colorbrewer';
import {
    IoDocumentOutline,
    IoCheckmarkCircle,
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
    Button,
    Card,
    Container,
    InformationCard,
    PercentageInformationCard,
} from '@the-deep/deep-ui';

import Icon from '#rscg/Icon';
import ListView from '#rscv/List/ListView';
import Pager from '#rscv/Pager';
import DateFilter from '#rsci/DateFilter';
import Timeline from '#components/viz/Timeline';

import { useRequest, useLazyRequest } from '#utils/request';
import { SubNavbar } from '#components/general/Navbar';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    getDateWithTimezone,
} from '#utils/common';
import {
    shortMonthNamesMap,
} from '#utils/safeCommon';
import {
    useModalState,
    useArrayEdit,
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
const colorScheme = colorBrewer.Dark2[8];

interface AnalysisModuleProps {
    activeProject: number;
}

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

interface AnalysisOverview {
    analysisList: AnalysisList[];
    entriesTotal: number;
    analyzedEntriesCount: number;
    sourcesTotal: number;
    analyzedSourceCount: number;
    authoringOrganizations: AuthoringOrganizations[];
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

function AnalysisModule(props: AnalysisModuleProps) {
    const {
        activeProject,
    } = props;

    const [
        showAnalysisAddModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const [activePage, setActivePage] = useState(1);
    const [analyses, setAnalyses] = useState<AnalysisElement[] | undefined>([]);
    const [
        addAnalysis,
        ,
        modifyAnalysis,
    ] = useArrayEdit(setAnalyses, analysisKeySelector);
    const [analysisCount, setAnalysisCount] = useState(0);
    // const [analysisIdToDelete, setAnalysisIdToDelete] = useState<number | undefined>();
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
        onSuccess: (response) => {
            setAnalyses(response.results);
            setAnalysisCount(response.count);
        },
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('analysis', 'analysisModule'))({ error: errorBody }),
    });

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

    const piechartData: AuthoringOrganizations[] = overviewResponse?.authoringOrganizations ?? [];

    const timelineData: TimelineData[] = (analysesResponse?.results?.map(d => ({
        key: d.id,
        value: new Date(d.createdAt).getTime(),
        label: d.title,
    }))) ?? [];

    const handleAnalysisToDeleteClick = useCallback((toDeleteKey: number) => {
        // setAnalysisIdToDelete(toDeleteKey);
        deleteAnalysisTrigger(toDeleteKey);
    }, [deleteAnalysisTrigger]);

    const analysisObjectToEdit = useMemo(() => (
        analyses?.find(a => a.id === analysisToEdit)
    ), [analyses, analysisToEdit]);

    const handleAnalysisEditSuccess = useCallback((analysis, isEditMode) => {
        if (isEditMode) {
            modifyAnalysis(analysis.id, analysis);
        } else {
            addAnalysis(analysis);
            setAnalysisCount(oldVal => oldVal + 1);
        }
        setModalHidden();
    }, [setModalHidden, modifyAnalysis, addAnalysis]);

    const handleAnalysisEditClick = useCallback((analysisId) => {
        setAnalysisToEdit(analysisId);
        setModalShow();
    }, [setModalShow]);

    const handleNewAnalysisCreateClick = useCallback(() => {
        setAnalysisToEdit(undefined);
        setModalShow();
    }, [setModalShow]);

    const analysisRendererParams = useCallback((key, data) => ({
        className: styles.analysis,
        analysisId: key,
        onEdit: handleAnalysisEditClick,
        onDelete: handleAnalysisToDeleteClick,
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        teamLeadName: data.teamLeadName,
        createdAt: data.createdAt,
        modifiedAt: data.modifiedAt,
        onAnalysisPillarDelete: getAnalysisTrigger,
        pendingAnalysisDelete: pendingAnalysisDelete && analysisIdToDelete === key,
    }), [
        handleAnalysisEditClick,
        handleAnalysisToDeleteClick,
        getAnalysisTrigger,
        pendingAnalysisDelete,
        analysisIdToDelete,
    ]);

    return (
        <div className={styles.analysisModule}>
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
                <div className={styles.infoBoxes}>
                    <div className={styles.topInfoBox}>
                        <InformationCard
                            className={styles.infoBox}
                            icon={(
                                <Icon
                                    className={styles.icon}
                                    name="noteIcon"
                                />
                            )}
                            label={_ts('analysis', 'totalSourcesLabel')}
                            value={100}
                            variant="accent"
                        />
                        <InformationCard
                            className={styles.infoBox}
                            icon={(
                                <Icon
                                    className={styles.icon}
                                    name="bookmarkIcon"
                                />
                            )}
                            label={_ts('analysis', 'totalEntriesLabel')}
                            value={100}
                            variant="complement1"
                        />
                    </div>
                    <div className={styles.bottomInfoBox}>
                        <PercentageInformationCard
                            className={styles.infoBox}
                            value={72}
                            variant="complement2"
                            label={_ts('analysis', 'entriesAnalyzedLabel')}
                            icon={<IoCheckmarkCircle />}
                        />
                        <PercentageInformationCard
                            className={styles.infoBox}
                            value={54}
                            label={_ts('analysis', 'sourcesAnalyzedLabel')}
                            variant="complement1"
                            icon={<IoDocumentOutline />}
                        />
                    </div>
                </div>
                <Card className={styles.pieChartContainer}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={piechartData}
                                dataKey={valueSelector}
                                nameKey={labelSelector}
                                outerRadius={50}
                                paddingAngle={2}
                            >
                                {piechartData.map((
                                    entry: AuthoringOrganizations,
                                    index: number,
                                ) => (
                                    <Cell
                                        key={entry.organizationTypeId}
                                        fill={colorScheme[index % colorScheme.length]}
                                    />
                                ))}
                            </Pie>
                            <Legend verticalAlign="bottom" />
                            <Tooltip labelFormatter={tickFormatter} />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card className={styles.analysesTimelineContainer}>
                    <Timeline
                        data={timelineData}
                        labelSelector={timelineLabelSelector}
                        valueSelector={timelineValueSelector}
                        keySelector={timelineKeySelector}
                        tickLabelSelector={timelineTickSelector}
                    />
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
                        itemsCount={analysisCount}
                        maxItemsPerPage={maxItemsPerPage}
                        onPageClick={setActivePage}
                        showItemsPerPageChange={false}
                    />
                )}
            >
                <ListView
                    className={styles.analysisList}
                    data={analyses}
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
