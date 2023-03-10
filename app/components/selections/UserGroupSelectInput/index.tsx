import React, { useState, useMemo } from 'react';
import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    UsergroupsQuery,
    UsergroupsQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

const USERGROUPS = gql`
    query Usergroups($search: String, $membersExcludeProject: ID) {
        userGroups(
            search: $search,
            membersExcludeProject: $membersExcludeProject,
        ) {
            results {
                id
                title
            }
            totalCount
        }
    }
`;

export type Usergroup = NonNullable<NonNullable<NonNullable<UsergroupsQuery['userGroups']>['results']>[number]>;
type Def = { containerClassName?: string };
type UserGroupSelectInputProps<K extends string, GK extends string> = SearchSelectInputProps<
string,
    K,
    GK,
    Usergroup,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    membersExcludeProject?: string;
};
function keySelector(d: Usergroup) {
    return d.id;
}

function labelSelector(d: Usergroup) {
    return d.title;
}

function UserGroupSelectInput<K extends string, GK extends string>(
    props: UserGroupSelectInputProps<K, GK>,
) {
    const {
        className,
        membersExcludeProject,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        membersExcludeProject,
        search: debouncedSearchText,
    }), [membersExcludeProject, debouncedSearchText]);

    const { data, loading } = useQuery<UsergroupsQuery, UsergroupsQueryVariables>(
        USERGROUPS,
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
            searchOptions={data?.userGroups?.results}
            optionsPending={loading}
            totalOptionsCount={data?.userGroups?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
        />
    );
}

export default UserGroupSelectInput;
