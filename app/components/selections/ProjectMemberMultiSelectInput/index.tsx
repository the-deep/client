import React, { useState, useMemo } from 'react';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    ProjectMemberOptionsQuery,
    ProjectMemberOptionsQueryVariables,
} from '#generated/types';

export type ProjectMember = NonNullable<ProjectMemberOptionsQuery['project']>['members'][number];
const PROJECTMEMBERS = gql`
    query ProjectMemberOptions($projectId: ID!) {
        project(id: $projectId) {
            members {
                id
                displayName
                firstName
                lastName
            }
        }
    }
`;

const keySelector = (d: ProjectMember) => d.id;
const labelSelector = (d: ProjectMember) => d.displayName ?? `${d.firstName} ${d.lastName}`;

type Def = { containerClassName?: string };
type Props<K extends string> = SearchMultiSelectInputProps<
    string,
    K,
    ProjectMember,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    projectId: string;
};

function ProjectMemberMultiSelectInput<K extends string>(props: Props<K>) {
    const {
        className,
        projectId,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const variables = useMemo(() => ({
        projectId,
    }), [projectId]);

    const {
        data,
        loading,
    } = useQuery<ProjectMemberOptionsQuery, ProjectMemberOptionsQueryVariables>(
        PROJECTMEMBERS,
        {
            variables,
            skip: !opened,
        },
    );
    return (
        <SearchMultiSelectInput
            {...otherProps}
            className={className}
            searchOptions={data?.project?.members}
            keySelector={keySelector}
            labelSelector={labelSelector}
            optionsPending={loading}
            onShowDropdownChange={setOpened}
        />
    );
}

export default ProjectMemberMultiSelectInput;
