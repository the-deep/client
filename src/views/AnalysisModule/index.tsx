import React, { useMemo, useState, useCallback } from 'react';
import { connect } from 'react-redux';

import InformationBox from '#components/viewer/InformationBox';
import Container from '#dui/Container';
import Card from '#dui/Card';
import Icon from '#rscg/Icon';
import InfoBoxWithDonut from '#dui/InfoBoxWithDonut';
import ListView from '#rscv/List/ListView';
import Pager from '#rscv/Pager';
import Button from '#dui/Button';
import Modal from '#dui/Modal';
import DateFilter from '#rsci/DateFilter';

import useRequest from '#utils/request';
import { SubNavbar } from '#components/general/Navbar';
import { notifyOnFailure } from '#utils/requestNotify';
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

interface AnalysisModuleProps {
    activeProject: number;
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
    const [filter, setFilter] = useState();

    const [
        pendingAnalyses,
        analysesResponse,
        ,
        getAnalysisTrigger,
    ] = useRequest<MultiResponse<AnalysisElement>>({
        url: `server://projects/${activeProject}/analysis/`,
        method: 'GET',
        query: {
            // project: projectId,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
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

    const handleAnalysisDeleteClick = useCallback((toDeleteKey) => {
    const handleChange = (item: any) => {
        setFilter(item);
        console.warn('filter', filter);
    };

    const handleAnalysisToDelete = useCallback((toDeleteKey) => {
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
        onDelete: handleAnalysisDeleteClick,
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        teamLeadName: data.teamLeadName,
        createdOn: data.createdOn,
    }), [handleAnalysisEditClick, handleAnalysisDeleteClick]);

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
                <Card className={styles.pieChartContainer} />
                <Card className={styles.analysesTimelineContainer} />
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
                        value={undefined}
                        onChange={handleChange}
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
