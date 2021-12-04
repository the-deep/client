import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Pager,
    Container,
    ListView,
    Kraken,
} from '@the-deep/deep-ui';

import { useRequest, useLazyRequest } from '#base/utils/restRequest';

import {
    MultiResponse,
    PillarSummary,
} from '#types';

import AnalysisPillar, { Props as PillarComponentProps } from '../AnalysisPillar';

import styles from './styles.css';

const MAX_ITEMS_PER_PAGE = 5;
const keySelector = (item: PillarSummary) => item.id;

interface Props {
    className?: string;
    createdAt: string;
    modifiedAt: string;
    activeProject: number;
    onAnalysisPillarDelete: () => void;
    analysisId: number;
    totalEntries: number;
}

function AnalysisDetails(props: Props) {
    const {
        className,
        createdAt,
        modifiedAt,
        activeProject,
        onAnalysisPillarDelete,
        analysisId,
        totalEntries,
    } = props;

    const [activePage, setActivePage] = useState(1);

    const queryOptions = useMemo(() => ({
        offset: (activePage - 1) * MAX_ITEMS_PER_PAGE,
        limit: MAX_ITEMS_PER_PAGE,
    }), [activePage]);

    const {
        pending: pillarPending,
        response: pillarResponse,
        retrigger: pillarGetTrigger,
    } = useRequest<MultiResponse<PillarSummary>>(
        {
            url: `server://projects/${activeProject}/analysis/${analysisId}/pillars/summary/`,
            method: 'GET',
            query: queryOptions,
        },
    );

    // NOTE: Whenever the details of the analysis is changed,
    // the modifiedAt field from parent changes and we refetch all the pillar
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
            url: (ctx) => `server://projects/${activeProject}/analysis/${analysisId}/pillars/${ctx}/`,
            method: 'DELETE',
            onSuccess: () => {
                onAnalysisPillarDelete();
                pillarGetTrigger();
            },
        },
    );

    const analysisPillarRendererParams = useCallback(
        (_, data: PillarSummary): PillarComponentProps => ({
            className: styles.pillar,
            analysisId,
            assigneeName: data.assigneeDetails?.displayName,
            createdAt,
            onDelete: triggerPillarDelete,
            statements: data.analyticalStatements,
            pillarId: data.id,
            analyzedEntries: data.analyzedEntries,
            projectId: activeProject,
            title: data.title,
            pendingPillarDelete: pendingPillarDelete && data.id === deletePillarId,
            totalEntries,
        }), [
            totalEntries,
            triggerPillarDelete,
            createdAt,
            analysisId,
            activeProject,
            pendingPillarDelete,
            deletePillarId,
        ],
    );

    return (
        <Container
            className={_cs(className, styles.container)}
            spacing="none"
            contentClassName={styles.content}
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
                filtered={false}
                emptyIcon={(
                    <Kraken
                        variant="exercise"
                    />
                )}
                emptyMessage="This analysis doesn't contain any pillar analysis."
                messageShown
                messageIconShown
            />
        </Container>
    );
}

export default AnalysisDetails;
