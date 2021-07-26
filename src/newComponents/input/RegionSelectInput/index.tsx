import React, { useState, useMemo } from 'react';

import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';

import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    Region,
    MultiResponse,
} from '#typings';
import { useRequest } from '#utils/request';
import _ts from '#ts';

const keySelector = (d: Region) => d.id;
const labelSelector = (d: Region) => d.title;

type Def = { containerClassName?: string;}
type RegionSelectInputProps<K extends string> = SearchSelectInputProps<
    number,
    K,
    Region,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & { activeProject: number };

function RegionSelectInput<K extends string>(props: RegionSelectInputProps<K>) {
    const {
        className,
        activeProject,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const searchQueryParams = useMemo(() => ({
        search: debouncedSearchText,
        exclude_project: activeProject,
    }), [debouncedSearchText, activeProject]);

    const {
        pending: organizationSearchPending,
        response: organizations,
    } = useRequest<MultiResponse<Region>>(
        {
            url: 'server://regions/',
            method: 'GET',
            skip: !opened,
            query: searchQueryParams,
            failureHeader: _ts('components.regionSelectInput', 'title'),
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

export default RegionSelectInput;
