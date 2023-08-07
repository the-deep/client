import React, { useState, useMemo, useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import { breadcrumb } from '#utils/common';
import {
    GeoAreaOptionsQuery,
    GeoAreaOptionsQueryVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';

import styles from './styles.css';

const GEOAREAS = gql`
    query GeoAreaOptions(
        $projectId: ID!,
        $search: String,
        $page: Int,
        $pageSize: Int,
        $regionIds: [ID!],
    ) {
        project(id: $projectId) {
            id
            geoAreas(
                search: $search,
                page: $page,
                pageSize: $pageSize,
                regionIds: $regionIds,
            ) {
                page
                results {
                    adminLevelTitle
                    adminLevelLevel
                    id
                    regionTitle
                    title
                    parentTitles
                }
                totalCount
            }
        }
    }
`;

export type GeoArea = NonNullable<NonNullable<NonNullable<NonNullable<GeoAreaOptionsQuery['project']>>['geoAreas']>['results']>[number];

export const keySelector = (d: GeoArea) => d.id;
export const labelSelector = (geoArea: GeoArea) => {
    const title = [...(geoArea.parentTitles ?? []), geoArea.title];
    return breadcrumb(title);
};

type Def = { containerClassName?: string };
type GeoSelectInputProps<K extends string, GK extends string> = SearchMultiSelectInputProps<
    string,
    K,
    GK,
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
    regionId?: string | undefined;
};

function GeoMultiSelectInput<K extends string, GK extends string>(
    props: GeoSelectInputProps<K, GK>,
) {
    const {
        className,
        projectId,
        regionId,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo((): GeoAreaOptionsQueryVariables => ({
        projectId,
        regionIds: isDefined(regionId) ? [regionId] : undefined,
        search: debouncedSearchText,
        page: 1,
        pageSize: 10,
    }), [
        debouncedSearchText,
        projectId,
        regionId,
    ]);

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

    const geoAreaTitlesWithAdminLevels = useCallback((geoArea: GeoArea) => {
        const title = breadcrumb([...(geoArea.parentTitles ?? []), geoArea.title]);
        const label = geoArea.adminLevelTitle;

        return (
            <div className={styles.area}>
                <div className={styles.title}>
                    {title}
                </div>
                <div className={styles.label}>
                    {label}
                </div>
            </div>
        );
    }, []);

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
            optionLabelSelector={geoAreaTitlesWithAdminLevels}
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
