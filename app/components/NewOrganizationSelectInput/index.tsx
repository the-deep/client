import React, { useState, useMemo } from 'react';
import { SearchSelectInput, SearchSelectInputProps } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    OrganizationOptionsQuery,
    OrganizationOptionsQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

const ORGANIZATIONS = gql`
    query OrganizationOptions($search: String) {
        organizations(search: $search) {
            results {
                id
                title
                mergedAs {
                    id
                    title
                }
            }
            totalCount
        }
    }
`;

export type BasicOrganization = NonNullable<NonNullable<NonNullable<OrganizationOptionsQuery['organizations']>['results']>[number]>;

type Def = { containerClassName?: string };
type NewOrganizationSelectInputProps<K extends string> = SearchSelectInputProps<
    string,
    K,
    BasicOrganization,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;

const keySelector = (d: BasicOrganization) => d.id;
// FIXME: update this
const labelSelector = (d: BasicOrganization) => d.title;

function NewOrganizationSelectInput<K extends string>(props: NewOrganizationSelectInputProps<K>) {
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

    const { data, loading } = useQuery<OrganizationOptionsQuery, OrganizationOptionsQueryVariables>(
        ORGANIZATIONS,
        {
            variables,
            skip: !opened,
        },
    );

    return (
        <SearchSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={data?.organizations?.results}
            optionsPending={loading}
            totalOptionsCount={data?.organizations?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
        />
    );
}

export default NewOrganizationSelectInput;
