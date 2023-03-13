import React, { useState, useMemo } from 'react';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    ProjectPermission,
    ProjectsListQuery,
    ProjectsListQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

const PROJECTS_LIST = gql`
    query ProjectsList(
        $search: String,
        $excludedProjects: [ID!],
        $permissionAccess: ProjectPermission,
        $myProjectsShown: Boolean,
    ) {
        projects(
            search: $search,
            isCurrentUserMember: $myProjectsShown,
            hasPermissionAccess: $permissionAccess,
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
type ProjectMultiSelectInputProps<
    K extends string,
    GK extends string
> = SearchMultiSelectInputProps<
    string,
    K,
    GK,
    BasicProject,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    excludedProjects?: string[],
    permissionAccess?: ProjectPermission,
    myProjectsShown?: boolean,
};

const keySelector = (d: BasicProject) => d.id;
const labelSelector = (d: BasicProject) => d.title;
function ProjectMultiSelectInput<K extends string, GK extends string>(
    props: ProjectMultiSelectInputProps<K, GK>,
) {
    const {
        className,
        excludedProjects,
        permissionAccess,
        myProjectsShown,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(
        (): ProjectsListQueryVariables => ({
            search: debouncedSearchText,
            excludedProjects,
            permissionAccess,
            myProjectsShown,
        }),
        [
            debouncedSearchText,
            excludedProjects,
            permissionAccess,
            myProjectsShown,
        ],
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
