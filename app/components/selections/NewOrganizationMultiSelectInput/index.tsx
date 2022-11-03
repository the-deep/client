import React, { useState, useMemo, useCallback } from 'react';
import {
    SearchMultiSelectInput,
    SearchMultiSelectInputProps,
    Tag,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    MultiOrganizationOptionsQuery,
    MultiOrganizationOptionsQueryVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { ORGANIZATION_FRAGMENT } from '#gqlFragments';

import styles from './styles.css';

const MULTI_ORGANIZATIONS = gql`
    ${ORGANIZATION_FRAGMENT}
    query MultiOrganizationOptions(
        $search: String,
        $page: Int,
        $usedInProject: ID,
        $pageSize: Int,
    ) {
        organizations(
            search: $search,
            page: $page,
            pageSize: $pageSize,
            usedInProject: $usedInProject,
        ) {
            page
            results {
                ...OrganizationGeneralResponse
            }
            totalCount
        }
    }
`;

export type BasicOrganization = {
    id: string;
    title: string;
    verified?: boolean;
    mergedAs?: {
        id: string;
        title: string;
    } | null | undefined;
};

type Def = { containerClassName?: string };
type OrganizationMultiSelectInputProps<K extends string> = SearchMultiSelectInputProps<
    string,
    K,
    BasicOrganization,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    usedInProject?: string;
};

export function keySelector(d: BasicOrganization) {
    return d.id;
}
export function organizationTitleSelector(org: BasicOrganization) {
    if (org.mergedAs) {
        return org.mergedAs.title;
    }
    return org.title;
}

function organizationTitleWithStatusSelector(org: BasicOrganization) {
    const title = org.mergedAs ? org.mergedAs.title : org.title;
    const shortName = org.mergedAs ? org.mergedAs.shortName : org.shortName;

    return (
        <div className={styles.organization}>
            <div className={styles.title}>
                {title}
                {org.verified && (
                    <Tag
                        spacing="compact"
                        variant="gradient1"
                    >
                        Verified
                    </Tag>
                )}
            </div>
            <div className={styles.abbreviation}>
                {shortName}
            </div>
        </div>
    );
}

function OrganizationSearchMultiSelectInput<K extends string>(
    props: OrganizationMultiSelectInputProps<K>,
) {
    const {
        className,
        usedInProject,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        search: debouncedSearchText,
        page: 1,
        pageSize: 10,
        usedInProject,
    }), [
        debouncedSearchText,
        usedInProject,
    ]);

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
            optionLabelSelector={organizationTitleWithStatusSelector}
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
