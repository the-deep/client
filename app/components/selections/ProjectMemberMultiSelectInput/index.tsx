import React, { useState, useMemo } from 'react';
import {
    SearchMultiSelectInput,
    SearchMultiSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    ProjectUserQuery,
    ProjectUserQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

const PROJECT_USERS = gql`
    query ProjectUser($search: String, $projectId: ID!) {
        project(id: $projectId) {
            id
            userMembers(search: $search) {
                results {
                    id
                    member {
                        id
                        displayName
                    }
                }
                totalCount
            }
        }
    }
`;

export type ProjectMember = NonNullable<NonNullable<NonNullable<NonNullable<ProjectUserQuery['project']>['userMembers']>['results']>[number]>['member'];
const keySelector = (d: ProjectMember) => d.id;
const labelSelector = (d: ProjectMember) => d.displayName ?? '';

type Def = { containerClassName?: string };
type ProjectUserSelectInputProps<K extends string> = SearchMultiSelectInputProps<
    string,
    K,
    ProjectMember,
    Def,
    'keySelector' | 'labelSelector' | 'searchOptions' | 'onSearchValueChange' | 'optionsPending' | 'totalOptionsCount' | 'onShowDropdownChange'
> & { projectId: string };

function ProjectUserMultiSelectInput<K extends string>(props: ProjectUserSelectInputProps<K>) {
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

    const { data, loading } = useQuery<ProjectUserQuery, ProjectUserQueryVariables>(
        PROJECT_USERS,
        {
            variables,
            skip: !opened,
        },
    );

    const projectMembers = data?.project?.userMembers?.results;

    const members = useMemo(
        () => projectMembers?.map((item) => item.member),
        [projectMembers],
    );

    return (
        <SearchMultiSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            searchOptions={members}
            onSearchValueChange={setSearchText}
            optionsPending={loading}
            onShowDropdownChange={setOpened}
            totalOptionsCount={data?.project?.userMembers?.totalCount ?? undefined}
        />
    );
}

export default ProjectUserMultiSelectInput;
