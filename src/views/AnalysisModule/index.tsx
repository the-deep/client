import React, { useMemo, useState, useCallback } from 'react';
import { encodeDate } from '@togglecorp/fujs';
import { connect } from 'react-redux';

import InformationBox from '#components/viewer/InformationBox';
import Container from '#dui/Container';
import Card from '#dui/Card';
import Icon from '#rscg/Icon';
import InfoBoxWithDonut from '#dui/InfoBoxWithDonut';
import ListView from '#rscv/List/ListView';
import Pager from '#rscv/Pager';
import Button from '#dui/Button';
import DateFilter from '#rsci/DateFilter';
import Timeline from '#components/viz/Timeline';
import { shortMonthNamesMap } from '#utils/common';

import {
    PieChart,
    Pie,
    ResponsiveContainer,
    Tooltip,
    Legend,
    Cell,
} from 'recharts';

import useRequest from '#utils/request';
import { SubNavbar } from '#components/general/Navbar';
import { notifyOnFailure } from '#utils/requestNotify';
import { getDateWithTimezone } from '#utils/common';
import {
    useModalState,
    useArrayEdit,
} from '#hooks/stateManagement';


import {
    AppState,
    AnalysisElement,
    MultiResponse,
} from '#typings';

import svgPaths from '#constants/svgPaths';
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
    '#003f5c',
    '#2f4b7c',
    '#665191',
    '#a05195',
    '#d45087',
    '#f95d6a',
    '#ff7c43',
    '#ffa600',
];

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
    createdOn: string;
}

interface AuthoringOrganizations {
    count: number;
    organizationId: number;
    organizationTitle: string;
}

interface AnalysisOverview {
    analysisList: AnalysisList[];
    entriesTotal: number;
    analyzedEntriesCount: number;
    sourcesTotal: number;
    analyzedSourceCount: number;
    authoringOrganizations: AuthoringOrganizations[];
}

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
    const [analysisIdToDelete, setAnalysisIdToDelete] = useState<number | undefined>();
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

    const [
        pendingAnalyses,
        analysesResponse,
        ,
        getAnalysisTrigger,
    ] = useRequest<MultiResponse<AnalysisElement>>({
        url: `server://projects/${activeProject}/analysis/`,
        method: 'GET',
        query: analysisQueryOptions,
        onSuccess: (response) => {
            setAnalyses(response.results);
            setAnalysisCount(response.count);
        },
        autoTrigger: true,
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('analysis', 'analysisModule'))({ error: errorBody }),
    });


    const [
        ,
        ,
        ,
        deleteAnalysisTrigger,
    ] = useRequest(
        {
            url: `server://projects/${activeProject}/analysis/${analysisIdToDelete}/`,
            method: 'DELETE',
            onSuccess: () => {
                getAnalysisTrigger();
            },
            autoTrigger: false,
        },
    );

    const [
        ,
        overviewResponse,
        ,
        ,
    ] = useRequest<MultiResponse<AnalysisOverview>>(
        {
            url: `server://projects/${activeProject}/analysis-overview/`,
            method: 'GET',
            autoTrigger: true,
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('analysis', 'analysisModule'))({ error: errorBody }),
        },
    );

    const labelSelector = (item: AuthoringOrganizations) => item.organizationTitle;
    const valueSelector = (item: AuthoringOrganizations) => item.count;
    const keySelector = (item: AuthoringOrganizations) => item.organizationId;
    const piechartData: AuthoringOrganizations = overviewResponse?.authoringOrganizations ?? [];
    const tickFormatter = (title: string) => ({ title });

    const timelineData = (analysesResponse?.results ?? []).map(d => ({
        key: d.id,
        value: new Date(d.createdOn).getTime(),
        label: d.title,
    }));
    const timelineLabelSelector = item => item.label;
    const timelineValueSelector = item => item.value;
    const timelineKeySelector = item => item.key;
    const timelineTickSelector = (d: number) => {
        const date = new Date(d);
        const year = date.getFullYear();
        const month = date.getMonth();

        return `${year}-${shortMonthNamesMap[month]}`;
    };


    const handleAnalysisToDeleteClick = useCallback((toDeleteKey) => {
        deleteAnalysisTrigger();
        setAnalysisIdToDelete(toDeleteKey);
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
    }), [handleAnalysisEditClick, handleAnalysisToDeleteClick]);

    return (
        <div className={styles.analysisModule}>
            <SubNavbar>
                <div className={styles.subNavbar}>
                    <Button
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
                        <InformationBox
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
                        <InformationBox
                            className={styles.infoBox}
                            icon={(
                                <Icon
                                    className={styles.icon}
                                    name="bookmarkIcon"
                                />
                            )}
                            label={_ts('analysis', 'totalEntriesLabel')}
                            value={100}
                            variant="complement"
                        />
                    </div>
                    <div className={styles.bottomInfoBox}>
                        <InfoBoxWithDonut
                            className={styles.infoBox}
                            percent={78}
                            label={_ts('analysis', 'entriesAnalyzedLabel')}
                            variant="complement"
                            image={`${svgPaths.checkmarkCircleFillIcon}#checkmark`}
                        />
                        <InfoBoxWithDonut
                            className={styles.infoBox}
                            percent={54}
                            variant="accent"
                            label={_ts('analysis', 'sourcesAnalyzedLabel')}
                            image={`${svgPaths.documentIcon}#document`}
                        />
                    </div>
                </div>
                <Card className={styles.pieChartContainer}>
                    <ResponsiveContainer>
                        <PieChart
                            className={styles.pieChart}
                        >
                            <Pie
                                data={piechartData}
                                dataKey={valueSelector}
                                nameKey={labelSelector}
                                outerRadius={50}
                                paddingAngle={2}
                            >
                                {piechartData.map((_: any, index: number) => (
                                    <Cell
                                        key={keySelector}
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
                        data={timelineData ?? []}
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
                        className={styles.dateFilter}
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
