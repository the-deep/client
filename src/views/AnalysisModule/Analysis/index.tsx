import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';
import {
    Pager,
    ContainerCard,
    Button,
    QuickActionButton,
} from '@the-deep/deep-ui';

import Icon from '#rscg/Icon';
import DateRangeOutput from '#dui/DateRangeOutput';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';
import TextOutput from '#components/general/TextOutput';

import { useRequest, useLazyRequest } from '#utils/request';

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
    analysisId: number;
    className?: string;
    title: string;
    startDate?: string;
    endDate?: string;
    activeProject: number;
    onEdit: (analysisId: number) => void;
    onAnalysisPillarDelete: () => void;
    teamLeadName: string;
    createdAt: string;
    modifiedAt: string;
    onDelete: (value: number) => void;
    pendingAnalysisDelete: boolean;
    onClone: (value: number, title: string) => void;
    pendingAnalysisClone: boolean;
}

type PillarListRendererProps = {
    title: string;
    assigneeName: string;
};

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
        modifiedAt,
        className,
        startDate,
        endDate,
        activeProject,
        analysisId,
        teamLeadName,
        onAnalysisPillarDelete,
        createdAt,
        onEdit,
        onDelete,
        pendingAnalysisDelete,
        onClone,
        pendingAnalysisClone,
    } = props;

    const handleEditClick = useCallback(() => {
        onEdit(analysisId);
    }, [analysisId, onEdit]);

    const [analysisPillar, setAnalysisPillar] = useState<AnalysisPillars[]>([]);
    const [activePage, setActivePage] = useState<number>(1);
    const [expanded, setExpanded] = useState<boolean>(false);

    const queryOptions = useMemo(() => ({
        offset: (activePage - 1) * MAX_ITEMS_PER_PAGE,
        limit: MAX_ITEMS_PER_PAGE,
    }), [activePage]);

    const {
        pending: pillarPending,
        response: pillarResponse,
        retrigger: pillarGetTrigger,
    } = useRequest<MultiResponse<AnalysisPillars>>(
        {
            url: `server://projects/${activeProject}/analysis/${analysisId}/pillars/`,
            method: 'GET',
            query: queryOptions,
            onSuccess: (response) => {
                setAnalysisPillar(response.results);
            },
        },
    );

    // NOTE: Whenever the details of the analysis is changed, we refetch all the pillar
    // analysis of that analysis
    useEffect(() => {
        pillarGetTrigger();
    }, [pillarGetTrigger, modifiedAt]);

    const {
        pending: pendingPillarDelete,
        trigger: deletePillarTrigger,
        context: deletePillarId,
    } = useLazyRequest<unknown, number>(
        {
            url: ctx => `server://projects/${activeProject}/analysis/${analysisId}/pillars/${ctx}/`,
            method: 'DELETE',
            onSuccess: () => {
                onAnalysisPillarDelete();
                pillarGetTrigger();
            },
        },
    );

    // FIXME: please use variable name with the context
    // i.e. What click does this handles?
    // suggestion: handleAccordionButtonClick
    const handleClick = useCallback(() => {
        setExpanded(!expanded);
    }, [expanded]);

    const handlePillarAnalysisToDelete = useCallback((toDeleteKey: number) => {
        deletePillarTrigger(toDeleteKey);
    }, [deletePillarTrigger]);

    const analysisPillarRendererParams = useCallback((_, data: AnalysisPillars) => ({
        analysisId: data.analysis,
        assigneeName: data.assigneeName,
        createdAt,
        onDelete: handlePillarAnalysisToDelete,
        statements: data.analyticalStatements,
        pillarId: data.id,
        projectId: activeProject,
        title: data.title,
        pendingPillarDelete: pendingPillarDelete && data.id === deletePillarId,
    }), [
        handlePillarAnalysisToDelete,
        createdAt,
        activeProject,
        pendingPillarDelete,
        deletePillarId,
    ]);

    const handleDeleteAnalysis = useCallback(() => {
        onDelete(analysisId);
    }, [analysisId, onDelete]);

    const handleCloneAnalysis = useCallback(() => {
        onClone(analysisId, title);
    }, [analysisId, onClone, title]);

    const pillarListRendererParams = useCallback(
        (_: number, data) => ({
            assigneeName: data.assigneeName,
            title: data.title,
        }),
        [],
    );

    const disabled = pendingPillarDelete || pendingAnalysisDelete || pendingAnalysisClone;

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
                <>
                    <QuickActionButton
                        name="edit"
                        onClick={handleEditClick}
                        disabled={disabled}
                    >
                        <Icon name="edit" />
                    </QuickActionButton>
                    <QuickActionButton
                        name="clone"
                        onClick={handleCloneAnalysis}
                        disabled={disabled}
                    >
                        <Icon name="copy" />
                    </QuickActionButton>
                    <QuickActionButton
                        name="delete"
                        onClick={handleDeleteAnalysis}
                        disabled={disabled}
                    >
                        <Icon name="delete" />
                    </QuickActionButton>
                </>
            )}
            contentClassName={styles.pillarContent}
        >
            <div className={styles.content}>
                {pendingAnalysisDelete && <LoadingAnimation />}
                <div className={styles.contentItem}>
                    <TextOutput
                        className={styles.textOutput}
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
            <div className={styles.pillarAnalyses}>
                <Button
                    name={undefined}
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
                        <Pager
                            activePage={activePage}
                            itemsCount={pillarResponse?.count ?? 0}
                            maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                            onActivePageChange={setActivePage}
                            itemsPerPageControlHidden
                        />
                    </>
                )}
            </div>
        </ContainerCard>
    );
}

export default connect(mapStateToProps)(Analysis);
