import React, { useState, useMemo, useCallback } from 'react';
import { SearchSelectInput, SearchSelectInputProps } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    MyProjectsQuery,
    MyProjectsQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

const MY_PROJECTS = gql`
    query MyProjects(
        $search: String,
        $page: Int,
        $pageSize: Int,
    ) {
        projects(
            search: $search,
            isCurrentUserMember: true,
            page: $page,
            pageSize: $pageSize,
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

type BasicProject = NonNullable<NonNullable<NonNullable<MyProjectsQuery['projects']>['results']>[number]>;

type Def = { containerClassName?: string };
type ProjectSelectInputProps<K extends string, GK extends string> = SearchSelectInputProps<
    string,
    K,
    GK,
    BasicProject,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;
const keySelector = (d: BasicProject) => d.id;
const labelSelector = (d: BasicProject) => d.title;
function ProjectSelectInput<K extends string, GK extends string>(
    props: ProjectSelectInputProps<K, GK>,
) {
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
            page: 1,
            pageSize: 10,
        }),
        [debouncedSearchText],
    );

    const {
        data,
        loading,
        fetchMore,
    } = useQuery<MyProjectsQuery, MyProjectsQueryVariables>(
        MY_PROJECTS,
        {
            variables,
            skip: !opened,
        },
    );

    const handleShowMoreClick = useCallback(() => {
        fetchMore({
            variables: {
                ...variables,
                page: (data?.projects?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.projects) {
                    return previousResult;
                }

                const oldProjects = previousResult.projects;
                const newProjects = fetchMoreResult?.projects;

                if (!newProjects) {
                    return previousResult;
                }

                return ({
                    ...previousResult,
                    projects: {
                        ...newProjects,
                        results: [
                            ...(oldProjects.results ?? []),
                            ...(newProjects.results ?? []),
                        ],
                    },
                });
            },
        });
    }, [
        fetchMore,
        variables,
        data?.projects?.page,
    ]);

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
            handleShowMoreClick={handleShowMoreClick}
        />
    );
}

export default ProjectSelectInput;
