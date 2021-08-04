import React, { useState, useMemo } from 'react';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import { useRequest } from '#utils/request';
import {
    MultiResponse,
    GeoOption,
} from '#types';

import useDebouncedValue from '#hooks/useDebouncedValue';

const keySelector = (d: GeoOption) => d.key;
const labelSelector = (d: GeoOption) => d.label;

type Def = { containerClassName?: string };
type GeoSelectInputProps<K extends string> = SearchMultiSelectInputProps<
    string,
    K,
    GeoOption,
    Def,
    'onSearchValueChange'
    | 'searchOptions'
    | 'optionsPending'
    | 'keySelector'
    | 'labelSelector'
    | 'totalOptionsCount'
    | 'onShowDropdownChange'
> & {
    projectId: number;
};

function GeoMultiSelectInput<K extends string>(props: GeoSelectInputProps<K>) {
    const {
        className,
        options,
        projectId,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const geoOptionsRequestQueryParams = useMemo(() => ({
        label: debouncedSearchText,
        limit: 20,
    }), [debouncedSearchText]);

    const {
        pending: pendingGeoOptions,
        response: geoOptions,
    } = useRequest<MultiResponse<GeoOption>>({
        skip: !opened,
        url: `server://projects/${projectId}/geo-area/`,
        method: 'GET',
        query: geoOptionsRequestQueryParams,
        schemaName: 'geoOptions',
        failureHeader: 'Geo options',
    });

    return (
        <SearchMultiSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            options={options}
            searchOptions={geoOptions?.results}
            optionsPending={pendingGeoOptions}
            totalOptionsCount={geoOptions?.count}
            onShowDropdownChange={setOpened}
        />
    );
}

export default GeoMultiSelectInput;
