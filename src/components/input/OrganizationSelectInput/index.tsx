import React, { useState, useMemo } from 'react';
import { SearchSelectInput, SearchSelectInputProps } from '@the-deep/deep-ui';
import { BasicOrganization, MultiResponse } from '#typings';

import { useRequest } from '#utils/request';
import useDebouncedValue from '#hooks/useDebouncedValue';
import _ts from '#ts';
import { notifyOnFailure } from '#utils/requestNotify';

type Def = { containerClassName?: string };
type OrganizationSelectInputProps<K extends string> = SearchSelectInputProps<
    number,
    K,
    BasicOrganization,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;
const keySelector = (d: BasicOrganization) => d.id;
const labelSelector = (d: BasicOrganization) => d.title;
function OrganizationSelectInput<K extends string>(props: OrganizationSelectInputProps<K>) {
    const {
        className,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const searchQueryParams = useMemo(() => ({
        search: debouncedSearchText,
    }), [debouncedSearchText]);

    const {
        pending: organizationSearchPending,
        response: organizations,
    } = useRequest<MultiResponse<BasicOrganization>>(
        {
            url: 'server://organizations/',
            method: 'GET',
            skip: !opened,
            query: searchQueryParams,
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('components.organizationSelectInput', 'title'))({ error: errorBody }),
        },
    );

    return (
        <SearchSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={organizations?.results}
            optionsPending={organizationSearchPending}
            totalOptionsCount={organizations?.count}
            onShowDropdownChange={setOpened}
        />
    );
}

export default OrganizationSelectInput;
