import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    isDefined,
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
    setAnalysisDeleteId: () => number;
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
    setDeleteId: () => number;
}

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});

const MAX_ITEMS_PER_PAGE = 50;
const AnalysisPillarRenderer = (props: AnalysisPillarRendererProps) => {
    const {
        pillarId,
        title,
        assigneeName,
        setDeleteId,
    } = props;

    const handleDeletePillar = useCallback(() => {
        setDeleteId(pillarId);
    }, [pillarId]);

    return (
        <Container
            className={styles.pillar}
            heading={(
                <div className={styles.left}>
                    {title}
                    <Tag
                        className={styles.tag}
                        variant="accent"
                    >
                        Analysis Completed

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
                        Creation Date
                    </span>
                    &nbsp;
                    June 5, 2021
                </div>
            )}
        >
            <div className={styles.pillarBody}>
                <div className={styles.left}>
                    <div className={styles.item}>
                        Analyst &nbsp;
                        <span className={styles.boldText}>
                            {assigneeName}
                        </span>
                    </div>
                </div>
            </div>
        </Container>
    );
};

const keySelector = (item: AnalysisPillars) => (item.id);

function Analysis(props: ComponentProps) {
    const {
        title,
        className,
        startDate,
        endDate,
        activeProject,
        analysisId,
        setAnalysisDeleteId,
    } = props;

    const [analysisPillar, setAnalysisPillar] = useState<AnalysisPillars[]>([]);
    const [pillarCount, setPillarCount] = useState<number>();
    const [activePage, setActivePage] = useState<number>(1);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [pillarAnalysisToDelete, setPillarAnalysisToDelete] = useState<number | undefined>();
    const [
        pillarPending,
        ,
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
                setPillarCount(response.count);
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

    const handlePillarAnalysisToDelete = useCallback((toDeleteKey) => {
        setPillarAnalysisToDelete(toDeleteKey);
        deletePillarTrigger();
    }, [deletePillarTrigger]);

    const analysisPillarRendererParams = useCallback((key, data) => ({
        pillarId: data.id,
        title: data.title,
        assigneeName: data.assigneeName,
        createdOn: data.createdOn,
        analysis: data.analysis,
        setDeleteId: handlePillarAnalysisToDelete,
    }), [handlePillarAnalysisToDelete]);

    const handleDeleteAnalysis = useCallback(() => {
        setAnalysisDeleteId(analysisId);
    }, [analysisId]);

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
                Content
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
                    {_ts('analysis', 'pillarAnalysisCount', { count: pillarCount })}
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
                        {isDefined(pillarCount) && pillarCount >= MAX_ITEMS_PER_PAGE && (
                            <Pager
                                activePage={activePage}
                                itemsCount={pillarCount}
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
