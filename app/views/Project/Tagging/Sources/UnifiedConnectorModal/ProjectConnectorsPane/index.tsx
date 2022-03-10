import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    ListView,
    TextOutput,
    RawButton,
    Container,
    Button,
} from '@the-deep/deep-ui';
import {
    IoChevronForward,
} from 'react-icons/io5';

import {
    ProjectConnectorsListQuery,
    ProjectConnectorsListQueryVariables,
} from '#generated/types';

import styles from './styles.css';

type ConnectorMini = NonNullable<NonNullable<NonNullable<NonNullable<ProjectConnectorsListQuery['project']>['unifiedConnector']>['unifiedConnectors']>['results']>[number];

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

const PROJECT_CONNECTORS_LIST = gql`
    query ProjectConnectorsList(
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
                    isActive: true,
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
    selectedConnector: string | undefined;
    setSelectedConnector: React.Dispatch<React.SetStateAction<string | undefined>>;
    children?: React.ReactNode;
}

function Connector(props: Props) {
    const {
        className,
        projectId,
        selectedConnector,
        setSelectedConnector,

        children,
    } = props;

    const connectorsRendererParams = useCallback((key: string, data: ConnectorMini) => ({
        itemKey: key,
        title: data.title,
        createdAt: data.createdAt,
        onClick: setSelectedConnector,
        selected: key === selectedConnector,
    }), [selectedConnector, setSelectedConnector]);

    const {
        data,
        loading: connectorsGetPending,
        error,
        fetchMore,
    } = useQuery<ProjectConnectorsListQuery, ProjectConnectorsListQueryVariables>(
        PROJECT_CONNECTORS_LIST,
        {
            variables: {
                projectId,
                pageSize: PAGE_SIZE,
                page: 1,
            },
            onCompleted: (response) => {
                const unifiedConnectors = response?.project?.unifiedConnector
                    ?.unifiedConnectors?.results;
                const firstUnifiedConnector = unifiedConnectors?.[0];
                if (firstUnifiedConnector) {
                    setSelectedConnector(
                        (oldSelection) => oldSelection ?? firstUnifiedConnector.id,
                    );
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

    return (
        <Container
            className={_cs(className, styles.projectsConnectorPane)}
            heading="Project Connectors"
            headerClassName={styles.header}
            headingSize="small"
        >
            <ListView
                className={styles.connectorList}
                pending={connectorsGetPending}
                errored={!!error}
                filtered={false}
                data={data?.project?.unifiedConnector?.unifiedConnectors?.results}
                keySelector={connectorKeySelector}
                renderer={ConnectorItem}
                rendererParams={connectorsRendererParams}
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
            {children}
        </Container>
    );
}

export default Connector;
