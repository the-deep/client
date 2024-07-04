import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Pager,
    Container,
    ListView,
    Kraken,
} from '@the-deep/deep-ui';

import { AnalysisSummaryQuery } from '#generated/types';

import AnalysisPillar, { Props as PillarComponentProps } from '../AnalysisPillar';

import styles from './styles.css';

type PillarSummary = NonNullable<NonNullable<NonNullable<AnalysisSummaryQuery['project']>['analysisPillars']>['results']>[number];

const MAX_ITEMS_PER_PAGE = 5;
const keySelector = (item: PillarSummary) => item.id;

interface Props {
    className?: string;
    createdAt: string;
    activeProject: string;
    onAnalysisPillarDelete: () => void;
    analysisId: string;
    totalEntries: number | undefined;
    pillars: PillarSummary[] | null | undefined;
    pillarsPending: boolean;
}

function AnalysisDetails(props: Props) {
    const {
        className,
        createdAt,
        activeProject,
        onAnalysisPillarDelete,
        analysisId,
        totalEntries,
        pillars,
        pillarsPending,
    } = props;

    const [activePage, setActivePage] = useState(1);

    const analysisPillarRendererParams = useCallback(
        (_: string, data: PillarSummary): PillarComponentProps => ({
            className: styles.pillar,
            analysisId,
            assigneeName: data.assignee?.displayName,
            createdAt,
            onDelete: onAnalysisPillarDelete,
            statements: data.statements,
            pillarId: data.id,
            analyzedEntries: data.analyzedEntriesCount,
            projectId: activeProject,
            title: data.title,
            totalEntries,
            pendingPillarDelete: pillarsPending,
        }), [
            onAnalysisPillarDelete,
            totalEntries,
            createdAt,
            analysisId,
            activeProject,
            pillarsPending,
        ],
    );

    return (
        <Container
            className={_cs(className, styles.container)}
            spacing="none"
            contentClassName={styles.content}
            footerActions={((pillars?.length ?? 0) / MAX_ITEMS_PER_PAGE) > 1 ? (
                <Pager
                    activePage={activePage}
                    itemsCount={pillars?.length ?? 0}
                    maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                    onActivePageChange={setActivePage}
                    itemsPerPageControlHidden
                />
            ) : undefined}
        >
            <ListView
                className={styles.pillarList}
                data={pillars}
                keySelector={keySelector}
                renderer={AnalysisPillar}
                rendererParams={analysisPillarRendererParams}
                filtered={false}
                pending={pillarsPending}
                errored={false}
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
