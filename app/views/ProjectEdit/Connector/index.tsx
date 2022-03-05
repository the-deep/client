import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    Container,
    ListView,
    TextOutput,
    RawButton,
    Message,
    Button,
    useModalState,
    Kraken,
} from '@the-deep/deep-ui';
import {
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
    ) {
        project(
            id: $projectId,
        ) {
            id
            unifiedConnector {
                unifiedConnectors(
                    page: $page,
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

    const [connectorList, setConnectorList] = useState<ConnectorMini[]>([]);
    const [connectorsCount, setConnectorsCount] = useState<number>(0);
    const [offset, setOffset] = useState<number>(0);

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
    } = useQuery<ProjectConnectorsQuery, ProjectConnectorsQueryVariables>(
        PROJECT_CONNECTORS,
        {
            variables: {
                projectId,
                pageSize: PAGE_SIZE,
                page: offset / PAGE_SIZE + 1,
            },
            onCompleted: (response) => {
                const unifiedConnectors = response?.project?.unifiedConnector?.unifiedConnectors;
                setConnectorsCount(unifiedConnectors?.totalCount ?? 0);
                if (!selectedConnector) {
                    setSelectedConnector(unifiedConnectors?.results?.[0].id);
                }

                setConnectorList((oldConnectors) => ([
                    ...oldConnectors,
                    ...(unifiedConnectors?.results ?? []),
                ]));
            },
        },
    );

    const handleShowMoreButtonClick = useCallback(() => {
        setOffset(connectorList.length);
    }, [connectorList.length]);

    const [
        addConnectorModalShown,
        showAddConnectorModal,
        hideAddConnectorModal,
    ] = useModalState(false);

    const handleConnectorAddSuccess = useCallback((newConnectorId: string) => {
        hideAddConnectorModal();
        setSelectedConnector(newConnectorId);
    }, [hideAddConnectorModal]);

    return (
        <div className={_cs(className, styles.connector)}>
            <Container
                className={styles.leftContainer}
                contentClassName={styles.content}
            >
                <ListView
                    className={styles.connectorList}
                    pending={connectorsGetPending}
                    errored={!!error}
                    filtered={false}
                    data={connectorList}
                    keySelector={connectorKeySelector}
                    renderer={ConnectorItem}
                    rendererParams={connectorsRendererParams}
                    messageShown
                    messageIconShown
                />
                {(connectorsCount > 0 && (connectorList.length < connectorsCount)) && (
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
                        {/* TODO: Might move to component library, no need to use ts */}
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
                        projectId={projectId}
                        connectorId={selectedConnector}
                        className={styles.selectedConnectorDetails}
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
