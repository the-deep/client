import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
    isNotDefined,
    isDefined,
    unique,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    ListView,
    Pager,
    Container,
} from '@the-deep/deep-ui';
import {
    Framework,
    Entry,
} from './types';

import {
    ProjectEntriesQuery,
    ProjectEntriesQueryVariables,
} from '#generated/types';
import { GeoArea } from '#components/GeoMultiSelectInput';
import {
    PartialFormType as PartialFilterFormType,
    FormType as FilterFormType,
} from '../SourcesFilter/schema';
import { getProjectSourcesQueryVariables } from '../SourcesFilter';

import EntryCard from './EntryCard';
import { transformSourcesFilterToEntriesFilter } from '../utils';
import styles from './styles.css';

const maxItemsPerPage = 50;

const entryKeySelector = (entry: Entry) => entry.id;

export const PROJECT_ENTRIES = gql`
    query ProjectEntries(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $authoringOrganizationTypes: [ID!],
        $commentStatus: EntryFilterCommentStatusEnum,
        $controlled: Boolean,
        $createdAtGte: DateTime,
        $createdAtLte: DateTime,
        $createdBy: [ID!],
        $entryTypes: [EntryTagTypeEnum!],
        $filterableData: [EntryFilterDataType!]
        $leadAssignees: [ID!],
        $leadConfidentialities: [LeadConfidentialityEnum!],
        $leadPriorities: [LeadPriorityEnum!],
        $leadPublishedOnGte: Date,
        $leadPublishedOnLte: Date,
        $leadStatuses: [LeadStatusEnum!],
        ) {
        project(id: $projectId) {
            entries(
                page: $page,
                pageSize: $pageSize,
                authoringOrganizationTypes: $authoringOrganizationTypes,
                commentStatus: $commentStatus,
                controlled: $controlled,
                createdAtGte: $createdAtGte,
                createdAtLte: $createdAtLte,
                createdBy: $createdBy,
                entryTypes: $entryTypes,
                filterableData: $filterableData,
                leadAssignees: $leadAssignees,
                leadConfidentialities: $leadConfidentialities,
                leadPriorities: $leadPriorities,
                leadPublishedOnGte: $leadPublishedOnGte,
                leadPublishedOnLte: $leadPublishedOnLte,
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

interface Props {
    className?: string;
    projectId: string;
    filters: PartialFilterFormType;
}

function SourcesGrid(props: Props) {
    const {
        className,
        projectId,
        filters: rawFilters,
    } = props;

    const entriesFilter = useMemo(() => {
        const transformedFilters = getProjectSourcesQueryVariables(
            rawFilters as Omit<FilterFormType, 'projectId'>,
        );
        return transformSourcesFilterToEntriesFilter(transformedFilters);
    }, [rawFilters]);

    const [activePage, setActivePage] = useState(1);

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
        [projectId, activePage, entriesFilter],
    );

    const {
        data: projectEntriesResponse,
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

    // eslint-disable-next-line max-len
    const frameworkDetails = projectEntriesResponse?.project?.analysisFramework as Framework | undefined | null;

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
                    maxItemsPerPage={maxItemsPerPage}
                    onActivePageChange={setActivePage}
                    itemsPerPageControlHidden
                    hideInfo
                />
            )}
        >
            <ListView
                className={_cs(styles.sourcesGrid, className)}
                data={entries ?? undefined}
                renderer={EntryCard}
                rendererParams={entryRendererParams}
                keySelector={entryKeySelector}
                pending={loading}
            />
        </Container>
    );
}

export default SourcesGrid;
