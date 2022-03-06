import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    compareDate,
    isDefined,
} from '@togglecorp/fujs';
import {
    DateOutput,
    useModalState,
    TextOutput,
    useAlert,
    ContainerCard,
    ListView,
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

    ProjectConnectorUpdateStatusMutation,
    ProjectConnectorUpdateStatusMutationVariables,
} from '#generated/types';

import EditConnectorModal from '../EditConnectorModal';
import ConnectorSource from './ConnectorSource';

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
                    clientId
                    sources {
                        id
                        createdAt
                        title
                        lastFetchedAt
                        stats {
                            date
                            count
                        }
                    }
                }
            }
        }
    }
`;

type Connector = NonNullable<NonNullable<ProjectConnectorDetailsQuery['project']>['unifiedConnector']>['unifiedConnector'];
export type Source = NonNullable<NonNullable<Connector>['sources']>[number];

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

const UPDATE_CONNECTOR_STATUS = gql`
    mutation ProjectConnectorUpdateStatus(
        $input: UnifiedConnectorInputType!,
        $projectId: ID!,
        $connectorId: ID!,
    ) {
        project(id: $projectId) {
            id
            unifiedConnector {
                unifiedConnectorUpdate(id: $connectorId, data: $input) {
                    errors
                    result {
                        id
                    }
                    ok
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

const sourceKeySelector = (source: Source) => source.id;

interface Props {
    className?: string;
    connectorId: string;
    projectId: string;
    onConnectorDeleteSuccess: () => void;
}

function ConnectorDetail(props: Props) {
    const {
        className,
        connectorId,
        projectId,
        onConnectorDeleteSuccess,
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
        refetch,
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
                    onConnectorDeleteSuccess();
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
        editConnectorModalShown,
        showEditConnectorModal,
        hideEditConnectorModal,
    ] = useModalState(false);

    const handleConnectorUpdateSuccess = useCallback(() => {
        refetch();
        hideEditConnectorModal();
    }, [hideEditConnectorModal, refetch]);

    const [
        updateConnector,
        { loading: pendingConnectorUpdate },
    ] = useMutation<
        ProjectConnectorUpdateStatusMutation,
        ProjectConnectorUpdateStatusMutationVariables
    >(
        UPDATE_CONNECTOR_STATUS,
        {
            onCompleted: (response) => {
                const res = response?.project?.unifiedConnector?.unifiedConnectorUpdate;
                if (!res) {
                    return;
                }
                const {
                    ok,
                    errors,
                } = res;

                if (errors) {
                    alert.show(
                        'There was an error while updating the connector\'s status.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    alert.show(
                        'Successfully update the connector\'s status.',
                        { variant: 'success' },
                    );
                    handleConnectorUpdateSuccess();
                }
            },
            onError: (errors) => {
                alert.show(
                    errors.message,
                    { variant: 'error' },
                );
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
        updateConnector({
            variables: {
                projectId,
                connectorId,
                input: {
                    title: connector?.title ?? 'Connector',
                    clientId: connector?.clientId,
                    isActive: !connector?.isActive,
                },
            },
        });
    }, [
        updateConnector,
        projectId,
        connectorId,
        connector,
    ]);

    const loading = pendingConnectorTrigger
        || pendingConnectorDelete
        || pendingConnectorDetails
        || pendingConnectorUpdate;

    const latestFetchedAt = useMemo(() => {
        if (!connector || !connector.sources) {
            return undefined;
        }
        const lastFetchedDates = connector.sources
            .map((source) => source.lastFetchedAt)
            .filter(isDefined)
            .sort(compareDate);
        return lastFetchedDates[0];
    }, [connector]);

    const sourceRendererParams = useCallback((_: string, source: Source) => ({
        className: styles.sourceItem,
        source,
    }), []);

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
                        disabled={!connector?.isActive || loading}
                    >
                        <IoReload />
                    </QuickActionButton>
                    <QuickActionButton
                        name={undefined}
                        onClick={handleConnectorStatusChange}
                        title={connector?.isActive ? 'Disable Connector' : 'Enable Connector'}
                        disabled={loading}
                    >
                        {connector?.isActive ? <IoEyeOff /> : <IoEye />}
                    </QuickActionButton>
                    <QuickActionButton
                        name={undefined}
                        title="Edit Connector"
                        onClick={showEditConnectorModal}
                        disabled={loading}
                    >
                        <FiEdit2 />
                    </QuickActionButton>
                    <QuickActionConfirmButton
                        name={undefined}
                        title="Delete Connector"
                        onConfirm={handleDeleteButtonClick}
                        disabled={loading}
                        message="Are you sure you want to delete this connector?"
                    >
                        <IoTrash />
                    </QuickActionConfirmButton>
                </>
            )}
            spacing="loose"
            borderBelowHeader
        >
            {loading && <PendingMessage />}
            <ListView
                className={styles.list}
                data={connector?.sources}
                keySelector={sourceKeySelector}
                rendererParams={sourceRendererParams}
                renderer={ConnectorSource}
                filtered={false}
                errored={false}
                pending={false}
            />
            {editConnectorModalShown && (
                <EditConnectorModal
                    projectId={projectId}
                    connectorId={connectorId}
                    onCloseClick={hideEditConnectorModal}
                    onUpdateSuccess={handleConnectorUpdateSuccess}
                />
            )}
        </ContainerCard>
    );
}

export default ConnectorDetail;
