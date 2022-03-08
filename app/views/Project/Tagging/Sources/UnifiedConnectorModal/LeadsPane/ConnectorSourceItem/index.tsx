import React, { useMemo, useState, useCallback } from 'react';
import {
    ListView,
    Pager,
    Kraken,
    ControlledExpandableContainer,
} from '@the-deep/deep-ui';
import {
    analyzeErrors,
    ArrayError,
} from '@togglecorp/toggle-form';
import {
    gql,
    useQuery,
} from '@apollo/client';

import {
    ConnectorSourceLeadsQuery,
    ConnectorSourceLeadsQueryVariables,
    ConnectorLeadExtractionStatusEnum,
} from '#generated/types';

import { PartialLeadType } from '#views/Project/Tagging/Sources/BulkUploadModal/schema';

import ConnectorSourceLeadItem from './ConnectorSourceLeadItem';
import styles from './styles.css';

export type ConnectorSourceLead = NonNullable<NonNullable<NonNullable<NonNullable<ConnectorSourceLeadsQuery['project']>['unifiedConnector']>['connectorSourceLeads']>['results']>[number];

export const CONNECTOR_SOURCE_LEADS = gql`
    query ConnectorSourceLeads(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $sources: [ID!],
        $extractionStatus: [ConnectorLeadExtractionStatusEnum!],
        $blocked: Boolean,
    ) {
        project(id: $projectId) {
            id
            unifiedConnector {
                connectorSourceLeads(
                    sources: $sources,
                    page: $page,
                    pageSize: $pageSize,
                    extractionStatus: $extractionStatus,
                    blocked: $blocked,
                    alreadyAdded: false,
                ) {
                    totalCount
                    results {
                        id
                        source
                        blocked
                        alreadyAdded
                        connectorLead {
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
    }
`;

const MAX_ITEMS_PER_PAGE = 10;

const connectorLeadKeySelector = (d: ConnectorSourceLead) => d.id;

interface ConnectorSourceItemProps {
    connectorSourceId: string;
    title: string;
    onClick: (key: string | undefined) => void;
    selected: boolean;
    projectId: string;
    connectorSourceLead: ConnectorSourceLead | undefined;
    onConnectorSourceLeadChange: React.Dispatch<React.SetStateAction<
        ConnectorSourceLead | undefined
    >>;

    selections: {
        [key: string]: {
            connectorId: string,
            connectorSourceId: string,
            connectorSourceLeadId: string,
            connectorLeadId: string,
        } | undefined,
    }
    onSelectionChange: (
        connectorSourceId: string,
        connectorSourceLead: ConnectorSourceLead,
    ) => void;

    leadsByConnectorLeadMapping: Record<string, PartialLeadType> | undefined;
    leadsError: ArrayError<PartialLeadType[]> | undefined;

    extractionStatus: ConnectorLeadExtractionStatusEnum[] | undefined;
    blocked: boolean | undefined;
    disabled: boolean;
}

function ConnectorSourceItem(props: ConnectorSourceItemProps) {
    const {
        connectorSourceId,
        title,
        onClick,
        selected,
        projectId,
        connectorSourceLead,
        onConnectorSourceLeadChange,

        selections,
        onSelectionChange,

        leadsByConnectorLeadMapping,
        leadsError,

        extractionStatus,
        blocked,
        disabled,
    } = props;

    const [activePage, setActivePage] = useState(1);

    const variables = useMemo(
        (): ConnectorSourceLeadsQueryVariables => ({
            projectId,
            sources: [connectorSourceId],
            page: activePage,
            pageSize: MAX_ITEMS_PER_PAGE,
            extractionStatus,
            blocked,
        }),
        [projectId, connectorSourceId, activePage, extractionStatus, blocked],
    );

    const {
        loading,
        previousData,
        data = previousData,
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
                    onConnectorSourceLeadChange((oldSelection) => {
                        if (!oldSelection) {
                            return connectorLeads[0];
                        }

                        const prevConnectorLead = connectorLeads.find(
                            (item) => item.id === oldSelection.id,
                        );
                        return prevConnectorLead ? oldSelection : connectorLeads[0];
                    });
                } else {
                    onConnectorSourceLeadChange(undefined);
                }
            },
        },
    );

    const handleSelectionChange = useCallback(
        (value: ConnectorSourceLead) => {
            onSelectionChange(connectorSourceId, value);
        },
        [onSelectionChange, connectorSourceId],
    );

    const connectorLeadRendererParams = useCallback(
        (_: string, datum: ConnectorSourceLead) => {
            const leadItem = leadsByConnectorLeadMapping?.[datum.connectorLead.id];
            const leadError = leadItem
                ? leadsError?.[leadItem.clientId]
                : undefined;

            return {
                onClick: onConnectorSourceLeadChange,
                name: datum,
                selected: datum.id === connectorSourceLead?.id,

                checked: !!selections[datum.connectorLead.id],
                onCheckClicked: handleSelectionChange,

                title: leadItem
                    ? leadItem.title
                    : datum.connectorLead.title,
                publishedOn: leadItem
                    ? leadItem.publishedOn
                    : datum.connectorLead.publishedOn,

                faded: datum.blocked,

                // NOTE: only showing errored for leads that are checked
                errored: !!selections[datum.connectorLead.id] && analyzeErrors(leadError),

                disabled,
            };
        }, [
            leadsByConnectorLeadMapping,
            leadsError,
            connectorSourceLead,
            onConnectorSourceLeadChange,
            selections,
            handleSelectionChange,
            disabled,
        ],
    );

    const handleExpansionChange = useCallback(
        (value: boolean) => {
            onClick(value ? connectorSourceId : undefined);
        },
        [onClick, connectorSourceId],
    );

    return (
        <ControlledExpandableContainer
            name={connectorSourceId}
            heading={title}
            onExpansionChange={handleExpansionChange}
            expanded={selected}
            withoutBorder
        >
            <ListView
                className={styles.connectorLeadList}
                keySelector={connectorLeadKeySelector}
                data={data?.project?.unifiedConnector?.connectorSourceLeads?.results ?? undefined}
                renderer={ConnectorSourceLeadItem}
                rendererParams={connectorLeadRendererParams}
                rendererClassName={styles.connectorLeadItem}
                filtered={false}
                pending={loading}
                errored={!!error}
                emptyIcon={(
                    <Kraken
                        size="large"
                        variant="experiment"
                    />
                )}
                emptyMessage="No sources found."
                messageIconShown
                messageShown
            />
            <Pager
                activePage={activePage}
                itemsCount={data?.project?.unifiedConnector?.connectorSourceLeads?.totalCount ?? 0}
                onActivePageChange={setActivePage}
                maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                itemsPerPageControlHidden
            />
        </ControlledExpandableContainer>
    );
}

export default ConnectorSourceItem;
