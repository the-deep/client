import React, { useState, useMemo } from 'react';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    PublicOrganizationOptionsQuery,
    PublicOrganizationOptionsQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

const PUBLIC_ORGANIZATIONS = gql`
    query PublicOrganizationOptions($search: String) {
        publicOrganizations(search: $search) {
            results {
                id
                title
            }
            totalCount
        }
    }
`;

export type BasicOrganization = NonNullable<NonNullable<NonNullable<PublicOrganizationOptionsQuery['publicOrganizations']>['results']>[number]>;

type Def = { containerClassName?: string };
type PublicOrganizationMultiSelectInputProps<
    K extends string,
    GK extends string
> = SearchMultiSelectInputProps<
    string,
    K,
    GK,
    BasicOrganization,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;

const keySelector = (d: BasicOrganization) => d.id;
const labelSelector = (d: BasicOrganization) => d.title;

function PublicOrganizationMultiSelectInput<K extends string, GK extends string>(
    props: PublicOrganizationMultiSelectInputProps<K, GK>,
) {
    const {
        className,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        search: debouncedSearchText,
    }), [debouncedSearchText]);

    const { data, loading } = useQuery<
        PublicOrganizationOptionsQuery,
        PublicOrganizationOptionsQueryVariables
    >(
        PUBLIC_ORGANIZATIONS,
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
            searchOptions={data?.publicOrganizations?.results}
            optionsPending={loading}
            totalOptionsCount={data?.publicOrganizations?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
        />
    );
}

export default PublicOrganizationMultiSelectInput;
