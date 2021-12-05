import React, { useState, useMemo } from 'react';
import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    LeadGroupsQuery,
    LeadGroupsQueryVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';

const LEAD_GROUPS = gql`
    query LeadGroups($search: String, $projectId: ID!) {
        project(id: $projectId) {
            id
            leadGroups(search: $search) {
                results {
                    id
                    title
                }
                totalCount
            }
        }
    }
`;

export type BasicLeadGroup = NonNullable<NonNullable<NonNullable<NonNullable<LeadGroupsQuery['project']>['leadGroups']>['results']>[number]>;
const keySelector = (d: BasicLeadGroup) => d.id;
const labelSelector = (d: BasicLeadGroup) => d.title;

type Def = { containerClassName?: string };
type LeadGroupSelectInputProps<K extends string> = SearchSelectInputProps<
    string,
    K,
    BasicLeadGroup,
    Def,
    'keySelector' | 'labelSelector' | 'searchOptions' | 'onSearchValueChange' | 'optionsPending' | 'totalOptionsCount' | 'onShowDropdownChange'
> & { projectId: string };

function LeadGroupSelectInput<K extends string>(props: LeadGroupSelectInputProps<K>) {
    const {
        className,
        projectId,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        search: debouncedSearchText,
        projectId,
    }), [debouncedSearchText, projectId]);

    const { data, loading } = useQuery<LeadGroupsQuery, LeadGroupsQueryVariables>(
        LEAD_GROUPS,
        {
            variables,
            skip: !opened,
        },
    );

    return (
        <SearchSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            searchOptions={data?.project?.leadGroups?.results}
            onSearchValueChange={setSearchText}
            optionsPending={loading}
            totalOptionsCount={data?.project?.leadGroups?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
        />
    );
}

export default LeadGroupSelectInput;
