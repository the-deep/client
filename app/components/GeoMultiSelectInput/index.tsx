import React, { useState, useMemo, useCallback } from 'react';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import { breadcrumb } from '#utils/common';
import {
    GeoAreaOptionsQuery,
    GeoAreaOptionsQueryVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';

const GEOAREAS = gql`
    query GeoAreaOptions(
        $projectId: ID!,
        $search: String,
        $page: Int,
        $pageSize: Int,
    ) {
        project(id: $projectId) {
            id
            geoAreas(
                search: $search,
                page: $page,
                pageSize: $pageSize,
            ) {
                page
                results {
                    adminLevelTitle
                    id
                    regionTitle
                    title
                }
                totalCount
            }
        }
    }
`;

export type GeoArea = NonNullable<NonNullable<NonNullable<NonNullable<GeoAreaOptionsQuery['project']>>['geoAreas']>['results']>[number];

export const keySelector = (d: GeoArea) => d.id;
export const labelSelector = (d: GeoArea) => breadcrumb([d.adminLevelTitle, d.title]);
type Def = { containerClassName?: string };
type GeoSelectInputProps<K extends string> = SearchMultiSelectInputProps<
    string,
    K,
    GeoArea,
    Def,
    'onSearchValueChange'
    | 'searchOptions'
    | 'optionsPending'
    | 'keySelector'
    | 'labelSelector'
    | 'totalOptionsCount'
    | 'onShowDropdownChange'
> & {
    projectId: string;
};

function GeoMultiSelectInput<K extends string>(props: GeoSelectInputProps<K>) {
    const {
        className,
        projectId,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        projectId,
        search: debouncedSearchText,
        page: 1,
        pageSize: 10,
    }), [debouncedSearchText, projectId]);

    const {
        data,
        loading,
        fetchMore,
    } = useQuery<GeoAreaOptionsQuery, GeoAreaOptionsQueryVariables>(
        GEOAREAS,
        {
            variables,
            skip: !opened,
        },
    );

    const handleShowMoreClick = useCallback(() => {
        fetchMore({
            variables: {
                ...variables,
                page: (data?.project?.geoAreas?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.project) {
                    return previousResult;
                }

                const oldGeoAreas = previousResult.project.geoAreas;
                const newGeoAreas = fetchMoreResult?.project?.geoAreas;

                if (!newGeoAreas) {
                    return previousResult;
                }

                return ({
                    ...previousResult,
                    project: {
                        ...previousResult.project,
                        geoAreas: {
                            ...newGeoAreas,
                            results: [
                                ...(oldGeoAreas?.results ?? []),
                                ...(newGeoAreas.results ?? []),
                            ],
                        },
                    },
                });
            },
        });
    }, [
        fetchMore,
        variables,
        data?.project?.geoAreas?.page,
    ]);

    return (
        <SearchMultiSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={data?.project?.geoAreas?.results}
            optionsPending={loading}
            totalOptionsCount={data?.project?.geoAreas?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
            handleShowMoreClick={handleShowMoreClick}
        />
    );
}

export default GeoMultiSelectInput;
