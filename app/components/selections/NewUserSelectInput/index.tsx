import React, { useState, useMemo, useCallback } from 'react';
import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import OptionLabelSelector from '../OptionLabelSelector';

import {
    UsersQuery,
    UsersQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

import styles from './styles.css';

const USERS = gql`
    query Users(
        $search: String,
        $membersExcludeProject: ID,
        $membersExcludeFramework: ID,
        $membersExcludeUsergroup: ID,
        $page: Int,
        $pageSize: Int,
    ) {
        users(
            membersExcludeProject: $membersExcludeProject,
            membersExcludeFramework: $membersExcludeFramework,
            membersExcludeUsergroup: $membersExcludeUsergroup,
            search: $search,
            page: $page,
            pageSize: $pageSize,
        ) {
            page
            results {
                displayName
                id
                firstName
                lastName
                emailDisplay
            }
            totalCount
        }
    }
`;

export type User = {
    id: string;
    emailDisplay: string;
    displayName?: string | null | undefined;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
};
type Def = { containerClassName?: string };
type NewUserSelectInputProps<K extends string> = SearchSelectInputProps<
string,
    K,
    User,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    membersExcludeFramework?: string;
    membersExcludeProject?: string;
    membersExcludeUsergroup?: string;
};
function keySelector(d: User) {
    return d.id;
}

function labelSelector(d: User) {
    const displayName = d.displayName ?? `${d.firstName} ${d.lastName}`;
    return displayName;
}

function NewUserSelectInput<K extends string>(props: NewUserSelectInputProps<K>) {
    const {
        className,
        membersExcludeProject,
        membersExcludeFramework,
        membersExcludeUsergroup,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        membersExcludeFramework,
        membersExcludeProject,
        membersExcludeUsergroup,
        search: debouncedSearchText,
        page: 1,
        pageSize: 10,
    }), [
        membersExcludeProject,
        membersExcludeFramework,
        debouncedSearchText,
        membersExcludeUsergroup,
    ]);

    const { data, loading, fetchMore } = useQuery<UsersQuery, UsersQueryVariables>(
        USERS,
        {
            variables,
            skip: !opened,
        },
    );

    const handleShowMoreClick = useCallback(() => {
        fetchMore({
            variables: {
                ...variables,
                page: (data?.users?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.users) {
                    return previousResult;
                }
                const oldUsers = previousResult.users;
                const newUsers = fetchMoreResult?.users;

                if (!newUsers) {
                    return previousResult;
                }
                return ({
                    ...previousResult,
                    users: {
                        ...newUsers,
                        results: [
                            ...(oldUsers.results ?? []),
                            ...(newUsers.results ?? []),
                        ],
                    },
                });
            },
        });
    }, [
        fetchMore,
        variables,
        data?.users?.page,
    ]);

    return (
        <SearchSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            optionLabelSelector={OptionLabelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={data?.users?.results}
            optionsPending={loading}
            totalOptionsCount={data?.users?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
            optionsPopupClassName={styles.optionsPopup}
            handleShowMoreClick={handleShowMoreClick}
        />
    );
}

export default NewUserSelectInput;
