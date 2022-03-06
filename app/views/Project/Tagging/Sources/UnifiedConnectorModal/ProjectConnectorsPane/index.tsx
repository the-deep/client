import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    ListView,
    TextOutput,
    RawButton,
    Button,
} from '@the-deep/deep-ui';
import {
    IoRefreshOutline,
} from 'react-icons/io5';

import {
    ProjectConnectorsQuery,
    ProjectConnectorsQueryVariables,
} from '#generated/types';

import styles from './styles.css';

type ConnectorMini = NonNullable<NonNullable<NonNullable<NonNullable<ProjectConnectorsQuery['project']>['unifiedConnector']>['unifiedConnectors']>['results']>[number];

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

interface Props {
    className?: string;
    projectId: string;
    selectedConnector: string | undefined;
    setSelectedConnector: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function Connector(props: Props) {
    const {
        className,
        projectId,
        selectedConnector,
        setSelectedConnector,
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
        refetch,
    } = useQuery<ProjectConnectorsQuery, ProjectConnectorsQueryVariables>(
        PROJECT_CONNECTORS,
        {
            variables: {
                projectId,
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

    return (
        <div className={_cs(className, styles.connector)}>
            <h2>
                Project Connectors
            </h2>
            <Button
                name={undefined}
                onClick={refetch}
                disabled={connectorsGetPending}
                variant="secondary"
            >
                <IoRefreshOutline />
            </Button>
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
        </div>
    );
}

export default Connector;
