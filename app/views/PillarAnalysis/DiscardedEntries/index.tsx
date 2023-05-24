import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    Kraken,
    MultiSelectInput,
    Pager,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import { isFiltered } from '#utils/common';

import {
    DiscardedEntriesQuery,
    DiscardedEntriesQueryVariables,
} from '#generated/types';

import DiscardedEntryItem, { Props as DiscardedEntryProps } from './DiscardedEntry';
import { DiscardedTags } from '../index';
import styles from './styles.css';

const DISCARDED_ENTRIES = gql`
    query DiscardedEntries (
        $projectId: ID!,
        $pillarId: ID!,
        $page: Int,
        $pageSize: Int,
    ) {
        project(id: $projectId) {
            id
            analysisPillar(id: $pillarId) {
                id
                discardedEntries (
                    page: $page,
                    pageSize: $pageSize,
                ) {
                    page
                    pageSize
                    results {
                        id
                        tag
                        tagDisplay
                        entry {
                            id
                            excerpt
                            droppedExcerpt
                            entryType
                            image {
                                id
                                title
                                file {
                                    name
                                    url
                                }
                            }
                            createdAt
                            createdBy {
                                id
                                displayName
                            }
                        }
                    }
                    totalCount
                }
            }
        }
    }
`;

const keySelector = (d: DiscardedTags) => d.name;
const labelSelector = (d: DiscardedTags) => d.description ?? '';

type DiscardedEntryType = NonNullable<NonNullable<NonNullable<NonNullable<NonNullable<DiscardedEntriesQuery['project']>['analysisPillar']>['discardedEntries']>['results']>[number]>;
const maxItemsPerPage = 5;
const entryKeySelector = (d: DiscardedEntryType) => d.entry.id;

interface Props {
    className?: string;
    projectId: string;
    pillarId: string;
    discardedTags?: DiscardedTags[];
    onUndiscardSuccess: () => void;
}

function DiscardedEntries(props: Props) {
    const {
        className,
        pillarId,
        projectId,
        discardedTags,
        onUndiscardSuccess,
    } = props;

    const [activePage, setActivePage] = useState(1);
    const [selectedDiscardedTag, setSelectedDiscardedTag] = useState<string[] | undefined>();

    const discardedEntriesVariables = useMemo(() => ({
        projectId,
        pillarId,
        page: activePage,
        pageSize: maxItemsPerPage,
    }), [
        pillarId,
        projectId,
        activePage,
    ]);

    const {
        data: discardedEntriesResponse,
        loading: discardedEntriesPending,
        refetch: refetchDiscardedEntries,
    } = useQuery<DiscardedEntriesQuery, DiscardedEntriesQueryVariables>(
        DISCARDED_ENTRIES,
        {
            variables: discardedEntriesVariables,
        },
    );

    const discardedEntries = discardedEntriesResponse?.project
        ?.analysisPillar?.discardedEntries?.results;
    const entriesCount = discardedEntriesResponse?.project
        ?.analysisPillar?.discardedEntries?.totalCount ?? 0;

    const handleEntryUndiscard = useCallback(() => {
        refetchDiscardedEntries();
        onUndiscardSuccess();
    }, [refetchDiscardedEntries, onUndiscardSuccess]);

    const entryCardRendererParams = useCallback(
        (_: string, data: DiscardedEntryType): DiscardedEntryProps => ({
            projectId,
            discardedEntryId: data.id,
            tagDisplay: data.tagDisplay,
            excerpt: data.entry.excerpt,
            image: data.entry.image?.file ? ({
                id: data.entry.image.id,
                title: data.entry.image.title ?? '',
                file: {
                    url: data.entry.image.file.url,
                },
            }) : undefined,
            entryType: data.entry.entryType,
            onEntryUndiscard: handleEntryUndiscard,
        }),
        [
            handleEntryUndiscard,
            projectId,
        ],
    );

    const handleDiscardedTagFilterChange = useCallback((newValue: string[]) => {
        setActivePage(0);
        setSelectedDiscardedTag(newValue);
    }, []);

    return (
        <div className={_cs(className, styles.discardedEntries)}>
            <div className={styles.filter}>
                <MultiSelectInput
                    name="discardedType"
                    // FIXME: Use string
                    label="Discarded Type"
                    options={discardedTags}
                    value={selectedDiscardedTag}
                    onChange={handleDiscardedTagFilterChange}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                />
            </div>
            <ListView
                className={styles.list}
                data={discardedEntries}
                keySelector={entryKeySelector}
                renderer={DiscardedEntryItem}
                rendererParams={entryCardRendererParams}
                pending={discardedEntriesPending}
                emptyIcon={(
                    <Kraken
                        variant="experiment"
                    />
                )}
                emptyMessage="There aren't any discarded entries."
                filteredEmptyMessage="There aren't any discarded entries under selected tag."
                filtered={isFiltered(selectedDiscardedTag)}
                errored={false}
                filteredEmptyIcon={(
                    <Kraken
                        variant="search"
                    />
                )}
                messageIconShown
                messageShown
            />
            <Pager
                className={styles.footer}
                activePage={activePage}
                itemsCount={entriesCount}
                maxItemsPerPage={maxItemsPerPage}
                onActivePageChange={setActivePage}
                itemsPerPageControlHidden
            />
        </div>
    );
}

export default DiscardedEntries;
