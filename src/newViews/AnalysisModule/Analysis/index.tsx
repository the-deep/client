import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';
import {
    Pager,
    ContainerCard,
    QuickActionButton,
    List,
    ListView,
    Container,
    ExpandableContainer,
} from '@the-deep/deep-ui';

import Icon from '#rscg/Icon';
import DateRangeOutput from '#dui/DateRangeOutput';
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
    analysisPillars: AnalysisPillars[];
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
                <Container
                    sub
                    heading={_ts('analysis', 'pillarAssignments')}
                >
                    <List
                        data={analysisPillarsFromProps}
                        renderer={PillarListItem}
                        rendererParams={pillarListRendererParams}
                        keySelector={keySelector}
                    />
                </Container>
            </div>
            <ExpandableContainer
                heading={_ts('analysis', 'pillarAnalysisCount', { count: analysisPillarsFromProps.length })}
                footerContent={(
                    <Pager
                        activePage={activePage}
                        itemsCount={pillarResponse?.count ?? 0}
                        maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                        onActivePageChange={setActivePage}
                        itemsPerPageControlHidden
                    />
                )}
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
