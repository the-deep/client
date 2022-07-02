import React, { useState, useMemo, useCallback } from 'react';

import {
    SearchMultiSelectInput,
    SearchMultiSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    MultiOrganizationOptionsQuery,
    MultiOrganizationOptionsQueryVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';

const MULTI_ORGANIZATIONS = gql`
    query MultiOrganizationOptions(
        $search: String,
        $page: Int,
        $pageSize: Int,
    ) {
        organizations(
            search: $search,
            page: $page,
            pageSize: $pageSize,
        ) {
            page
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

export type BasicOrganization = NonNullable<NonNullable<NonNullable<MultiOrganizationOptionsQuery['organizations']>['results']>[number]>;

type Def = { containerClassName?: string };
type OrganizationMultiSelectInputProps<K extends string> = SearchMultiSelectInputProps<
    string,
    K,
    BasicOrganization,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;

export function keySelector(d: BasicOrganization) {
    return d.id;
}
export function organizationTitleSelector(org: BasicOrganization) {
    if (org.mergedAs) {
        return org.mergedAs.title;
    }
    return org.title;
}

function OrganizationSearchMultiSelectInput<K extends string>(
    props: OrganizationMultiSelectInputProps<K>,
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
        page: 1,
        pageSize: 10,
    }), [debouncedSearchText]);

    const {
        data,
        loading,
        fetchMore,
    } = useQuery<MultiOrganizationOptionsQuery, MultiOrganizationOptionsQueryVariables>(
        MULTI_ORGANIZATIONS,
        {
            variables,
            skip: !opened,
        },
    );

    const handleShowMoreClick = useCallback(() => {
        fetchMore({
            variables: {
                ...variables,
                page: (data?.organizations?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult) {
                    return previousResult;
                }

                const oldOrgs = previousResult.organizations;
                const newOrgs = fetchMoreResult?.organizations;

                if (!newOrgs) {
                    return previousResult;
                }

                return ({
                    ...previousResult,
                    organizations: {
                        ...newOrgs,
                        results: [
                            ...(oldOrgs?.results ?? []),
                            ...(newOrgs.results ?? []),
                        ],
                    },
                });
            },
        });
    }, [
        fetchMore,
        variables,
        data?.organizations?.page,
    ]);

    return (
        <SearchMultiSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={organizationTitleSelector}
            onSearchValueChange={setSearchText}
            searchOptions={data?.organizations?.results}
            optionsPending={loading}
            totalOptionsCount={data?.organizations?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
            handleShowMoreClick={handleShowMoreClick}
        />
    );
}

export default OrganizationSearchMultiSelectInput;
