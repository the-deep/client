import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
    _cs,
    isNotDefined,
    listToMap,
    isDefined,
    unique,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    ListView,
    Pager,
    Container,
    Kraken,
} from '@the-deep/deep-ui';
import {
    Framework,
    Entry,
} from './types';

import {
    ProjectEntriesQuery,
    ProjectEntriesQueryVariables,
    ProjectFrameworkForCardsQuery,
    ProjectFrameworkForCardsQueryVariables,
} from '#generated/types';
import { GeoArea } from '#components/GeoMultiSelectInput';
import {
    CountMap,
    CommentCountContext,
    CommentCountContextInterface,
} from '#components/entryReview/EntryCommentWrapper/CommentContext';
import {
    isFiltered,
} from '#utils/common';

import {
    PartialFormType as PartialFilterFormType,
    FormType as FilterFormType,
} from '../SourcesFilter/schema';
import { getProjectSourcesQueryVariables } from '../SourcesFilter';

import EntryCard from './EntryCard';
import { transformSourcesFilterToEntriesFilter } from '../utils';
import styles from './styles.css';

const itemsPerPageOptions = [
    { label: '10 / page', key: 10 },
    { label: '25 / page', key: 25 },
    { label: '50 / page', key: 50 },
    { label: '100 / page', key: 100 },
];

const entryKeySelector = (entry: Entry) => entry.id;

