import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';
import {
    Pager,
    ContainerCard,
    QuickActionButton,
    ListView,
    ExpandableContainer,
    TextOutput,
    PendingMessage,
} from '@the-deep/deep-ui';

import Icon from '#rscg/Icon';
import DateRangeOutput from '#dui/DateRangeOutput';

import { useRequest, useLazyRequest } from '#utils/request';

import {
    AppState,
    MultiResponse,
    AnalysisPillars,
} from '#typings';

import _ts from '#ts';
import { activeProjectIdFromStateSelector } from '#redux';
import AnalysisPillar from './AnalysisPillar';
import PillarAssignment from './PillarAssignment';

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
    analysisPillars: AnalysisPillars[];
}

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});

const MAX_ITEMS_PER_PAGE = 50;

const keySelector = (item: AnalysisPillars) => (item.id);

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
        analysisPillars: analysisPillarsFromProps,
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

    const [activePage, setActivePage] = useState<number>(1);

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
        },
    );

    // NOTE: Whenever the details of the analysis is changed, we refetch all the pillar
    // analysis of that analysis
    useEffect(() => {
        pillarGetTrigger();
    }, [pillarGetTrigger, modifiedAt]);

    const {
        pending: pendingPillarDelete,
        trigger: triggerPillarDelete,
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

    const analysisPillarRendererParams = useCallback((_, data: AnalysisPillars) => ({
        className: styles.pillar,
        analysisId: data.analysis,
        assigneeName: data.assigneeName,
        createdAt,
        onDelete: triggerPillarDelete,
        statements: data.analyticalStatements,
        pillarId: data.id,
        projectId: activeProject,
        title: data.title,
        pendingPillarDelete: pendingPillarDelete && data.id === deletePillarId,
    }), [
        triggerPillarDelete,
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

    const pillarAssignmentRendererParams = useCallback(
        (_: number, data: AnalysisPillars) => ({
            assigneeName: data.assigneeName,
            pillarTitle: data.title,
            status: 'Not available',
        }),
        [],
    );

    const disabled = pendingPillarDelete || pendingAnalysisDelete || pendingAnalysisClone;

    return (
        <ContainerCard
            className={_cs(className, styles.analysisItem)}
            heading={title}
            headingSize="small"
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
            horizontallyCompactContent
        >
            {pendingAnalysisDelete && <PendingMessage />}
            <div className={styles.analysisDetails}>
                <div className={styles.metaSection}>
                    <TextOutput
                        className={styles.teamLeadName}
                        label={_ts('analysis', 'teamLead')}
                        value={teamLeadName}
                        hideLabelColon
                        block
                    />
                    <TextOutput
                        className={styles.pillarAssignments}
                        label={_ts('analysis', 'pillarAssignments')}
                        valueContainerClassName={styles.overflowWrapper}
                        block
                        hideLabelColon
                        value={(
                            <ListView
                                className={styles.pillarAssignmentList}
                                data={analysisPillarsFromProps}
                                renderer={PillarAssignment}
                                rendererParams={pillarAssignmentRendererParams}
                                keySelector={keySelector}
                            />
                        )}
                    />
                </div>
                <div className={styles.chartSection}>
                    Charts
                </div>
            </div>
            <ExpandableContainer
                headerClassName={styles.pillarAnalysesHeader}
                className={styles.pillarAnalyses}
                heading={_ts('analysis', 'pillarAnalysisCount', { count: analysisPillarsFromProps.length })}
                headingSize="extraSmall"
                horizontallyCompactContent
                sub
                footerActions={((pillarResponse?.count ?? 0) / MAX_ITEMS_PER_PAGE) > 1 ? (
                    <Pager
                        activePage={activePage}
                        itemsCount={pillarResponse?.count ?? 0}
                        maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                        onActivePageChange={setActivePage}
                        itemsPerPageControlHidden
                    />
                ) : undefined}
            >
                <ListView
                    className={styles.pillarList}
                    data={pillarResponse?.results}
                    keySelector={keySelector}
                    pending={pillarPending}
                    renderer={AnalysisPillar}
                    rendererParams={analysisPillarRendererParams}
                />
            </ExpandableContainer>
        </ContainerCard>
    );
}

export default connect(mapStateToProps)(Analysis);
