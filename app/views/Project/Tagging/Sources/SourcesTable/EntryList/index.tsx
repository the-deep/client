import React, { useMemo, useCallback, useState } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    Container,
    ListView,
    Pager,
} from '@the-deep/deep-ui';
import {
    removeNull,
} from '@togglecorp/toggle-form';

import { PartialEntryType as EntryInputType } from '#views/Project/EntryEdit/schema';

import {
    Framework,
    Entry,
} from './types';
import EditableEntry from '../../components/EditableEntry';
import {
    EntriesByLeadQuery,
    EntriesByLeadQueryVariables,
} from '#generated/types';

import styles from './styles.css';

function transformEntry(entry: Entry): EntryInputType {
    return removeNull({
        ...entry,
        lead: entry.lead.id,
        image: entry.image?.id,
        attributes: entry.attributes?.map((attribute) => ({
            ...attribute,
            // NOTE: we don't need this on form
            geoSelectedOptions: undefined,
        })),
    });
}

export const LEAD_ENTRIES = gql`
    query EntriesByLead(
        $projectId: ID!,
        $leadId: ID!,
        $page: Int,
        $pageSize: Int,
        $authoringOrganizationTypes: [ID!],
        $commentStatus: EntryFilterCommentStatusEnum,
        $controlled: Boolean,
        $createdAt_Gte: DateTime,
        $createdAt_Lt: DateTime,
        $createdBy: [ID!],
        $entryTypes: [EntryTagTypeEnum!],
        $filterableData: [EntryFilterDataType!]
        $leadAssignees: [ID!],
        $leadConfidentialities: [LeadConfidentialityEnum!],
        $leadPriorities: [LeadPriorityEnum!],
        $leadPublishedOn_Gte: Date,
        $leadPublishedOn_Lt: Date,
        $leadStatuses: [LeadStatusEnum!],
        ) {
        project(id: $projectId) {
            entries(
                leads: [$leadId],
                page: $page,
                pageSize: $pageSize,
                authoringOrganizationTypes: $authoringOrganizationTypes,
                commentStatus: $commentStatus,
                controlled: $controlled,
                createdAt_Gte: $createdAt_Gte,
                createdAt_Lt: $createdAt_Lt,
                createdBy: $createdBy,
                entryTypes: $entryTypes,
                filterableData: $filterableData,
                leadAssignees: $leadAssignees,
                leadConfidentialities: $leadConfidentialities,
                leadPriorities: $leadPriorities,
                leadPublishedOn_Gte: $leadPublishedOn_Gte,
                leadPublishedOn_Lt: $leadPublishedOn_Lt,
                leadStatuses: $leadStatuses,
            ) {
                totalCount
                results {
                    clientId
                    id
                    entryType
                    droppedExcerpt
                    excerpt
                    lead {
                        id
                        title
                        publishedOn
                        authors {
                            id
                            title
                        }
                        source {
                            id
                            title
                        }
                        createdAt
                        createdBy {
                            displayName
                        }
                    }
                    attributes {
                        clientId
                        data
                        id
                        widget
                        widgetType
                    }
                    image {
                        id
                        metadata
                        mimeType
                        title
                        file {
                            name
                            url
                        }
                    }
                    controlled
                    verifiedBy {
                        id
                    }
                }
            }
            analysisFramework {
                primaryTagging {
                    widgets {
                        id
                        clientId
                        key
                        order
                        properties
                        title
                        widgetId
                        width
                    }
                    clientId
                    id
                    order
                    title
                    tooltip
                }
                secondaryTagging {
                    clientId
                    id
                    key
                    order
                    title
                    properties
                    widgetId
                    width
                }
                id
            }
        }
    }
`;

const maxItemsPerPage = 5;
const entryKeySelector = (e: Entry) => e.clientId ?? e.id;

interface Props {
    className?: string;
    leadId: string;
    projectId: string;
    filters: Omit<LeadEntriesQueryVariables, 'projectId' | 'leadId'>
}

function EntryList(props: Props) {
    const {
        leadId,
        projectId,
        className,
        filters,
    } = props;

    const [activePage, setActivePage] = useState(1);
    const variables = useMemo(
        (): EntriesByLeadQueryVariables | undefined => (
            (projectId) ? {
                projectId,
                leadId,
                page: activePage,
                pageSize: maxItemsPerPage,
                ...filters,
            } : undefined
        ),
        [leadId, projectId, activePage, filters],
    );

    const {
        data: leadEntriesResponse,
        loading: entryListPending,
        refetch: getEntries,
    } = useQuery<EntriesByLeadQuery, EntriesByLeadQueryVariables>(
        LEAD_ENTRIES,
        {
            skip: isNotDefined(variables),
            variables,
        },
    );

    // eslint-disable-next-line max-len
    const frameworkDetails = leadEntriesResponse?.project?.analysisFramework as Framework | undefined | null;

    const entriesResponse = leadEntriesResponse?.project?.entries;
    const entries = entriesResponse?.results as Entry[] | undefined | null;

    const entryDataRendererParams = useCallback((_: string, data: Entry) => ({
        // FIXME: memoize this
        entry: transformEntry(data),
        leadId,
        projectId,
        entryId: data.id,
        primaryTagging: frameworkDetails?.primaryTagging,
        secondaryTagging: frameworkDetails?.secondaryTagging,
        controlled: data.controlled,
        verifiedBy: data.verifiedBy,
        entryImage: data.image,
        onEntryDataChange: getEntries,
    }), [
        getEntries,
        leadId,
        projectId,
        frameworkDetails,
    ]);

    return (
        <Container
            className={_cs(className, styles.entryListContainer)}
            contentClassName={styles.content}
            spacing="compact"
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={entriesResponse?.totalCount ?? 0}
                    maxItemsPerPage={maxItemsPerPage}
                    onActivePageChange={setActivePage}
                    itemsPerPageControlHidden
                    hideInfo
                />
            )}
        >
            <ListView
                className={styles.entryList}
                keySelector={entryKeySelector}
                renderer={EditableEntry}
                data={entries ?? undefined}
                rendererParams={entryDataRendererParams}
                rendererClassName={styles.entryItem}
                pending={entryListPending}
            />
        </Container>
    );
}
export default EntryList;
