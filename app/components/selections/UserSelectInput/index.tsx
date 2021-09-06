import React, { useState, useMemo } from 'react';
import { SearchSelectInput, SearchSelectInputProps } from '@the-deep/deep-ui';
import { MultiResponse, BasicUser } from '#types';

import { useRequest } from '#base/utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';
import _ts from '#ts';

type Def = { containerClassName?: string };
type UserSelectInputProps<K extends string> = SearchSelectInputProps<
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

function UserSelectInput<K extends string>(props: UserSelectInputProps<K>) {
    const {
        className,
        queryParams,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const searchQueryParams = useMemo(() => ({
        search: debouncedSearchText,
        fields: ['id', 'display_name', 'email'],
        limit: 20,
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
            failureHeader: _ts('components.userSelectInput', 'title'),
        },
    );

    return (
        <SearchSelectInput
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

export default UserSelectInput;
