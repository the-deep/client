import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
} from '@togglecorp/fujs';

import ContainerCard from '#dui/ContainerCard';
import Button from '#dui/Button';
import Icon from '#rscg/Icon';
import QuickActionButton from '#dui/QuickActionButton';
import DateRangeOutput from '#dui/DateRangeOutput';
import Container from '#dui/Container';
import Tag from '#dui/Tag';
import ListView from '#rscv/List/ListView';
import Pager from '#rscv/Pager';

import useRequest from '#utils/request';

import {
    AppState,
    MultiResponse,
    AnalysisElement,
} from '#typings';

import _ts from '#ts';
import { activeProjectIdFromStateSelector } from '#redux';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    title: string;
    startDate?: string;
    endDate?: string;
    activeProject: number;
    analysisId: number;
    setAnalysisDeleteId: (value: number) => void;
    analyses: AnalysisElement;
    teamLeadName: string;
}

interface AnalysisPillars {
    id: number;
    assigneeName: string;
    title: string;
    mainStatement: string;
    informationGap: string;
    filters?: string;
    analysis: number;
}

interface AnalysisPillarRendererProps extends Omit<AnalysisPillars, 'id'> {
    pillarId: AnalysisPillars['id'];
    setDeleteId: (value: number) => void;
}

interface PillerListRendererProps extends Omit<AnalysisPillars, 'id'>{
    pillarId: AnalysisPillars['id'];
}

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});

const MAX_ITEMS_PER_PAGE = 50;
function AnalysisPillarRenderer(props: AnalysisPillarRendererProps) {
    const {
        pillarId,
        title,
        assigneeName,
        setDeleteId,
    } = props;

    const [isCompleted, setIsCompleted] = useState(false);
    // setIsCompleted to be used when the status is passed by API

    const handleDeletePillar = useCallback(() => {
        setDeleteId(pillarId);
    }, [pillarId, setDeleteId]);

    return (
        <Container
            className={styles.pillar}
            heading={(
                <div className={styles.left}>
                    {title}
                    <Tag
                        className={styles.tag}
                        variant={isCompleted ? 'accent' : 'gradient1'}
                    >
                        {isCompleted
                            ? _ts('analysis', 'completeLabel')
                            : _ts('analysis', 'inProgressLabel')
                        }
                    </Tag>
                </div>
            )}
            headerClassName={styles.heading}
            headerActions={(
                <div className={styles.headerRight}>
                    <QuickActionButton
                        className={styles.button}
                    >
                        <Icon name="edit" />
                    </QuickActionButton>
                    <QuickActionButton
                        className={styles.button}
                    >
                        <Icon name="copy" />
                    </QuickActionButton>
                    <QuickActionButton
                        className={styles.button}
                        onClick={handleDeletePillar}
                    >
                        <Icon name="delete" />
                    </QuickActionButton>
                </div>
            )}
            headerDescription={(
                <div className={styles.subHeading}>
                    <span className={styles.boldText}>
                        {_ts('analysis', 'creationDate')}
                    </span>
                    June 5, 2021
                </div>
            )}
        >
            <div className={styles.pillarBody}>
                <div className={styles.left}>
                    <div className={styles.item}>
                        {_ts('analysis', 'analyst')}
                        <span className={styles.boldText}>
                            {assigneeName}
                        </span>
                    </div>
                </div>
            </div>
        </Container>
    );
}

const keySelector = (item: AnalysisPillars) => (item.id);

const pillarListRenderer = (props: PillerListRendererProps) => {
    const {
        title,
        assigneeName,
    } = props;

    return (
        <div className={styles.pillarListContent}>
            <div className={styles.analyst}>
                {assigneeName}
            </div>
            <div className={styles.analysisPillar}>
                {title}
            </div>
        </div>
    );
};


