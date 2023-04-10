import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
    Obj,
    listToMap,
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    useQuery,
    gql,
    useMutation,
} from '@apollo/client';
import {
    Modal,
    Kraken,
    Message,
    Button,
    useBooleanState,
    ConfirmButton,
    useAlert,
} from '@the-deep/deep-ui';

import {
    EntriesFilterDataInputType,
    PillarAutoClusteringResultsQuery,
    PillarAutoClusteringResultsQueryVariables,
    PillarAutoClusteringMutation,
    PillarAutoClusteringMutationVariables,
} from '#generated/types';

import { EntryMin } from '../context';
import {
    PartialAnalyticalStatementType,
} from '../schema';

import styles from './styles.css';

const PILLAR_AUTO_CLUSTERING_RESULTS = gql`
    query PillarAutoClusteringResults(
        $projectId: ID!,
        $topicModelingId: ID!,
    ) {
        project(id: $projectId) {
            id
            analysisTopicModel(id: $topicModelingId) {
                id
                status
                clusters {
                    id
                    entries {
                        id
                        excerpt
                        entryType
                        clientId
                        createdAt
                        droppedExcerpt
                        lead {
                            id
                            authors {
                                id
                                title
                                shortName
                                mergedAs {
                                    id
                                    title
                                    shortName
                                }
                            }
                            url
                        }
                        image {
                            id
                            title
                            file {
                                url
                            }
                        }
                    }
                }
            }
        }
    }
`;

const PILLAR_AUTO_CLUSTERING = gql`
    mutation PillarAutoClustering(
        $pillarId: ID!,
        $projectId: ID!,
        $filterData: EntriesFilterDataInputType,
    ) {
        project(id: $projectId) {
            triggerTopicModel(
                data: {
                    analysisPillar: $pillarId,
                    additionalFilters: $filterData,
                },
            ) {
                ok
                errors
                result {
                    id
                    status
                }
            }
        }
    }
`;

interface Props {
    pillarId: string;
    projectId: string;
    entriesFilter: EntriesFilterDataInputType;
    onEntriesMappingChange: React.Dispatch<React.SetStateAction<Obj<EntryMin>>>;
    onStatementsFromClustersSet: (newStatements: PartialAnalyticalStatementType[]) => void;
}

