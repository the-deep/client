import React, { useMemo, useCallback, useState } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    Container,
    ListView,
    Pager,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    removeNull,
} from '@togglecorp/toggle-form';

import { PartialEntryType as EntryInputType } from '#views/Project/EntryEdit/schema';

import {
    Framework,
    Entry,
} from '../types';
import EditableEntry from '../../components/EditableEntry';
import {
    LeadEntriesQuery,
    LeadEntriesQueryVariables,
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
    query LeadEntries(
        $projectId: ID!,
        $leadId: ID!,
        $page: Int,
        $pageSize: Int,
        ) {
        project(id: $projectId) {
            entries(
                leads: [$leadId],
                page: $page,
                pageSize: $pageSize,
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
}

function EntryList(props: Props) {
    const {
        leadId,
        projectId,
        className,
    } = props;

    const [activePage, setActivePage] = useState(1);
    const variables = useMemo(
        (): LeadEntriesQueryVariables | undefined => (
            (projectId) ? {
                projectId,
                leadId,
                page: activePage,
                pageSize: maxItemsPerPage,
            } : undefined
        ),
        [leadId, projectId, activePage],
    );

    const {
        data: leadEntriesResponse,
        loading: entryListPending,
        refetch: getEntries,
    } = useQuery<LeadEntriesQuery, LeadEntriesQueryVariables>(
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
        getEntries,
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
