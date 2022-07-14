import React, { useMemo, useCallback, useState, createRef } from 'react';
import {
    _cs,
    isNotDefined,
    listToMap,
    isDefined,
    unique,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    Container,
    ListView,
    Kraken,
    Pager,
} from '@the-deep/deep-ui';
import {
    removeNull,
} from '@togglecorp/toggle-form';

import { PartialEntryType as EntryInputType } from '#views/Project/EntryEdit/schema';
import {
    CountMap,
    CommentCountContext,
    CommentCountContextInterface,
} from '#components/entryReview/EntryCommentWrapper/CommentContext';
import {
    EntriesByLeadQuery,
    EntriesByLeadQueryVariables,
    LeadEntriesQueryVariables,
    ProjectFrameworkForCardsQuery,
    ProjectFrameworkForCardsQueryVariables,
} from '#generated/types';
import { GeoArea } from '#components/GeoMultiSelectInput';

import {
    Framework,
    Entry,
} from './types';
import EditableEntry from '../../components/EditableEntry';

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
        $controlled: Boolean,
        $hasComment: Boolean,
        $createdAtGte: DateTime,
        $createdAtLte: DateTime,
        $createdBy: [ID!],
        $entryTypes: [EntryTagTypeEnum!],
        $filterableData: [EntryFilterDataType!]
        $search: String,
        ) {
        project(id: $projectId) {
            id
            entries(
                leads: [$leadId],
                page: $page,
                pageSize: $pageSize,
                controlled: $controlled,
                hasComment: $hasComment,
                createdAtGte: $createdAtGte,
                createdAtLte: $createdAtLte,
                createdBy: $createdBy,
                entryTypes: $entryTypes,
                filterableData: $filterableData,
                search: $search,
            ) {
                totalCount
                results {
                    clientId
                    id
                    entryType
                    reviewCommentsCount
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
                            profile {
                                id
                                displayName
                            }
                        }
                    }
                    attributes {
                        clientId
                        data
                        id
                        widget
                        widgetType
                        widgetVersion
                        geoSelectedOptions {
                            id
                            adminLevelTitle
                            regionTitle
                            title
                        }
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
        }
    }
`;

export const PROJECT_FRAMEWORK = gql`
    query ProjectFrameworkForCards(
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            id
            analysisFramework {
                primaryTagging {
                    widgets {
                        id
                        clientId
                        key
                        order
                        properties
                        conditional {
                            parentWidget
                            parentWidgetType
                            conditions
                        }
                        title
                        widgetId
                        width
                        version
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
                    conditional {
                        parentWidget
                        parentWidgetType
                        conditions
                    }
                    widgetId
                    width
                    version
                }
                id
            }
        }
    }
`;

const entryKeySelector = (e: Entry) => e.clientId ?? e.id;

interface Props {
    className?: string;
    leadId: string;
    projectId: string;
    filters: Omit<LeadEntriesQueryVariables, 'projectId' | 'leadId'>
    getProjectSources: () => void;
}

function EntryList(props: Props) {
    const {
        leadId,
        projectId,
        className,
        filters,
        getProjectSources,
    } = props;

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);
    const [maxItemsPerPage, setMaxItemsPerPage] = useState(10);

    const ref = createRef<HTMLDivElement>();

    const [
        commentsCountMap,
        setCommentsCountMap,
    ] = useState<CountMap>({});

    const commentCountContext: CommentCountContextInterface = useMemo(() => ({
        commentsCountMap,
        setCommentsCountMap,
    }), [commentsCountMap]);

    const [activePage, setActivePage] = useState(1);
    const variables = useMemo(
        (): EntriesByLeadQueryVariables | undefined => (
            (projectId) ? {
                projectId,
                leadId,
                page: activePage,
                pageSize: maxItemsPerPage,
                /*
                createdAtGte: convertDateToIsoDateTime(filters.createdAtGte),
                createdAtLte: convertDateToIsoDateTime(
                    filters?.createdAtLte,
                    { endOfDay: true },
                ),
                */
                ...filters,
            } : undefined
        ),
        [leadId, projectId, activePage, filters, maxItemsPerPage],
    );

    const {
        previousData,
        data: leadEntriesResponse = previousData,
        loading: entryListPending,
        refetch: getEntries,
    } = useQuery<EntriesByLeadQuery, EntriesByLeadQueryVariables>(
        LEAD_ENTRIES,
        {
            skip: isNotDefined(variables),
            variables,
            onCompleted: (response) => {
                const projectFromResponse = response?.project;
                if (!projectFromResponse) {
                    return;
                }
                setCommentsCountMap(
                    listToMap(
                        projectFromResponse.entries?.results ?? [],
                        (entry) => entry.id,
                        (entry) => entry.reviewCommentsCount,
                    ),
                );
                const geoData = projectFromResponse.entries?.results
                    ?.map((entry) => entry?.attributes)
                    .flat()
                    .map((attributes) => attributes?.geoSelectedOptions)
                    .flat()
                    .filter(isDefined) ?? [];
                const uniqueGeoData = unique(geoData, (d) => d.id);

                setGeoAreaOptions(uniqueGeoData);
            },
        },
    );

    const frameworkVariables = useMemo(
        (): ProjectFrameworkForCardsQueryVariables | undefined => (
            projectId ? ({ projectId }) : undefined
        ),
        [projectId],
    );

    const {
        data: projectFrameworkResponse,
        loading: projectFrameworkLoading,
    } = useQuery<ProjectFrameworkForCardsQuery, ProjectFrameworkForCardsQueryVariables>(
        PROJECT_FRAMEWORK,
        {
            skip: isNotDefined(frameworkVariables),
            variables: frameworkVariables,
        },
    );

    const handleSetActivePage = useCallback((page: number) => {
        setActivePage(page);
        ref.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, [ref]);

    const handleEntryDataChange = useCallback(() => {
        getProjectSources();
        getEntries();
    }, [getEntries, getProjectSources]);

    // eslint-disable-next-line max-len
    const frameworkDetails = projectFrameworkResponse?.project?.analysisFramework as Framework | undefined | null;

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
        onEntryDataChange: handleEntryDataChange,
        geoAreaOptions,
        onGeoAreaOptionsChange: setGeoAreaOptions,
        firstElementRef: data.id === entries?.[0].id ? ref : undefined,
        hideEntryId: true,
    }), [
        geoAreaOptions,
        leadId,
        projectId,
        frameworkDetails,
        handleEntryDataChange,
        entries,
        ref,
    ]);

    return (
        <Container
            className={_cs(className, styles.entryListContainer)}
            contentClassName={styles.content}
            spacing="none"
            footerClassName={styles.footer}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={entriesResponse?.totalCount ?? 0}
                    maxItemsPerPage={maxItemsPerPage}
                    onItemsPerPageChange={setMaxItemsPerPage}
                    onActivePageChange={handleSetActivePage}
                />
            )}
        >
            <CommentCountContext.Provider value={commentCountContext}>
                <ListView
                    className={styles.entryList}
                    keySelector={entryKeySelector}
                    renderer={EditableEntry}
                    data={entries ?? undefined}
                    rendererParams={entryDataRendererParams}
                    errored={false}
                    rendererClassName={styles.entryItem}
                    filtered={false}
                    pending={entryListPending || projectFrameworkLoading}
                    emptyIcon={(
                        <Kraken
                            variant="work"
                        />
                    )}
                    emptyMessage="Couldn't find any entries to show."
                    messageIconShown
                    messageShown
                />
            </CommentCountContext.Provider>
        </Container>
    );
}
export default EntryList;
