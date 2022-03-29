import React, { useState, useMemo } from 'react';
import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    UsersQuery,
    UsersQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';
import styles from './styles.css';

const USERS = gql`
    query Users($search: String, $membersExcludeProject: ID, $membersExcludeUsergroup: ID) {
        users(
            membersExcludeProject: $membersExcludeProject,
            membersExcludeUsergroup: $membersExcludeUsergroup,
            search: $search,
        ) {
            results {
                displayName
                id
                organization
                firstName
                lastName
                emailDisplay
            }
            totalCount
        }
    }
`;

export type User = NonNullable<NonNullable<NonNullable<UsersQuery['users']>['results']>[number]>;
type Def = { containerClassName?: string };
type NewUserSelectInputProps<K extends string> = SearchSelectInputProps<
string,
    K,
    User,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
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

function optionLabelSelector(d: User) {
    const displayName = d.displayName ?? `${d.firstName} ${d.lastName}`;
    return (
        <div className={styles.option}>
            <div className={styles.displayName}>
                {displayName}
            </div>
            <div className={styles.email}>
                {d.emailDisplay}
            </div>
        </div>
    );
}

function NewUserSelectInput<K extends string>(props: NewUserSelectInputProps<K>) {
    const {
        className,
        membersExcludeProject,
        membersExcludeUsergroup,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        membersExcludeProject,
        membersExcludeUsergroup,
        search: debouncedSearchText,
    }), [membersExcludeProject, debouncedSearchText, membersExcludeUsergroup]);

    const { data, loading } = useQuery<UsersQuery, UsersQueryVariables>(
        USERS,
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
            optionLabelSelector={optionLabelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={data?.users?.results}
            optionsPending={loading}
            totalOptionsCount={data?.users?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
            optionsPopupClassName={styles.optionsPopup}
            optionsPopupContentClassName={styles.optionsPopupContent}
        />
    );
}

export default NewUserSelectInput;
