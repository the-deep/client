import React, { useState, useMemo } from 'react';

import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';

import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    Region,
    MultiResponse,
} from '#types';
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
> & { projectId: number };

function RegionSelectInput<K extends string>(props: RegionSelectInputProps<K>) {
    const {
        className,
        projectId,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const searchQueryParams = useMemo(() => ({
        search: debouncedSearchText,
        exclude_project: projectId,
        limit: 20,
    }), [debouncedSearchText, projectId]);

    const {
        pending: regionSearchPending,
        response: regions,
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
            searchOptions={regions?.results}
            optionsPending={regionSearchPending}
            totalOptionsCount={regions?.count}
            onShowDropdownChange={setOpened}
        />
    );
}

export default RegionSelectInput;
