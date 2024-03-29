import React, { useMemo, useCallback } from 'react';
import {
    ListView,
    Pager,
    Kraken,
    TextOutput,
    DateOutput,
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
} from '#generated/types';

import { PartialLeadType } from '#components/general/BulkUploadModal/schema';

import ConnectorSourceLeadItem from './ConnectorSourceLeadItem';
import styles from './styles.css';

export type ConnectorSourceLead = NonNullable<NonNullable<NonNullable<NonNullable<ConnectorSourceLeadsQuery['project']>['unifiedConnector']>['connectorSourceLeads']>['results']>[number];

export const CONNECTOR_SOURCE_LEADS = gql`
    query ConnectorSourceLeads(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $sources: [ID!],
        $blocked: Boolean,
        $dateFrom: Date,
        $dateTo: Date,
        $search: String,
    ) {
        project(id: $projectId) {
            id
            unifiedConnector {
                connectorSourceLeads(
                    sources: $sources,
                    page: $page,
                    pageSize: $pageSize,
                    blocked: $blocked,
                    publishedOnGte: $dateFrom,
                    publishedOnLte: $dateTo,
                    search: $search,
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
    lastFetchedAt?: string;
    onClick: (key: string | undefined) => void;
    selected: boolean;
    projectId: string;
    connectorSourceLead: ConnectorSourceLead | undefined;
    onConnectorSourceLeadChange: React.Dispatch<React.SetStateAction<
        ConnectorSourceLead | undefined
    >>;

    activePage: number;
    setActivePage: React.Dispatch<React.SetStateAction<
        number
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

    blocked: boolean | undefined;
    disabled: boolean;
    dateFrom: string | undefined;
    dateTo: string | undefined;
    search: string | undefined;
}

function ConnectorSourceItem(props: ConnectorSourceItemProps) {
    const {
        connectorSourceId,
        title,
        onClick,
        selected,
        projectId,
        lastFetchedAt,
        connectorSourceLead,
        onConnectorSourceLeadChange,

        selections,
        onSelectionChange,

        leadsByConnectorLeadMapping,
        leadsError,

        blocked,
        disabled,

        activePage,
        setActivePage,

        dateFrom,
        dateTo,
        search,
    } = props;

    const variables = useMemo(
        (): ConnectorSourceLeadsQueryVariables => ({
            projectId,
            sources: [connectorSourceId],
            page: activePage,
            pageSize: MAX_ITEMS_PER_PAGE,
            blocked,
            dateFrom,
            dateTo,
            search,
        }),
        [
            projectId,
            connectorSourceId,
            activePage,
            blocked,
            dateFrom,
            dateTo,
            search,
        ],
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
            className={styles.connectorSourceItem}
            name={connectorSourceId}
            heading={title}
            inlineHeadingDescription
            headingDescription={lastFetchedAt && (
                <TextOutput
                    label="Last updated on"
                    value={(
                        <DateOutput
                            value={lastFetchedAt}
                        />
                    )}
                />
            )}
            onExpansionChange={handleExpansionChange}
            expanded={selected}
            contentClassName={styles.content}
            // NOTE: Currently footer is shown even when the container is collapsed
            footerActions={selected && (
                <Pager
                    className={styles.pager}
                    activePage={activePage}
                    itemsCount={
                        data?.project?.unifiedConnector?.connectorSourceLeads?.totalCount ?? 0
                    }
                    onActivePageChange={setActivePage}
                    maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                    itemsPerPageControlHidden
                />
            )}
            withoutBorder
        >
            <ListView
                className={styles.connectorLeadList}
                keySelector={connectorLeadKeySelector}
                data={data?.project?.unifiedConnector?.connectorSourceLeads?.results}
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
        </ControlledExpandableContainer>
    );
}

export default ConnectorSourceItem;
