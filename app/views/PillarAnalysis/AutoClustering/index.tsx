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
    ConfirmButton,
    useBooleanState,
    useAlert,
} from '@the-deep/deep-ui';

import {
    EntriesFilterDataInputType,
    PillarAutoClusteringResultsQuery,
    PillarAutoClusteringResultsQueryVariables,
    PillarAutoClusteringMutation,
    PillarAutoClusteringMutationVariables,
} from '#generated/types';
import { ENTRY_FRAGMENT } from '#gqlFragments';

import {
    Entry,
} from '..';
import {
    PartialAnalyticalStatementType,
} from '../schema';

import styles from './styles.css';

const MIN_ENTRIES = 5;

const PILLAR_AUTO_CLUSTERING_RESULTS = gql`
    ${ENTRY_FRAGMENT}
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
                    title
                    entries {
                        ...EntryResponse
                        createdBy {
                            id
                            displayName
                        }
                        modifiedAt
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
                            source {
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
                            shareViewUrl
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
        $widgetTags: [String!],
    ) {
        project(id: $projectId) {
            triggerAnalysisTopicModel(
                data: {
                    analysisPillar: $pillarId,
                    additionalFilters: $filterData,
                    widgetTags: $widgetTags,
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
    entriesCount: number | null | undefined;
    entriesFilter: EntriesFilterDataInputType;
    isPrivateProject?: boolean;
    onEntriesMappingChange: React.Dispatch<React.SetStateAction<Obj<Entry>>>;
    onStatementsFromClustersSet: (newStatements: PartialAnalyticalStatementType[]) => void;
    widgetTagLabels: string[] | undefined;
}

function AutoClustering(props: Props) {
    const {
        pillarId,
        projectId,
        entriesFilter,
        entriesCount,
        isPrivateProject,
        onEntriesMappingChange,
        onStatementsFromClustersSet,
        widgetTagLabels: widgetTagLabelsFromProps,
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
                const autoClusteringResponse = response?.project?.triggerAnalysisTopicModel;
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

    const status = autoClusteringResults?.project?.analysisTopicModel?.status;
    const clusters = autoClusteringResults?.project?.analysisTopicModel?.clusters;

    const handleClustersApply = useCallback(() => {
        const listOfEntries = clusters?.map(
            (cluster) => (cluster?.entries.filter(isDefined) ?? []),
        ).flat() as Entry[];
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
                    clientId: randomString(),
                    order: entryIndex + 1,
                    entry: entry.id,
                })),
                order: index + 1,
                includeInReport: false,
                reportText: '',
                informationGaps: '',
                clientId: randomString(),
                title: cluster.title ?? undefined,
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

    let buttonTitle = 'Auto Cluster';
    if ((entriesCount ?? 0) < 26) {
        buttonTitle = 'Auto clustering cannot be trigged if number of entries are less than 25.';
    } else if (autoClusteringResultsPending) {
        buttonTitle = 'DEEP is processing entries';
    }

    const handleAutoClusteringTriggerClick = useCallback(() => {
        triggerAutoClustering({
            variables: {
                projectId,
                pillarId,
                filterData: entriesFilter,
                widgetTags: widgetTagLabelsFromProps,
            },
        });
    }, [
        entriesFilter,
        widgetTagLabelsFromProps,
        pillarId,
        projectId,
        triggerAutoClustering,
    ]);

    if (activeTopicModellingId) {
        return (
            <>
                <Button
                    name={undefined}
                    className={styles.clusterButton}
                    onClick={showModal}
                    variant="tertiary"
                    spacing="compact"
                    title={buttonTitle}
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
                            pending={autoClusteringResultsPending || status === 'PENDING' || status === 'STARTED'}
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
            className={styles.clusterButton}
            name={undefined}
            onConfirm={handleAutoClusteringTriggerClick}
            message={(
                <>
                    Are you sure you want to trigger auto clustering of entries into new
                    stories? This will replace current analytical statements with suggested
                    groupings using NLP. Entries from confidential sources are filtered out
                    to maintain document privacy.
                    <br />
                    <br />
                    <i>
                        NOTE: Auto clustering entries may take time depending on your internet
                        bandwidth, number of entries to be clustered and traffic in the auto
                        clustering request.
                    </i>
                </>
            )}
            disabled={pendingAutoClusterTrigger
                || ((entriesCount ?? 0) < MIN_ENTRIES)
                || isPrivateProject}
            variant="tertiary"
            spacing="compact"
            title={buttonTitle}
        >
            Auto Cluster
        </ConfirmButton>
    );
}

export default AutoClustering;