function Analysis(props: ComponentProps) {
    const {
        title,
        className,
        startDate,
        endDate,
        activeProject,
        analysisId,
        setAnalysisDeleteId,
        analyses,
        teamLeadName,
    } = props;

    console.warn('analyses', analyses);
    const [analysisPillar, setAnalysisPillar] = useState<AnalysisPillars[]>([]);
    const [activePage, setActivePage] = useState<number>(1);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [pillarAnalysisToDelete, setPillarAnalysisToDelete] = useState<number | undefined>();
    const [
        pillarPending,
        pillarResponse,
        ,
        pillarGetTrigger,
    ] = useRequest<MultiResponse<AnalysisPillars>>(
        {
            url: `server://projects/${activeProject}/analysis/${analysisId}/pillars/`,
            method: 'GET',
            query: {
                offset: (activePage - 1) * MAX_ITEMS_PER_PAGE,
                limit: MAX_ITEMS_PER_PAGE,
            },
            autoTrigger: true,
            onSuccess: (response) => {
                setAnalysisPillar(response.results);
            },
        },
    );

    const [
        ,
        ,
        ,
        deletePillarTrigger,
    ] = useRequest(
        {
            url: `server://projects/${activeProject}/analysis/${analysisId}/pillars/${pillarAnalysisToDelete}/`,
            method: 'DELETE',
            onSuccess: () => {
                pillarGetTrigger();
            },
            autoTrigger: false,
        },
    );

    const handleClick = useCallback(() => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);

    const handlePillarAnalysisToDelete = useCallback((toDeleteKey: number) => {
        setPillarAnalysisToDelete(toDeleteKey);
        deletePillarTrigger();
    }, [deletePillarTrigger]);

    const analysisPillarRendererParams = useCallback((_, data) => ({
        pillarId: data.id,
        title: data.title,
        assigneeName: data.assigneeName,
        createdOn: data.createdOn,
        analysis: data.analysis,
        setDeleteId: handlePillarAnalysisToDelete,
    }), [handlePillarAnalysisToDelete]);

    const handleDeleteAnalysis = useCallback(() => {
        setAnalysisDeleteId(analysisId);
    }, [analysisId, setAnalysisDeleteId]);

    const pillarListRendererParams = useCallback((key, data) => ({
        pillarId: data.id,
        assigneeName: data.assigneeName,
        title: data.title,
    }), []);

    return (
        <ContainerCard
            className={_cs(className, styles.analysisItem)}
            heading={title}
            sub
            headerDescription={(
                <DateRangeOutput
                    startDate={startDate}
                    endDate={endDate}
                />
            )}
            headerActions={(
                <div className={styles.headerRight}>
                    <Button
                        className={styles.button}
                        variant="tertiary"
                        icons={(
                            <Icon name="add" />
                        )}
                    >
                        {_ts('analysis', 'addPillarAnalysis')}
                    </Button>
                    <QuickActionButton
                        className={styles.button}
                    >
                        <Icon name="edit" />
                    </QuickActionButton>
                    <QuickActionButton
                        className={styles.button}
                    >
                        <Icon name="copy" />
                    </QuickActionButton>
                    <QuickActionButton
                        className={styles.button}
                        onClick={handleDeleteAnalysis}
                    >
                        <Icon name="delete" />
                    </QuickActionButton>
                </div>
            )}
            contentClassName={styles.pillarContent}
        >
            <div className={styles.content}>
                <div className={styles.contentItem}>
                    <h3 className={styles.subHeading}> Team Lead </h3>
                    <span className={styles.boldText}>
                        {teamLeadName}
                    </span>
                </div>

                <div className={styles.contentItem}>
                    <h3 className={styles.subHeading}> Pillar Assignments </h3>
                    <ListView
                        data={analysisPillar}
                        renderer={pillarListRenderer}
                        rendererParams={pillarListRendererParams}
                        keySelector={keySelector}
                    />
                </div>
            </div>
            <div
                className={styles.pillarAnalyses}
            >
                <Button
                    className={styles.accordionButton}
                    icons={(
                        <Icon name={isExpanded
                            ? 'chevronUp'
                            : 'chevronDown'}
                        />
                    )}
                    onClick={handleClick}
                >
                    {_ts('analysis', 'pillarAnalysisCount', { count: pillarResponse?.count })}
                </Button>
                {isExpanded && (
                    <>
                        <div className={styles.pillarAnalysisContent}>
                            <ListView
                                className={styles.pillarList}
                                data={analysisPillar}
                                keySelector={keySelector}
                                renderer={AnalysisPillarRenderer}
                                rendererParams={analysisPillarRendererParams}
                                pending={pillarPending}
                            />
                        </div>
                        {pillarResponse && pillarResponse.count > MAX_ITEMS_PER_PAGE && (
                            <Pager
                                activePage={activePage}
                                itemsCount={pillarResponse.count}
                                maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                                onPageClick={setActivePage}
                                showItemsPerPageChange={false}
                            />
                        )}
                    </>
                )}
            </div>
        </ContainerCard>
    );
}

export default connect(mapStateToProps)(Analysis);