function AutoClustering(props: Props) {
    const {
        pillarId,
        projectId,
        entriesFilter,
        onEntriesMappingChange,
        onStatementsFromClustersSet,
    } = props;
    const alert = useAlert();

    const [activeTopicModellingId, setActiveTopicModellingId] = useState<string | undefined>();

    const [
        modalShown,
        showModal,
        hideModal,
    ] = useBooleanState(false);

    const variables = useMemo(
        () => (activeTopicModellingId ? ({
            projectId,
            topicModelingId: activeTopicModellingId,
        }) : undefined),
        [
            activeTopicModellingId,
            projectId,
        ],
    );

    const {
        loading: autoClusteringResultsPending,
        data: autoClusteringResults,
        startPolling,
        stopPolling,
    } = useQuery<PillarAutoClusteringResultsQuery, PillarAutoClusteringResultsQueryVariables>(
        PILLAR_AUTO_CLUSTERING_RESULTS,
        {
            skip: !variables,
            variables,
        },
    );

    useEffect(
        () => {
            const shouldPoll = activeTopicModellingId
                && autoClusteringResults?.project?.analysisTopicModel?.status !== 'SUCCESS'
                && autoClusteringResults?.project?.analysisTopicModel?.status !== 'SEND_FAILED'
                && autoClusteringResults?.project?.analysisTopicModel?.status !== 'FAILED';

            if (shouldPoll) {
                startPolling(5000);
            } else {
                stopPolling();
            }
            return (() => {
                stopPolling();
            });
        },
        [
            activeTopicModellingId,
            autoClusteringResults?.project?.analysisTopicModel?.status,
            startPolling,
            stopPolling,
        ],
    );

    const [
        triggerAutoClustering,
        {
            loading: pendingAutoClusterTrigger,
        },
    ] = useMutation<PillarAutoClusteringMutation, PillarAutoClusteringMutationVariables>(
        PILLAR_AUTO_CLUSTERING,
        {
            onCompleted: (response) => {
                const autoClusteringResponse = response?.project?.triggerTopicModel;
                if (autoClusteringResponse?.ok) {
                    setActiveTopicModellingId(autoClusteringResponse?.result?.id);
                } else if (autoClusteringResponse?.errors) {
                    alert.show(
                        'Failed to suggest automatic grouping using NLP.',
                        {
                            variant: 'error',
                        },
                    );
                }
                showModal();
            },
            onError: () => {
                alert.show(
                    'Failed to suggest automatic grouping using NLP.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleAutoClusteringTriggerClick = useCallback(() => {
        triggerAutoClustering({
            variables: {
                projectId,
                pillarId,
                filterData: entriesFilter,
            },
        });
    }, [
        triggerAutoClustering,
        entriesFilter,
        pillarId,
        projectId,
    ]);

    const status = autoClusteringResults?.project?.analysisTopicModel?.status;
    const clusters = autoClusteringResults?.project?.analysisTopicModel?.clusters;

    const handleClustersApply = useCallback(() => {
        const listOfEntries = clusters?.map(
            (cluster) => (cluster?.entries.filter(isDefined) ?? []),
        ).flat();
        onEntriesMappingChange((oldEntriesMappings) => ({
            ...oldEntriesMappings,
            ...listToMap(
                listOfEntries ?? [],
                (item) => item.id,
                (item) => item,
            ),
        }));
        const newStatements: PartialAnalyticalStatementType[] = clusters?.filter(isDefined).map(
            (cluster, index) => ({
                entries: cluster.entries.filter(isDefined).map((entry, entryIndex) => ({
                    order: entryIndex + 1,
                    entry: entry.id,
                })),
                order: index + 1,
                includeInReport: false,
                clientId: randomString(),
            }),
        ) ?? [];
        onStatementsFromClustersSet(newStatements);
        setActiveTopicModellingId(undefined);
        hideModal();
    }, [
        onStatementsFromClustersSet,
        hideModal,
        clusters,
        onEntriesMappingChange,
    ]);

    const handleClustersReset = useCallback(() => {
        setActiveTopicModellingId(undefined);
    }, []);

    if (activeTopicModellingId) {
        return (
            <>
                <Button
                    name={undefined}
                    onClick={showModal}
                    variant="tertiary"
                    spacing="compact"
                    title={autoClusteringResultsPending ? 'DEEP is processing entries' : 'Auto Clustering'}
                >
                    Auto Cluster
                </Button>
                {modalShown && (
                    <Modal
                        heading="Auto Clustering"
                        className={styles.modal}
                        onCloseButtonClick={hideModal}
                        size="extraSmall"
                    >
                        <Message
                            pendingMessage="Deep is processing entries"
                            pending={autoClusteringResultsPending || status === 'PENDING'}
                            errored={status === 'FAILED' || status === 'SEND_FAILED'}
                            erroredEmptyMessage="Failed to group entries into stories"
                            erroredEmptyIcon={<Kraken variant="crutches" />}
                            message={`DEEP was able to cluster the entries into ${clusters?.length} clusters.`}
                            actionsContainerClassName={styles.actionButtons}
                            actions={status === 'SUCCESS' && (
                                <>
                                    <Button
                                        name={undefined}
                                        onClick={handleClustersReset}
                                        variant="tertiary"
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        name={undefined}
                                        onClick={handleClustersApply}
                                    >
                                        Apply Clusters
                                    </Button>
                                </>
                            )}
                        />
                    </Modal>
                )}
            </>
        );
    }

    return (
        <ConfirmButton
            name={undefined}
            onConfirm={handleAutoClusteringTriggerClick}
            message="Are you sure you want to trigger auto clustering of entries into new stories? This will replace current analytical statements with suggested groupings using NLP."
            disabled={pendingAutoClusterTrigger}
            variant="tertiary"
            spacing="compact"
            title={!pendingAutoClusterTrigger ? 'Trigger Auto Clustering' : 'DEEP is processing entries'}
        >
            Auto Cluster
        </ConfirmButton>
    );
}

export default AutoClustering;
