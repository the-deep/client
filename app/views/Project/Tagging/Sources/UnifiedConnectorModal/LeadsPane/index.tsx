import React, { useMemo, useState, useCallback } from 'react';
import {
    ListView,
    RawButton,
    TextOutput,
} from '@the-deep/deep-ui';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    gql,
    useQuery,
} from '@apollo/client';

import {
    ProjectConnectorDetailsQuery,
    ProjectConnectorDetailsQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const CONNECTOR_SOURCE_LEADS = gql`
    query ConnectorSourceLeads(
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            id
            unifiedConnector {
                connectorSourceLeads {
                    totalCount
                    results {
                        id
                        url
                        title
                        sourceRaw
                        publishedOn
                        extractionStatus
                        authorRaw
                        authors {
                            id
                            mergedAs {
                                id
                                title
                            }
                            title
                        }
                        source {
                            id
                            title
                            mergedAs {
                                id
                                title
                            }
                        }
                    }
                }
            }
        }
    }
`;


type ConnectorSourceMini = NonNullable<NonNullable<NonNullable<NonNullable<ProjectConnectorDetailsQuery['project']>['unifiedConnector']>['unifiedConnector']>['sources']>[number];

const connectorSourceKeySelector = (d: ConnectorSourceMini) => d.id;

interface ConnectorSourceItemProps {
    itemKey: string;
    title: string;
    onClick: (key: string) => void;
    selected: boolean;
    projectId: string;
}

function ConnectorSourceItem(props: ConnectorSourceItemProps) {
    const {
        itemKey,
        title,
        onClick,
        selected,
        projectId,
    } = props;

    const [selectedConnectorLead, setSelectedConnectorLead] = useState<string | undefined>();

    const variables = useMemo(
        (): ConnectorSourceLeadsQueryVariables => ({
            projectId,
        }),
        [projectId],
    );

    const {
        loading,
        data,
        error,
    } = useQuery<ConnectorSourceLeadsQuery, ConnectorSourceLeadsQueryVariables>(
        CONNECTOR_SOURCE_LEADS,
        {
            skip: !selected,
            variables,
            onCompleted: (response) => {
                const connectorLeads = response?.project?.unifiedConnector
                    ?.connectorSourceLeads?.results;
                if (connectorLeads && connectorLeads.length > 0) {
                    setSelectedConnectorLead((oldSelection) => {
                        const connectorLead = connectorLeads.find(
                            (item) => item.id === oldSelection,
                        );
                        return connectorLead ? oldSelection : connectorLeads[0].id;
                    });
                } else {
                    setSelectedConnectorLead(undefined);
                }
            },
        },
    );

    return (
        <>
            <RawButton
                name={itemKey}
                className={_cs(
                    selected && styles.selected,
                )}
                onClick={onClick}
            >
                {title}
            </RawButton>
            {selected && (
                <div>
                    Content goes here
                </div>
            )}
        </>
    );
}

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
                    }
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

function LeadsPane(props: Props) {
    const {
        className,
        connectorId,
        projectId,
    } = props;

    const [selectedConnectorSource, setSelectedConnectorSource] = useState<string | undefined>();

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
        data: connectorDetailsData,
        error,
    } = useQuery<ProjectConnectorDetailsQuery, ProjectConnectorDetailsQueryVariables>(
        PROJECT_CONNECTOR_DETAILS,
        {
            variables,
            onCompleted: (response) => {
                const sources = response?.project?.unifiedConnector?.unifiedConnector?.sources;
                if (sources && sources.length > 0) {
                    setSelectedConnectorSource((oldSelection) => {
                        const source = sources.find((item) => item.id === oldSelection);
                        return source ? oldSelection : sources[0].id;
                    });
                } else {
                    setSelectedConnectorSource(undefined);
                }
            },
        },
    );

    const connectorSourceRendererParams = useCallback((key: string, data: ConnectorSourceMini) => ({
        itemKey: key,
        title: data.title,
        onClick: setSelectedConnectorSource,
        selected: key === selectedConnectorSource,
        projectId,
    }), [selectedConnectorSource, projectId]);

    const connector = connectorDetailsData?.project?.unifiedConnector?.unifiedConnector;

    const loading = pendingConnectorDetails;

    return (
        <div className={className}>
            <div>
                Filters here
            </div>
            <ListView
                className={styles.connectorSources}
                pending={loading}
                errored={!!error}
                filtered={false}
                data={connector?.sources}
                keySelector={connectorSourceKeySelector}
                rendererParams={connectorSourceRendererParams}
                renderer={ConnectorSourceItem}
                messageShown
                messageIconShown
            />
        </div>
    );
}

export default LeadsPane;
