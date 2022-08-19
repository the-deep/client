import React, { useState, useMemo } from 'react';
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
    query OrganizationOptions($search: String) {
        organizations(search: $search) {
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
type NewOrganizationSelectInputProps<K extends string> = SearchSelectInputProps<
    string,
    K,
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

function organizationTitleWithStatusSelector(org: BasicOrganization) {
    const title = org.mergedAs ? org.mergedAs.title : org.title;

    return (
        <div className={styles.organization}>
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
    );
}

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
            labelSelector={organizationTitleSelector}
            optionLabelSelector={organizationTitleWithStatusSelector}
            onSearchValueChange={setSearchText}
            searchOptions={data?.organizations?.results}
            optionsPending={loading}
            totalOptionsCount={data?.organizations?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
        />
    );
}

export default NewOrganizationSelectInput;
