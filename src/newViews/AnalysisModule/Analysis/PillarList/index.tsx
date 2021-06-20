import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Pager,
    Container,
    ListView,
} from '@the-deep/deep-ui';

import { useRequest, useLazyRequest } from '#utils/request';

import {
    MultiResponse,
    AnalysisPillars,
} from '#typings';

import AnalysisPillar from '../AnalysisPillar';

import styles from './styles.scss';

const MAX_ITEMS_PER_PAGE = 5;
const keySelector = (item: AnalysisPillars) => (item.id);

interface Props {
    className?: string;
    createdAt: string;
    modifiedAt: string;
    activeProject: number;
    onAnalysisPillarDelete: () => void;
    analysisId: number;
}

function AnalysisDetails(props: Props) {
    const {
        className,
        createdAt,
        modifiedAt,
        activeProject,
        onAnalysisPillarDelete,
        analysisId,
    } = props;

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

    return (
        <Container
            className={_cs(className, styles.container)}
            horizontallyCompactContent
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
            />
        </Container>
    );
}

export default AnalysisDetails;
