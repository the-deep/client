import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    Container,
    ListView,
    TextOutput,
    TextInput,
    RawButton,
    Message,
    Button,
    useModalState,
    Kraken,
} from '@the-deep/deep-ui';
import {
    IoSearch,
    IoAdd,
    IoChevronForward,
} from 'react-icons/io5';

import {
    ProjectConnectorsQuery,
    ProjectConnectorsQueryVariables,
} from '#generated/types';

import ConnectorDetail from './ConnectorDetail';
import EditConnectorModal from './EditConnectorModal';

import styles from './styles.css';

interface ConnectorMini {
    id: string;
    title: string;
    createdAt: string;
}

const connectorKeySelector = (d: ConnectorMini) => d.id;

interface ConnectorItemProps {
    itemKey: string;
    title: string;
    createdAt: string;
    onClick: (key: string) => void;
    selected: boolean;
}

function ConnectorItem(props: ConnectorItemProps) {
    const {
        itemKey,
        title,
        createdAt,
        onClick,
        selected,
    } = props;

    return (
        <RawButton
            name={itemKey}
            className={_cs(
                styles.item,
                selected && styles.selected,
            )}
            onClick={onClick}
        >
            <div className={styles.title}>
                {title}
            </div>
            <TextOutput
                className={styles.createdOn}
                label="Created On"
                value={createdAt}
                valueType="date"
            />
        </RawButton>
    );
}

const PROJECT_CONNECTORS = gql`
    query ProjectConnectors(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $search: String,
    ) {
        project(
            id: $projectId,
        ) {
            id
            unifiedConnector {
                unifiedConnectors(
                    page: $page,
                    search: $search,
                    pageSize: $pageSize,
                ) {
                    totalCount
                    results {
                        id
                        title
                        createdAt
                    }
                }
            }
        }
    }
`;

const PAGE_SIZE = 10;

interface Props {
    className?: string;
    projectId: string;
}

function Connector(props: Props) {
    const {
        className,
        projectId,
    } = props;

    const [
        selectedConnector,
        setSelectedConnector,
    ] = useState<string | undefined>();

    const [searchText, setSearchText] = useState<string | undefined>();

    const connectorsRendererParams = useCallback((key: string, data: ConnectorMini) => ({
        itemKey: key,
        title: data.title,
        createdAt: data.createdAt,
        onClick: setSelectedConnector,
        selected: key === selectedConnector,
    }), [selectedConnector]);

    const {
        loading: connectorsGetPending,
        error,
        data,
        fetchMore,
        refetch,
    } = useQuery<ProjectConnectorsQuery, ProjectConnectorsQueryVariables>(
        PROJECT_CONNECTORS,
        {
            variables: {
                projectId,
                pageSize: PAGE_SIZE,
                page: 1,
                search: searchText,
            },
            onCompleted: (response) => {
                const unifiedConnectors = response?.project?.unifiedConnector?.unifiedConnectors;
                if (!selectedConnector) {
                    setSelectedConnector(unifiedConnectors?.results?.[0]?.id);
                }
            },
        },
    );

    const connectors = data?.project?.unifiedConnector?.unifiedConnectors;
    const connectorsCount = connectors?.totalCount ?? 0;
    const connectorList = connectors?.results;

    const handleShowMoreButtonClick = useCallback(() => {
        fetchMore({
            variables: {
                projectId,
                pageSize: PAGE_SIZE,
                page: (connectorList?.length ?? 0) / PAGE_SIZE + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.project) {
                    return previousResult;
                }
                const oldConnectors = previousResult.project.unifiedConnector?.unifiedConnectors;
                const newConnectors = fetchMoreResult?.project?.unifiedConnector?.unifiedConnectors;

                if (!newConnectors) {
                    return previousResult;
                }
                return ({
                    ...previousResult,
                    project: {
                        ...previousResult.project,
                        unifiedConnector: {
                            ...previousResult.project.unifiedConnector,
                            unifiedConnectors: {
                                ...newConnectors,
                                results: [
                                    ...(oldConnectors?.results ?? []),
                                    ...(newConnectors.results ?? []),
                                ],
                            },
                        },
                    },
                });
            },
        });
    }, [
        projectId,
        fetchMore,
        connectorList,
    ]);

    const [
        addConnectorModalShown,
        showAddConnectorModal,
        hideAddConnectorModal,
    ] = useModalState(false);

    const handleConnectorAddSuccess = useCallback((newConnectorId: string) => {
        refetch();
        hideAddConnectorModal();
        setSelectedConnector(newConnectorId);
    }, [
        hideAddConnectorModal,
        refetch,
    ]);

    const handleConnectorDeleteSuccess = useCallback(() => {
        setSelectedConnector(undefined);
        refetch();
    }, [
        refetch,
    ]);

    return (
        <div className={_cs(className, styles.connector)}>
            <Container
                className={styles.leftContainer}
                contentClassName={styles.content}
                headingSize="small"
                heading="Connectors"
                headerDescription={(
                    <TextInput
                        name={undefined}
                        value={searchText}
                        onChange={setSearchText}
                        label="Search"
                        icons={<IoSearch />}
                    />
                )}
            >
                <ListView
                    className={styles.connectorList}
                    pending={connectorsGetPending}
                    errored={!!error}
                    filtered={(searchText?.length ?? 0) > 0}
                    data={connectorList}
                    keySelector={connectorKeySelector}
                    renderer={ConnectorItem}
                    rendererParams={connectorsRendererParams}
                    emptyMessage="There are no connectors added to this project."
                    messageShown
                    messageIconShown
                />
                {(connectorsCount > 0 && ((connectorList?.length ?? 0) < connectorsCount)) && (
                    <Button
                        className={styles.showMoreButton}
                        variant="action"
                        name={undefined}
                        onClick={handleShowMoreButtonClick}
                        disabled={connectorsGetPending}
                        actions={(
                            <IoChevronForward />
                        )}
                    >
                        Show More
                    </Button>
                )}
            </Container>
            <Container
                className={styles.mainContainer}
                headerActions={(
                    <Button
                        name={undefined}
                        title="Add Connector"
                        icons={(<IoAdd />)}
                        onClick={showAddConnectorModal}
                        variant="tertiary"
                    >
                        Add Connector
                    </Button>
                )}
                contentClassName={styles.mainContainerContent}
            >
                {selectedConnector ? (
                    <ConnectorDetail
                        className={styles.selectedConnectorDetails}
                        projectId={projectId}
                        connectorId={selectedConnector}
                        onConnectorDeleteSuccess={handleConnectorDeleteSuccess}
                    />
                ) : (
                    <div className={styles.noConnectorSelected}>
                        <Message
                            icon={
                                <Kraken variant="sleep" />
                            }
                            message="No connector selected."
                        />
                    </div>
                )}
            </Container>
            {addConnectorModalShown && (
                <EditConnectorModal
                    projectId={projectId}
                    connectorId={undefined}
                    onCloseClick={hideAddConnectorModal}
                    onCreateSuccess={handleConnectorAddSuccess}
                />
            )}
        </div>
    );
}

export default Connector;
