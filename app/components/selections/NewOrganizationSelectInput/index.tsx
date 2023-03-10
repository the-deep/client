import React, { useState, useMemo, useCallback } from 'react';
import Highlighter from 'react-highlight-words';
import {
    SearchSelectInput,
    SearchSelectInputProps,
    Tag,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    OrganizationOptionsQuery,
    OrganizationOptionsQueryVariables,
} from '#generated/types';
import { ORGANIZATION_FRAGMENT } from '#gqlFragments';

import useDebouncedValue from '#hooks/useDebouncedValue';

import styles from './styles.css';

const ORGANIZATIONS = gql`
    ${ORGANIZATION_FRAGMENT}
    query OrganizationOptions(
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
            pageSize
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
    shortName?: string;
    mergedAs?: {
        id: string;
        title: string;
        shortName?: string;
    } | null | undefined;
};

type Def = { containerClassName?: string };
type NewOrganizationSelectInputProps<K extends string, GK extends string> = SearchSelectInputProps<
    string,
    K,
    GK,
    BasicOrganization,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;

const keySelector = (d: BasicOrganization) => d.id;
export function organizationTitleSelector(org: BasicOrganization) {
    if (org.mergedAs) {
        return org.mergedAs.title;
    }
    return org.title;
}

function NewOrganizationSelectInput<K extends string, GK extends string>(
    props: NewOrganizationSelectInputProps<K, GK>,
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
    } = useQuery<OrganizationOptionsQuery, OrganizationOptionsQueryVariables>(
        ORGANIZATIONS,
        {
            variables,
            skip: !opened,
        },
    );

    const searchTerms = useMemo(() => ([
        debouncedSearchText,
    ]), [debouncedSearchText]);

    const organizationTitleWithStatusSelector = useCallback((org: BasicOrganization) => {
        const title = org.mergedAs ? org.mergedAs.title : org.title;
        const shortName = org.mergedAs ? org.mergedAs.shortName : org.shortName;

        return (
            <div className={styles.organization}>
                <div className={styles.title}>
                    <Highlighter
                        searchWords={searchTerms}
                        autoEscape
                        textToHighlight={title}
                    />
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
                    {shortName && (
                        <Highlighter
                            searchWords={searchTerms}
                            autoEscape
                            textToHighlight={shortName}
                        />
                    )}
                </div>
            </div>
        );
    }, [searchTerms]);

    const handleShowMoreClick = useCallback(() => {
        fetchMore({
            variables: {
                ...variables,
                page: (data?.organizations?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.organizations) {
                    return previousResult;
                }

                const oldOrganizations = previousResult.organizations;
                const newOrganizations = fetchMoreResult?.organizations;

                if (!newOrganizations) {
                    return previousResult;
                }

                return ({
                    ...previousResult,
                    organizations: {
                        ...previousResult.organizations,
                        results: [
                            ...(oldOrganizations.results ?? []),
                            ...(newOrganizations.results ?? []),
                        ],
                    },
                });
            },
        });
    }, [
        data?.organizations?.page,
        fetchMore,
        variables,
    ]);

    return (
        <SearchSelectInput
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

export default NewOrganizationSelectInput;