export const PROJECT_ENTRIES = gql`
    query ProjectEntries(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $search: String,
        $leadTitle: String,
        $controlled: Boolean,
        $createdAtGte: DateTime,
        $createdAtLte: DateTime,
        $createdBy: [ID!],
        $entryTypes: [EntryTagTypeEnum!],
        $filterableData: [EntryFilterDataInputType!]
        $leadAssignees: [ID!],
        $leadCreatedBy: [ID!],
        $leadSourceOrganizations: [ID!],
        $leadAuthorOrganizations: [ID!],
        $leadConfidentialities: [LeadConfidentialityEnum!],
        $leadPriorities: [LeadPriorityEnum!],
        $leadPublishedOnGte: Date,
        $leadPublishedOnLte: Date,
        $leadStatuses: [LeadStatusEnum!],
        $leadAuthoringOrganizationTypes: [ID!],
        ) {
        project(id: $projectId) {
            id
            entries(
                page: $page,
                pageSize: $pageSize,
                search: $search,
                leadTitle: $leadTitle,
                controlled: $controlled,
                createdAtGte: $createdAtGte,
                createdAtLte: $createdAtLte,
                createdBy: $createdBy,
                entryTypes: $entryTypes,
                filterableData: $filterableData,
                leadAssignees: $leadAssignees,
                leadConfidentialities: $leadConfidentialities,
                leadPriorities: $leadPriorities,
                leadCreatedBy: $leadCreatedBy,
                leadPublishedOnGte: $leadPublishedOnGte,
                leadPublishedOnLte: $leadPublishedOnLte,
                leadStatuses: $leadStatuses,
                leadAuthoringOrganizationTypes: $leadAuthoringOrganizationTypes,
                leadSourceOrganizations: $leadSourceOrganizations,
                leadAuthorOrganizations: $leadAuthorOrganizations,
            ) {
                totalCount
                results {
                    clientId
                    id
                    entryType
                    droppedExcerpt
                    excerpt
                    reviewCommentsCount
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
                        url
                        attachment {
                            id
                            title
                            mimeType
                            file {
                                url
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

interface Props {
    className?: string;
    projectId: string;
    filters: PartialFilterFormType;
}

function EntriesGrid(props: Props) {
    const {
        className,
        projectId,
        filters: rawFilters,
    } = props;

    const [
        commentsCountMap,
        setCommentsCountMap,
    ] = useState<CountMap>({});

    const commentCountContext: CommentCountContextInterface = useMemo(() => ({
        commentsCountMap,
        setCommentsCountMap,
    }), [commentsCountMap]);

    const entriesFilter = useMemo(() => {
        const transformedFilters = getProjectSourcesQueryVariables(
            rawFilters as Omit<FilterFormType, 'projectId'>,
        );
        return transformSourcesFilterToEntriesFilter(transformedFilters);
    }, [rawFilters]);

    const [activePage, setActivePage] = useState(1);
    const [maxItemsPerPage, setMaxItemsPerPage] = useState(50);

    useEffect(() => {
        setActivePage(1);
    }, [rawFilters]);

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const variables = useMemo(
        (): ProjectEntriesQueryVariables | undefined => (
            (projectId) ? {
                projectId,
                page: activePage,
                pageSize: maxItemsPerPage,
                ...entriesFilter,
            } : undefined
        ),
        [projectId, activePage, entriesFilter, maxItemsPerPage],
    );

    const frameworkVariables = useMemo(
        (): ProjectFrameworkForCardsQueryVariables | undefined => (
            projectId ? ({ projectId }) : undefined
        ),
        [projectId],
    );

    const {
        previousData,
        data: projectEntriesResponse = previousData,
        loading,
        refetch: getEntries,
    } = useQuery<ProjectEntriesQuery, ProjectEntriesQueryVariables>(
        PROJECT_ENTRIES,
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

    // eslint-disable-next-line max-len
    const frameworkDetails = projectFrameworkResponse?.project?.analysisFramework as Framework | undefined | null;

    const entriesResponse = projectEntriesResponse?.project?.entries;

    const entries = entriesResponse?.results as Entry[] | undefined | null;

    const [expandedEntry, setExpandedEntry] = React.useState<string | undefined>();

    const handleHideTagsButtonClick = useCallback(() => {
        setExpandedEntry(undefined);
    }, []);

    const entryRendererParams = useCallback((key: string, entry: Entry) => ({
        entry,
        framework: frameworkDetails,
        tagsVisible: expandedEntry === key,
        leadDetails: entry.lead,
        projectId,
        onViewTagsButtonClick: setExpandedEntry,
        onHideTagsButtonClick: handleHideTagsButtonClick,
        className: _cs(styles.entry, expandedEntry === key && styles.expanded),
        controlled: entry.controlled,
        onEntryDataChange: getEntries,
        geoAreaOptions,
        onGeoAreaOptionsChange: setGeoAreaOptions,
    }), [
        geoAreaOptions,
        getEntries,
        frameworkDetails,
        expandedEntry,
        projectId,
        handleHideTagsButtonClick,
    ]);

    return (
        <Container
            className={_cs(styles.sourcesGrid, className)}
            spacing="compact"
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={entriesResponse?.totalCount ?? 0}
                    onActivePageChange={setActivePage}
                    maxItemsPerPage={maxItemsPerPage}
                    onItemsPerPageChange={setMaxItemsPerPage}
                    options={itemsPerPageOptions}
                />
            )}
        >
            <CommentCountContext.Provider value={commentCountContext}>
                <ListView
                    className={_cs(
                        styles.sourcesGrid,
                        className,
                        (entries?.length ?? 0) < 1 && styles.empty,
                    )}
                    data={entries ?? undefined}
                    renderer={EntryCard}
                    rendererParams={entryRendererParams}
                    keySelector={entryKeySelector}
                    pending={loading || projectFrameworkLoading}
                    filtered={isFiltered(entriesFilter)}
                    errored={false}
                    filteredEmptyMessage="No matching entries found."
                    filteredEmptyIcon={(
                        <Kraken
                            size="large"
                            variant="search"
                        />
                    )}
                    emptyIcon={(
                        <Kraken
                            size="large"
                            variant="work"
                        />
                    )}
                    emptyMessage="No entries found."
                    messageIconShown
                    messageShown
                />
            </CommentCountContext.Provider>
        </Container>
    );
}

export default EntriesGrid;
