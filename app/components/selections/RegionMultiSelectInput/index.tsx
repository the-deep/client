import React, { useState, useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    SearchMultiSelectInput,
    SearchMultiSelectInputProps,
} from '@the-deep/deep-ui';

import useDebouncedValue from '#hooks/useDebouncedValue';

import {
    RegionsQuery,
    RegionsQueryVariables,
} from '#generated/types';

const REGIONS = gql`
    query Regions (
        $public: Boolean,
        $search: String,
    ) {
        regions (
            public: $public,
            title: $search,
        ) {
            results {
                id
                title
            }
            totalCount
        }
    }
`;

export type BasicRegion = NonNullable<NonNullable<NonNullable<RegionsQuery['regions']>['results']>[number]>;

export const keySelector = (d: BasicRegion) => d.id;
export const labelSelector = (d: BasicRegion) => d.title;

type Def = { containerClassName?: string;}
type RegionMultiSelectInputProps<K extends string, GK extends string> = SearchMultiSelectInputProps<
    string,
    K,
    GK,
    BasicRegion,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    publicRegions: boolean;
};

function RegionSelectInput<K extends string, GK extends string>(
    props: RegionMultiSelectInputProps<K, GK>,
) {
    const {
        className,
        publicRegions,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        search: debouncedSearchText,
        public: publicRegions,
    }), [
        debouncedSearchText,
        publicRegions,
    ]);

    const {
        data,
        loading: regionsLoading,
    } = useQuery<RegionsQuery, RegionsQueryVariables>(
        REGIONS,
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
            searchOptions={data?.regions?.results}
            optionsPending={regionsLoading}
            totalOptionsCount={data?.regions?.totalCount ?? 0}
            onShowDropdownChange={setOpened}
        />
    );
}

export default RegionSelectInput;
