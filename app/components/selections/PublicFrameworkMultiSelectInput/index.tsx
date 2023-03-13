import React, { useState, useMemo } from 'react';

import {
    SearchMultiSelectInput,
    SearchMultiSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    PublicAnalysisFrameworkOptionsQuery,
    PublicAnalysisFrameworkOptionsQueryVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';

const PUBLIC_ANALYSIS_FRAMEWORKS = gql`
    query PublicAnalysisFrameworkOptions($search: String) {
        publicAnalysisFrameworks(search: $search) {
            totalCount
            results {
                id
                title
            }
        }
    }
`;

export type AnalysisFramework = NonNullable<NonNullable<NonNullable<PublicAnalysisFrameworkOptionsQuery['publicAnalysisFrameworks']>['results']>[number]>;

type Def = { containerClassName?: string };
type PublicAnalysisFrameworkMultiSelectInputProps<
    K extends string,
    GK extends string
> = SearchMultiSelectInputProps<
    string,
    K,
    GK,
    AnalysisFramework,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;

export const keySelector = (d: AnalysisFramework) => d.id;
export const labelSelector = (d: AnalysisFramework) => d.title;

function PublicAnalysisFrameworkSearchMultiSelectInput<K extends string, GK extends string>(
    props: PublicAnalysisFrameworkMultiSelectInputProps<K, GK>,
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
    } = useQuery<PublicAnalysisFrameworkOptionsQuery, PublicAnalysisFrameworkOptionsQueryVariables>(
        PUBLIC_ANALYSIS_FRAMEWORKS,
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
            searchOptions={data?.publicAnalysisFrameworks?.results}
            optionsPending={loading}
            totalOptionsCount={data?.publicAnalysisFrameworks?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
        />
    );
}

export default PublicAnalysisFrameworkSearchMultiSelectInput;
