import React, { useState, useMemo } from 'react';
import {
    caseInsensitiveSubmatch,
    isFalsyString,
} from '@togglecorp/fujs';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import {
    GeoOption,
} from '#typings';

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
    | 'onOptionsChange'
>;

function GeoMultiSelectInput<K extends string>(props: GeoSelectInputProps<K>) {
    const {
        className,
        options,
        ...otherProps
    } = props;

    const [, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const searchOptions = useMemo(() => {
        const filteredOptions = options?.filter((option) => {
            const searchFilter = isFalsyString(debouncedSearchText)
                || caseInsensitiveSubmatch(option.label, debouncedSearchText);
            return searchFilter;
        });
        if (filteredOptions && (filteredOptions.length ?? 0 > 50)) {
            filteredOptions.length = 50;
        }
        return filteredOptions;
    }, [debouncedSearchText, options]);

    return (
        <SearchMultiSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            options={options}
            searchOptions={searchOptions}
            optionsPending={false}
            totalOptionsCount={options?.length}
            onShowDropdownChange={setOpened}
        />
    );
}

export default GeoMultiSelectInput;
