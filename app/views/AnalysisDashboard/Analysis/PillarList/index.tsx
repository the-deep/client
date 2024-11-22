import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Pager,
    Container,
    useAlert,
    ListView,
    Kraken,
} from '@the-deep/deep-ui';
import {
    gql,
    useQuery,
    useMutation,
} from '@apollo/client';

import {
    AnalysisPillarsQuery,
    AnalysisPillarsQueryVariables,
    DeletePillarAnalysisMutation,
    DeletePillarAnalysisMutationVariables,
} from '#generated/types';

import AnalysisPillar, { Props as PillarComponentProps } from '../AnalysisPillar';

import styles from './styles.css';

type PillarItem = NonNullable<NonNullable<NonNullable<AnalysisPillarsQuery['project']>['analysisPillars']>['results']>[number];

export const ANALYSIS_PILLARS = gql`
    query AnalysisPillars(
        $projectId: ID!,
        $page: Int,
        $analysisId: ID!,
        $pageSize: Int,
    ) {
        project(id: $projectId) {
            analysisPillars(
                page: $page,
                analyses: [$analysisId],
                pageSize: $pageSize,
            ) {
                results {
                    id
                    title
                    createdAt
                    analysisId
                    analyzedEntriesCount
                    assignee {
                        displayName
                        id
                    }
                    statements {
                        id
                        statement
                        entriesCount
                    }
                }
                totalCount
            }
        }
    }
`;

const DELETE_PILLAR_ANALYSIS = gql`
    mutation DeletePillarAnalysis(
        $projectId: ID!,
        $analysisPillarId: ID!,
    ) {
        project(id: $projectId) {
            id
            analysisPillarDelete(id: $analysisPillarId) {
                ok
                errors
            }
        }
    }
`;

const MAX_ITEMS_PER_PAGE = 5;
const keySelector = (item: PillarItem) => item.id;

interface Props {
    className?: string;
    createdAt: string;
    projectId: string;
    analysisId: string;
    totalEntries: number | undefined;
}

function AnalysisDetails(props: Props) {
    const {
        className,
        createdAt,
        projectId,
        analysisId,
        totalEntries,
    } = props;

    const [activePage, setActivePage] = useState(1);

    const {
        data: analysisPillarsData,
        loading: pillarsPending,
        refetch: refetchPillarAnalyses,
    } = useQuery<AnalysisPillarsQuery, AnalysisPillarsQueryVariables>(
        ANALYSIS_PILLARS,
        {
            variables: {
                page: activePage,
                analysisId,
                projectId,
                pageSize: MAX_ITEMS_PER_PAGE,
            },
        },
    );

    const alert = useAlert();

    const [
        deletePillarAnalysis,
        {
            loading: deletePillarAnalysisPending,
        },
    ] = useMutation<DeletePillarAnalysisMutation, DeletePillarAnalysisMutationVariables>(
        DELETE_PILLAR_ANALYSIS,
        {
            onCompleted: (response) => {
                if (response?.project?.analysisPillarDelete?.ok) {
                    alert.show(
                        'Successfully deleted pillar analysis.',
                        { variant: 'success' },
                    );
                    refetchPillarAnalyses();
                } else {
                    alert.show(
                        'Failed to delete pillar analysis.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete pillar analysis.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleAnalysisPillarDelete = useCallback((analysisPillarId: string) => {
        deletePillarAnalysis({
            variables: {
                projectId,
                analysisPillarId,
            },
        });
    }, [
        projectId,
        deletePillarAnalysis,
    ]);

    const analysisPillarRendererParams = useCallback(
        (_: string, data: PillarItem): PillarComponentProps => ({
            className: styles.pillar,
            analysisId,
            assigneeName: data.assignee?.displayName,
            createdAt,
            onDelete: handleAnalysisPillarDelete,
            statements: data.statements,
            pillarId: data.id,
            analyzedEntries: data.analyzedEntriesCount,
            projectId,
            title: data.title,
            totalEntries,
            pendingPillarDelete: deletePillarAnalysisPending,
        }), [
            deletePillarAnalysisPending,
            handleAnalysisPillarDelete,
            totalEntries,
            createdAt,
            analysisId,
            projectId,
        ],
    );

    const pillars = analysisPillarsData?.project?.analysisPillars;

    return (
        <Container
            className={_cs(className, styles.container)}
            spacing="none"
            contentClassName={styles.content}
            footerActions={((pillars?.totalCount ?? 0) / MAX_ITEMS_PER_PAGE) > 1 ? (
                <Pager
                    activePage={activePage}
                    itemsCount={pillars?.totalCount ?? 0}
                    maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                    onActivePageChange={setActivePage}
                    itemsPerPageControlHidden
                />
            ) : undefined}
        >
            <ListView
                className={styles.pillarList}
                data={analysisPillarsData?.project?.analysisPillars?.results}
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
