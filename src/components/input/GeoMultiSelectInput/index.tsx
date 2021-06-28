import React, { useState, useMemo } from 'react';
import {
    caseInsensitiveSubmatch,
    isTruthyString,
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

    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const {
        searchOptions,
        filteredOptionsLength,
    } = useMemo(() => {
        let filteredOptions = options;
        if (isTruthyString(debouncedSearchText)) {
            filteredOptions = options?.filter(option => (
                caseInsensitiveSubmatch(option.label, debouncedSearchText)
            ));
        }
        if (filteredOptions && (filteredOptions.length ?? 0 > 50)) {
            return ({
                searchOptions: filteredOptions.slice(0, 50),
                filteredOptionsLength: filteredOptions.length,
            });
        }
        return {
            searchOptions: filteredOptions,
            filteredOptionsLength: filteredOptions?.length,
        };
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
            totalOptionsCount={filteredOptionsLength}
        />
    );
}

export default GeoMultiSelectInput;
