import React, { useState, useMemo } from 'react';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import { MultiResponse, BasicUser } from '#typings';

import { useRequest } from '#utils/request';
import useDebouncedValue from '#hooks/useDebouncedValue';
import _ts from '#ts';
import { notifyOnFailure } from '#utils/requestNotify';

type Def = { containerClassName?: string };
type UserMultiSelectInputProps<K extends string> = SearchMultiSelectInputProps<
    number,
    K,
    BasicUser,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    queryParams?: Record<string, string | number | boolean>
};
const keySelector = (d: BasicUser) => d.id;
const labelSelector = (d: BasicUser) => d.displayName;

function UserMultiSelectInput<K extends string>(props: UserMultiSelectInputProps<K>) {
    const {
        className,
        queryParams,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const searchQueryParams = useMemo(() => ({
        search: debouncedSearchText,
        fields: ['id', 'display_name', 'email'],
        ...queryParams,
    }), [debouncedSearchText, queryParams]);

    const {
        pending: userSearchPending,
        response: users,
    } = useRequest<MultiResponse<BasicUser>>(
        {
            url: 'server://users/',
            method: 'GET',
            skip: !opened,
            query: searchQueryParams,
            schemaName: 'usersGetResponse',
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('components.userSelectInput', 'title'))({ error: errorBody }),
        },
    );

    return (
        <SearchMultiSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={users?.results}
            optionsPending={userSearchPending}
            totalOptionsCount={users?.count}
            onShowDropdownChange={setOpened}
        />
    );
}

export default UserMultiSelectInput;
