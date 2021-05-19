import React, { useState, useMemo } from 'react';
import { SearchSelectInput, SearchSelectInputProps } from '@the-deep/deep-ui';
import { Organization, MultiResponse } from '#typings';

import { useRequest } from '#utils/request';
import useDebouncedValue from '#hooks/useDebouncedValue';
import _ts from '#ts';
import { notifyOnFailure } from '#utils/requestNotify';

type Def = { containerClassName?: string };
type OrganizationSelectInputProps<K extends string> = SearchSelectInputProps<
    number,
    K,
    Organization,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount'
>;
const keySelector = (d: Organization) => d.id;
const labelSelector = (d: Organization) => d.title;
function OrganizationSelectInput<K extends string>(props: OrganizationSelectInputProps<K>) {
    const {
        className,
        ...otherProps
    } = props;

    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const searchQueryParams = useMemo(() => ({
        search: debouncedSearchText,
    }), [debouncedSearchText]);

    const {
        pending: organizationSearchPending,
        response: organizations,
    } = useRequest<MultiResponse<Organization>>(
        {
            url: 'server://organizations/',
            method: 'GET',
            query: searchQueryParams,
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('assignment', 'markAsDoneFailed'))({ error: errorBody }),
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
        />
    );
}

export default OrganizationSelectInput;
