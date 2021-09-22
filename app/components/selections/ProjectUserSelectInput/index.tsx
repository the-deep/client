import React, { useState, useMemo } from 'react';
import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    ProjectUserQuery,
    ProjectUserQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

const PROJECT_USERS = gql`
    # query ProjectUser($search: String, $projectId: ID!) {
    query ProjectUser($projectId: ID!) {
        project(id: $projectId) {
            # members(search: $search) {
            members {
                id
                displayName
            }
        }
    }
`;

export type BasicProjectUser = NonNullable<NonNullable<NonNullable<ProjectUserQuery['project']>['members']>[number]>;
const keySelector = (d: BasicProjectUser) => d.id;
const labelSelector = (d: BasicProjectUser) => d.displayName ?? '';

type Def = { containerClassName?: string };
type ProjectUserSelectInputProps<K extends string> = SearchSelectInputProps<
    string,
    K,
    BasicProjectUser,
    Def,
    'keySelector' | 'labelSelector' | 'searchOptions' | 'onSearchValueChange' | 'optionsPending' | 'totalOptionsCount' | 'onShowDropdownChange'
> & { projectId: string };

function ProjectUserSelectInput<K extends string>(props: ProjectUserSelectInputProps<K>) {
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

    return (
        <SearchSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            searchOptions={data?.project?.members}
            onSearchValueChange={setSearchText}
            optionsPending={loading}
            onShowDropdownChange={setOpened}
            totalOptionsCount={undefined}
        />
    );
}

export default ProjectUserSelectInput;
