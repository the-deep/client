import React, { useState, useMemo } from 'react';

import {
    SearchMultiSelectInput,
    SearchMultiSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    AnalysisFrameworkOptionsQuery,
    AnalysisFrameworkOptionsQueryVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';

const ANALYSIS_FRAMEWORKS = gql`
    query AnalysisFrameworkOptions($search: String) {
        analysisFrameworks(search: $search) {
            totalCount
            results {
                id
                title
            }
        }
    }
`;

export type AnalysisFramework = NonNullable<NonNullable<NonNullable<AnalysisFrameworkOptionsQuery['analysisFrameworks']>['results']>[number]>;

type Def = { containerClassName?: string };
type AnalysisFrameworkMultiSelectInputProps<K extends string> = SearchMultiSelectInputProps<
    string,
    K,
    AnalysisFramework,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;

const keySelector = (d: AnalysisFramework) => d.id;
const labelSelector = (d: AnalysisFramework) => d.title;

function AnalysisFrameworkSearchMultiSelectInput<K extends string>(
    props: AnalysisFrameworkMultiSelectInputProps<K>,
) {
    const {
        className,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        search: debouncedSearchText,
    }), [debouncedSearchText]);

    const {
        data,
        loading,
    } = useQuery<AnalysisFrameworkOptionsQuery, AnalysisFrameworkOptionsQueryVariables>(
        ANALYSIS_FRAMEWORKS,
        {
            variables,
            skip: !opened,
        },
    );

    return (
        <SearchMultiSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={data?.analysisFrameworks?.results}
            optionsPending={loading}
            totalOptionsCount={data?.analysisFrameworks?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
        />
    );
}

export default AnalysisFrameworkSearchMultiSelectInput;
