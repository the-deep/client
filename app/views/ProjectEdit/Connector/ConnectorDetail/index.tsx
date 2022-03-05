import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    compareDate,
} from '@togglecorp/fujs';
import {
    DateOutput,
    TextOutput,
    useAlert,
    ContainerCard,
    PendingMessage,
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import {
    gql,
    useQuery,
    useMutation,
} from '@apollo/client';
import { FiEdit2 } from 'react-icons/fi';
import {
    IoReload,
    IoTrash,
    IoEye,
    IoEyeOff,
} from 'react-icons/io5';

import {
    ProjectConnectorDetailsQuery,
    ProjectConnectorDetailsQueryVariables,

    ProjectConnectorDeleteMutation,
    ProjectConnectorDeleteMutationVariables,

    ProjectConnectorTriggerMutation,
    ProjectConnectorTriggerMutationVariables,
} from '#generated/types';

import styles from './styles.css';

const PROJECT_CONNECTOR_DETAILS = gql`
    query ProjectConnectorDetails(
        $projectId: ID!,
        $connectorId: ID!,
    ) {
        project(id: $projectId) {
            id
            unifiedConnector {
                unifiedConnector(id: $connectorId) {
                    id
                    title
                    createdAt
                    isActive
                    sources {
                        id
                        createdAt
                        title
                        lastFetchedAt
                    }
                }
            }
        }
    }
`;

const PROJECT_CONNECTOR_DELETE = gql`
    mutation ProjectConnectorDelete(
        $projectId: ID!,
        $connectorId: ID!,
    ) {
        project(id: $projectId) {
            id
            unifiedConnector {
                unifiedConnectorDelete(id: $connectorId) {
                    ok
                    errors
                }
            }
        }
    }
`;

const PROJECT_CONNECTOR_TRIGGER = gql`
    mutation ProjectConnectorTrigger(
        $projectId: ID!,
        $connectorId: ID!,
    ) {
        project(id: $projectId) {
            id
            unifiedConnector {
                unifiedConnectorTrigger(id: $connectorId) {
                    ok
                    errors
                }
            }
        }
    }
`;

interface Props {
    className?: string;
    connectorId: string;
    projectId: string;
}

function ConnectorDetail(props: Props) {
    const {
        className,
        connectorId,
        projectId,
    } = props;
    const alert = useAlert();

    const variables = useMemo(
        (): ProjectConnectorDetailsQueryVariables => ({
            projectId,
            connectorId,
        }),
        [
            projectId,
            connectorId,
        ],
    );

    const {
        loading: pendingConnectorDetails,
        data: connectorDetailsResponse,
    } = useQuery<ProjectConnectorDetailsQuery, ProjectConnectorDetailsQueryVariables>(
        PROJECT_CONNECTOR_DETAILS,
        {
            variables,
        },
    );

    const [
        deleteConnector,
        {
            loading: pendingConnectorDelete,
        },
    ] = useMutation<ProjectConnectorDeleteMutation, ProjectConnectorDeleteMutationVariables>(
        PROJECT_CONNECTOR_DELETE,
        {
            onCompleted: (response) => {
                if (response?.project?.unifiedConnector?.unifiedConnectorDelete?.ok) {
                    alert.show(
                        'Successfully deleted connector.',
                        {
                            variant: 'success',
                        },
                    );
                } else {
                    alert.show(
                        'Failed to delete connector.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
        },
    );

    const [
        triggerConnector,
        {
            loading: pendingConnectorTrigger,
        },
    ] = useMutation<ProjectConnectorTriggerMutation, ProjectConnectorTriggerMutationVariables>(
        PROJECT_CONNECTOR_TRIGGER,
        {
            onCompleted: (response) => {
                if (response?.project?.unifiedConnector?.unifiedConnectorTrigger?.ok) {
                    alert.show(
                        'Successfully triggered connector.',
                        {
                            variant: 'success',
                        },
                    );
                } else {
                    alert.show(
                        'Failed to trigger connector.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
        },
    );

    const connector = connectorDetailsResponse?.project?.unifiedConnector?.unifiedConnector;

    const handleRetriggerButtonClick = useCallback(() => {
        triggerConnector({
            variables: {
                projectId,
                connectorId,
            },
        });
    }, [
        triggerConnector,
        projectId,
        connectorId,
    ]);

    const handleEditButtonClick = useCallback(() => {
        console.warn('Todo edit change');
    }, []);

    const handleDeleteButtonClick = useCallback(() => {
        deleteConnector({
            variables: {
                projectId,
                connectorId,
            },
        });
    }, [
        projectId,
        deleteConnector,
        connectorId,
    ]);

    const handleConnectorStatusChange = useCallback(() => {
        console.warn('Todo handle status change');
    }, []);

    const loading = pendingConnectorTrigger
        || pendingConnectorDelete
        || pendingConnectorDetails;

    const latestFetchedAt = useMemo(() => {
        if (!connector || !connector.sources) {
            return undefined;
        }
        const lastFetchedDates = [...connector.sources].map((source) => source.lastFetchedAt);
        lastFetchedDates.sort(compareDate);

        return lastFetchedDates[0] ?? undefined;
    }, [connector]);

    return (
        <ContainerCard
            className={_cs(styles.connectorDetail, className)}
            heading={connector?.title ?? '-'}
            headingSize="small"
            headerActionsContainerClassName={styles.headerActions}
            headerDescription={(
                <>
                    <TextOutput
                        label="Last updated on"
                        value={(
                            <DateOutput
                                value={latestFetchedAt}
                            />
                        )}
                    />
                    <TextOutput
                        label="Created on"
                        value={(
                            <DateOutput
                                value={connector?.createdAt}
                            />
                        )}
                    />
                </>
            )}
            headerActions={(
                <>
                    <QuickActionButton
                        name={undefined}
                        onClick={handleRetriggerButtonClick}
                        title="Fetch latest data for this connector"
                        disabled={!connector?.isActive}
                    >
                        <IoReload />
                    </QuickActionButton>
                    <QuickActionButton
                        name={undefined}
                        onClick={handleConnectorStatusChange}
                        title={connector?.isActive ? 'Disable Connector' : 'Enable Connector'}
                    >
                        {connector?.isActive ? <IoEyeOff /> : <IoEye />}
                    </QuickActionButton>
                    <QuickActionButton
                        name={undefined}
                        title="Edit Connector"
                        onClick={handleEditButtonClick}
                    >
                        <FiEdit2 />
                    </QuickActionButton>
                    <QuickActionConfirmButton
                        name={undefined}
                        title="Delete Connector"
                        onConfirm={handleDeleteButtonClick}
                        message="Are you sure you want to delete this connector?"
                    >
                        <IoTrash />
                    </QuickActionConfirmButton>
                </>
            )}
            borderBelowHeader
        >
            {loading && <PendingMessage />}
            Connector Detail
        </ContainerCard>
    );
}

export default ConnectorDetail;
