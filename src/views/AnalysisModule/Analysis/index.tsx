import React, { useCallback, useState, useMemo } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
} from '@togglecorp/fujs';

import ContainerCard from '#dui/ContainerCard';
import Button from '#dui/Button';
import Icon from '#rscg/Icon';
import QuickActionButton from '#dui/QuickActionButton';
import DateRangeOutput from '#dui/DateRangeOutput';
import ListView from '#rscv/List/ListView';
import Pager from '#rscv/Pager';
import TextOutput from '#components/general/TextOutput';

import useRequest from '#utils/request';

import {
    AppState,
    MultiResponse,
    AnalysisPillars,
} from '#typings';

import _ts from '#ts';
import { activeProjectIdFromStateSelector } from '#redux';
import AnalysisPillar from './AnalysisPillar';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    title: string;
    startDate?: string;
    endDate?: string;
    activeProject: number;
    analysisId: number;
    onDelete: (value: number) => void;
    teamLeadName: string;
    createdOn: string | number;
}

interface AnalysisPillarRendererProps extends Omit<AnalysisPillars, 'id' | 'analysis'> {
    pillarId: AnalysisPillars['id'];
    onDelete: (value: number) => void;
}

type PillarListRendererProps = Omit<AnalysisPillars, 'id' | 'analysis'>

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});

const MAX_ITEMS_PER_PAGE = 50;

const keySelector = (item: AnalysisPillars) => (item.id);

function PillarListItem(props: PillarListRendererProps) {
    const {
        title,
        assigneeName,
    } = props;

    return (
        <div className={styles.pillarListContent}>
            <TextOutput
                labelClassName={styles.analyst}
                valueClassName={styles.analysisPillar}
                label={assigneeName}
                value={title}
                noColon
            />
        </div>
    );
}


function Analysis(props: ComponentProps) {
    const {
        title,
        className,
        startDate,
        endDate,
        activeProject,
        analysisId,
        onDelete,
        teamLeadName,
        createdOn,
    } = props;

    const [analysisPillar, setAnalysisPillar] = useState<AnalysisPillars[]>([]);
    const [activePage, setActivePage] = useState<number>(1);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [pillarAnalysisToDelete, setPillarAnalysisToDelete] = useState<number | undefined>();
    const queryOptions = useMemo(() => ({
        offset: (activePage - 1) * MAX_ITEMS_PER_PAGE,
        limit: MAX_ITEMS_PER_PAGE,
    }), [activePage]);
    const [
        pillarPending,
        pillarResponse,
        ,
        pillarGetTrigger,
    ] = useRequest<MultiResponse<AnalysisPillars>>(
        {
            url: `server://projects/${activeProject}/analysis/${analysisId}/pillars/`,
            method: 'GET',
            query: queryOptions,
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
        setExpanded(!expanded);
    }, [expanded]);

    const handlePillarAnalysisToDelete = useCallback((toDeleteKey: number) => {
        setPillarAnalysisToDelete(toDeleteKey);
        deletePillarTrigger();
    }, [deletePillarTrigger]);

    const analysisPillarRendererParams = useCallback((_, data) => ({
        pillarId: data.id,
        title: data.title,
        assigneeName: data.assigneeName,
        createdOn,
        analysis: data.analysis,
        onDelete: handlePillarAnalysisToDelete,
    }), [handlePillarAnalysisToDelete, createdOn]);

    const handleDeleteAnalysis = useCallback(() => {
        onDelete(analysisId);
    }, [analysisId, onDelete]);

    const pillarListRendererParams = useCallback((_: number, data) => {
        const returnValue: PillarListRendererProps = {
            assigneeName: data.assigneeName,
            title: data.title,
        };

        return returnValue;
    }, []);

    return (
        <ContainerCard
            className={_cs(className, styles.analysisItem)}
            heading={title}
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
                    <TextOutput
                        className={styles.textOutput}
                        labelClassName={styles.label}
                        valueClassName={styles.value}
                        label={_ts('analysis', 'teamLead')}
                        value={teamLeadName}
                        noColon
                    />
                </div>

                <div className={styles.contentItem}>
                    <h3 className={styles.subHeading}>
                        {_ts('analysis', 'pillarAssignments')}
                    </h3>
                    <ListView
                        data={analysisPillar}
                        renderer={PillarListItem}
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
                        <Icon name={expanded
                            ? 'chevronUp'
                            : 'chevronDown'}
                        />
                    )}
                    onClick={handleClick}
                >
                    {_ts('analysis', 'pillarAnalysisCount', { count: pillarResponse?.count })}
                </Button>
                {expanded && (
                    <>
                        <div className={styles.pillarAnalysisContent}>
                            <ListView
                                className={styles.pillarList}
                                data={analysisPillar}
                                keySelector={keySelector}
                                renderer={AnalysisPillar}
                                rendererParams={analysisPillarRendererParams}
                                pending={pillarPending}
                            />
                        </div>
                        {/* TODO:To be replaced with new Pager Component */}
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
