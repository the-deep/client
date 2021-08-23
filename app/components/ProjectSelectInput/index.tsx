import React, { useState, useMemo } from 'react';
import { SearchSelectInput, SearchSelectInputProps } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    MyProjectsQuery,
    MyProjectsQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

const MY_PROJECTS = gql`
    query MyProjects($search: String) {
        projects(search: $search, isCurrentUserMember: true) {
            results {
                id
                title
                isPrivate
            }
            totalCount
            page
            pageSize
        }
    }
`;

type BasicProject = NonNullable<NonNullable<NonNullable<MyProjectsQuery['projects']>['results']>[number]>;

type Def = { containerClassName?: string };
type ProjectSelectInputProps<K extends string> = SearchSelectInputProps<
    string,
    K,
    BasicProject,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;
const keySelector = (d: BasicProject) => d.id;
const labelSelector = (d: BasicProject) => d.title;
function ProjectSelectInput<K extends string>(props: ProjectSelectInputProps<K>) {
    const {
        className,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(
        (): MyProjectsQueryVariables => ({
            search: debouncedSearchText,
        }),
        [debouncedSearchText],
    );

    const { data, loading } = useQuery<MyProjectsQuery, MyProjectsQueryVariables>(
        MY_PROJECTS,
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
            onSearchValueChange={setSearchText}
            searchOptions={data?.projects?.results}
            optionsPending={loading}
            totalOptionsCount={data?.projects?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
        />
    );
}

export default ProjectSelectInput;
