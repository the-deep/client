import React, { useState, useMemo } from 'react';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    GeoAreaOptionsQuery,
    GeoAreaOptionsQueryVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';

const GEOAREAS = gql`
    query GeoAreaOptions(
        $projectId: ID!,
        $search: String,
    ) {
        project(id: $projectId) {
            geoAreas(search: $search) {
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

const keySelector = (d: GeoArea) => d.id;
const labelSelector = (d: GeoArea) => `${d.regionTitle}/${d.adminLevelTitle}/${d.title}`;
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
    }), [debouncedSearchText, projectId]);

    const { data, loading } = useQuery<GeoAreaOptionsQuery, GeoAreaOptionsQueryVariables>(
        GEOAREAS,
        {
            variables,
            skip: !opened,
        },
    );

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
        />
    );
}

export default GeoMultiSelectInput;
