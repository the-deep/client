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
import OptionLabelSelector from '../OptionLabelSelector';

import styles from './styles.css';

const PROJECT_USERS = gql`
    query ProjectMultiUser($search: String, $projectId: ID!) {
        project(id: $projectId) {
            id
            userMembers(search: $search) {
                results {
                    id
                    member {
                        id
                        displayName
                        emailDisplay
                    }
                }
                totalCount
            }
        }
    }
`;

export type ProjectMember = NonNullable<NonNullable<NonNullable<NonNullable<ProjectUserQuery['project']>['userMembers']>['results']>[number]>['member'];
export const keySelector = (d: ProjectMember) => d.id;
export const labelSelector = (d: ProjectMember) => d.displayName ?? '';

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
            optionLabelSelector={OptionLabelSelector}
            searchOptions={members}
            onSearchValueChange={setSearchText}
            optionsPending={loading}
            onShowDropdownChange={setOpened}
            totalOptionsCount={data?.project?.userMembers?.totalCount ?? undefined}
            optionsPopupClassName={styles.optionsPopup}
        />
    );
}

export default ProjectUserMultiSelectInput;
