import React, { useState, useMemo, useCallback } from 'react';

import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import useDebouncedValue from '#hooks/useDebouncedValue';

import {
    RegionListQuery,
    RegionListQueryVariables,
} from '#generated/types';

const REGION_LIST = gql`
    query RegionList(
        $excludeProject: [ID!],
        $search: String,
        $pageSize: Int,
        $page: Int,
        $public: Boolean,
    ) {
        regions(
            excludeProject: $excludeProject,
            search: $search,
            pageSize: $pageSize,
            page: $page,
            public: $public,
        ) {
            page
            results {
                id
                title
                isPublished
                public
            }
            totalCount
        }
    }
`;

export type Region = NonNullable<NonNullable<RegionListQuery['regions']>['results']>[number];

const keySelector = (d: Region) => +d.id;
const labelSelector = (d: Region) => d.title;

type Def = { containerClassName?: string;}
type RegionSelectInputProps<K extends string, GK extends string> = SearchSelectInputProps<
    number,
    K,
    GK,
    Region,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
    > & { projectId: string, pending?: boolean};

function RegionSelectInput<K extends string, GK extends string>(
    props: RegionSelectInputProps<K, GK>,
) {
    const {
        className,
        projectId,
        pending,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        excludeProject: [projectId],
        search: debouncedSearchText,
        public: true,
        page: 1,
        pageSize: 10,
    }), [
        projectId,
        debouncedSearchText,
    ]);

    const {
        data,
        loading,
        fetchMore,
    } = useQuery<RegionListQuery, RegionListQueryVariables>(
        REGION_LIST,
        {
            skip: !opened,
            variables,
        },
    );

    const handleShowMoreClick = useCallback(() => {
        fetchMore({
            variables: {
                ...variables,
                page: (data?.regions?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.regions) {
                    return previousResult;
                }

                const oldRegions = previousResult.regions;
                const newRegions = fetchMoreResult?.regions;

                if (!newRegions) {
                    return previousResult;
                }

                return ({
                    ...previousResult,
                    regions: {
                        ...newRegions,
                        results: [
                            ...(oldRegions.results ?? []),
                            ...(newRegions.results ?? []),
                        ],
                    },
                });
            },
        });
    }, [
        fetchMore,
        variables,
        data?.regions?.page,
    ]);

    return (
        <SearchSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={data?.regions?.results}
            optionsPending={loading || pending}
            totalOptionsCount={data?.regions?.totalCount ?? 0}
            onShowDropdownChange={setOpened}
            handleShowMoreClick={handleShowMoreClick}
        />
    );
}

export default RegionSelectInput;
