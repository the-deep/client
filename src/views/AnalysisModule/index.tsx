import React, { useState, useCallback } from 'react';
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

import useRequest from '#utils/request';
import { SubNavbar } from '#components/general/Navbar';
import { notifyOnFailure } from '#utils/requestNotify';
import { useModalState } from '#hooks/stateManagement';

import {
    AppState,
    AnalysisElement,
    MultiResponse,
} from '#typings';

import svgPaths from '#constants/svgPaths';
import _ts from '#ts';
import { activeProjectIdFromStateSelector } from '#redux';

import Analysis from './Analysis';
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
        showAnaylsisAddModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const [activePage, setActivePage] = useState(1);
    const [analyses, setAnalyses] = useState<AnalysisElement[]>([]);
    const [analysisCount, setAnalysisCount] = useState(0);
    const [analysisIdToDelete, setAnalysisIdToDelete] = useState<number | undefined>();

    const [
        pendingAnalyses,
        ,
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

    const handleAnalysisToDelete = useCallback((toDeleteKey) => {
        deleteAnalysisTrigger();
        setAnalysisIdToDelete(toDeleteKey);
    }, [deleteAnalysisTrigger]);

    const analysisRendererParams = useCallback((key, data) => ({
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        analysisId: data.id,
        setAnalysisDeleteId: handleAnalysisToDelete,
        teamLeadName: data.teamLeadName,
    }), [handleAnalysisToDelete]);

    return (
        <div className={styles.analysisModule}>
            <SubNavbar>
                <div className={styles.subNavbar}>
                    <Button
                        variant="primary"
                        onClick={setModalShow}
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
                heading={_ts('analysis', 'allAnalysesLabel')}
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
            {showAnaylsisAddModal && (
                <Modal
                    heading={_ts('analysis', 'addAnalysisModalHeading')}
                    onClose={setModalHidden}
                >
                    Here
                </Modal>
            )}
        </div>
    );
}

export default connect(mapStateToProps)(AnalysisModule);
