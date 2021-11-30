import React, { useState, useMemo } from 'react';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    ProjectsListQuery,
    ProjectsListQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

const PROJECTS_LIST = gql`
    query ProjectsList(
        $search: String,
        $excludedProjects: [ID!],
    ) {
        projects(
            search: $search,
            isCurrentUserMember: true,
            excludeIds: $excludedProjects,
        ) {
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

export type BasicProject = NonNullable<NonNullable<NonNullable<ProjectsListQuery['projects']>['results']>[number]>;

type Def = { containerClassName?: string };
type ProjectMultiSelectInputProps<K extends string> = SearchMultiSelectInputProps<
    string,
    K,
    BasicProject,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & { excludedProjects?: string[] };

const keySelector = (d: BasicProject) => d.id;
const labelSelector = (d: BasicProject) => d.title;
function ProjectMultiSelectInput<K extends string>(props: ProjectMultiSelectInputProps<K>) {
    const {
        className,
        excludedProjects,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(
        (): ProjectsListQueryVariables => ({
            search: debouncedSearchText,
            excludedProjects,
        }),
        [debouncedSearchText, excludedProjects],
    );

    const { data, loading } = useQuery<ProjectsListQuery, ProjectsListQueryVariables>(
        PROJECTS_LIST,
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
            searchOptions={data?.projects?.results}
            optionsPending={loading}
            totalOptionsCount={data?.projects?.totalCount ?? undefined}
            onShowDropdownChange={setOpened}
            selectionListShown
        />
    );
}

export default ProjectMultiSelectInput;
